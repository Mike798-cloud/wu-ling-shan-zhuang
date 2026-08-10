(()=>{'use strict';
const D=window.WL_DATA;
if(!D)return;

// 2.5.1：证物来源、隐藏证物计数与旧案推理链修复。
D.version='2.5.1';
D.hiddenEvidence=['E30'];
const hiddenSet=new Set(D.hiddenEvidence);

const findSpot=(loc,id)=>D.locations?.[loc]?.spots?.find(s=>s[0]===id);

// E14 只属于唐砚新案的“晴峰窗槽”。07旧站房的窗槽仍是重要现场观察，
// 但不再错误登记为 E14，避免旧案现场生成“新案现场”证物并提前满足 D03。
const oldWindow=findSpot('room07','dust');
if(oldWindow){
  oldWindow[2]='积尘层连续，窗扣长期未动。此处只用于复原2011旧案的初始密室判断，不登记唐砚新案证物。';
  oldWindow[3]=null;
}

// 旧缆车站“施工残迹”过去错误发放 E20（1998事故胶卷）。
// E20 应在地下档案室核对事故胶卷后取得，避免前期现场观察提前穿透档案流程。
const stationProject=findSpot('station','project');
if(stationProject){
  stationProject[2]='封闭后仍可见非公开加固施工遗留。现场残迹仅作为环境观察；1998事故胶卷须到地下档案室核对原件。';
  stationProject[3]=null;
}

// E33 原数据存在，但没有正常 UI 获取入口。补到餐厅停电调查中。
const dining=D.locations?.dining?.spots;
if(Array.isArray(dining)&&!dining.some(s=>s[3]==='E33')){
  dining.push(['emergency','应急灯领取登记','停电后的值守登记显示：23:41，沈知遥领取一盏应急灯并留下本人签名。','E33']);
}

// E34 是旧站控制柜中实际可取得的录音，不应在证物列表里把来源写成“隐藏”。
if(D.evidence?.E34)D.evidence.E34[1]='旧缆车站';

// 林岳线提示：明确 E30/E33 不是 D06/D09 前置，同时保持独立调查模式不主动显示提示。
if(D.hints?.culprit){
  D.hints.culprit=[
    'D12只解决唐砚案的第二轮干预；林岳线要先单独形成“受伤后自行返回07房”的中间推论。E30与E33都不是这条线的前置。',
    '回看林岳旧伤记录、旧站血滴方向和旧站红色绝缘纤维：三条材料共同回答“他受伤后是否还能自行离开旧站”。',
    'E18＋E19＋E26形成D06；随后D06＋E34＋D12形成D09。E30是隐藏结局奖励，E33是餐厅补充记录，均不参与这两步。'
  ];
}

// 修复尚未形成 D03 的旧存档：如果 E14 只可能来自旧版07窗槽误发，移除这条错误取得记录。
// 已经形成 D03 的旧档不强制回退，避免玩家已有主线进度被破坏。
function repairStoredSave(){
  try{
    const key=D.saveKey,raw=localStorage.getItem(key);
    if(!raw)return;
    const s=JSON.parse(raw);
    if(!s||s._hotfix251)return;
    const seen=new Set(Array.isArray(s.seenSpots)?s.seenSpots:[]);
    const evidence=Array.isArray(s.evidence)?s.evidence:[];
    const deductions=Array.isArray(s.deductions)?s.deductions:[];
    const e14OnlyFromOldRoom=seen.has('room07:dust')&&!seen.has('room09:window')&&!seen.has('yard:sill');
    if(e14OnlyFromOldRoom&&evidence.includes('E14')&&!deductions.includes('D03')){
      s.evidence=evidence.filter(id=>id!=='E14');
    }
    s._hotfix251=true;
    localStorage.setItem(key,JSON.stringify(s));
  }catch{}
}
repairStoredSave();

function getState(){
  try{return window.__WL_TEST__?.state?.()||null}catch{return null}
}
function regularEvidenceIds(){return Object.keys(D.evidence||{}).filter(id=>!hiddenSet.has(id))}
function regularCount(s){return (s?.evidence||[]).filter(id=>!hiddenSet.has(id)).length}
function countText(s){
  const hidden=(s?.evidence||[]).filter(id=>hiddenSet.has(id)).length;
  return `常规证物 ${regularCount(s)}/${regularEvidenceIds().length} · 隐藏证物 ${hidden?hidden:'?'}/${hiddenSet.size}`;
}
function setText(el,text){if(el&&el.textContent!==text)el.textContent=text}
function patchUi(){
  const s=getState();
  if(!s)return;
  const footer=[...document.querySelectorAll('.statusbar span')].find(el=>/^证物\s/.test(el.textContent||'')||/^常规证物\s/.test(el.textContent||''));
  setText(footer,countText(s));

  const facts=[...document.querySelectorAll('.facts-mini span')].find(el=>/^证物\s/.test(el.textContent||'')||/^常规证物\s/.test(el.textContent||''));
  setText(facts,`常规证物 ${regularCount(s)}/${regularEvidenceIds().length}`);

  const ending=[...document.querySelectorAll('.ending-stats span')].find(el=>/^证物\s/.test(el.textContent||'')||/^常规证物\s/.test(el.textContent||''));
  setText(ending,countText(s));

  const rule=document.querySelector('.evidence-desk .raw-rule');
  if(rule&&!rule.querySelector('[data-hidden-evidence-note]')){
    const p=document.createElement('p');
    p.dataset.hiddenEvidenceNote='1';
    p.className='tiny';
    p.textContent='常规证物进度不包含隐藏结局奖励 E30；E30 只会在满足“第十张”结局条件后取得，因此正常调查中不再显示为缺失证物。';
    rule.appendChild(p);
  }

  // 仅在“初次侦探”模式、已经拿到 D12 却还缺 D06 时给出链条层级说明，
  // 不直接替玩家完成组合，也不影响独立调查模式。
  const dedResults=document.querySelector('.deduction-room .ded-results');
  const needLin=s.mode==='newbie'&&(s.deductions||[]).includes('D12')&&!(s.deductions||[]).includes('D06');
  const oldNote=document.querySelector('[data-lin-chain-note]');
  if(needLin&&dedResults&&!oldNote){
    const note=document.createElement('div');
    note.dataset.linChainNote='1';
    note.className='success-note';
    note.innerHTML='<b>林岳线仍缺一个中间推论</b><p>D12只属于唐砚案。先把“旧伤记录＋旧站血滴方向＋鞋底纤维”组成林岳受伤后的行动链，再去连接旧站录音与D12。</p>';
    dedResults.appendChild(note);
  }else if(!needLin&&oldNote){oldNote.remove()}
}

let queued=false;
const scheduleUi=()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;patchUi()})};
if(typeof MutationObserver!=='undefined'){
  const observer=new MutationObserver(scheduleUi);
  observer.observe(document.documentElement,{childList:true,subtree:true});
}
window.addEventListener('DOMContentLoaded',scheduleUi,{once:true});
setTimeout(scheduleUi,0);

// 比原 selfTest 更严格：验证常规证物都存在真实获取入口，并检查本次三个关键来源修复。
function audit(){
  const sourceIds=new Set(['E01','E02','E09','E10','E11','E21','E23','E29','E31','E32','E44']);
  for(const loc of Object.values(D.locations||{}))for(const s of (loc.spots||[]))if(s[3])sourceIds.add(s[3]);
  for(const p of (D.people||[]))for(const id of (p.oldEvidence||[]))sourceIds.add(id);
  const missing=regularEvidenceIds().filter(id=>!sourceIds.has(id));
  const errs=[];
  if(findSpot('room07','dust')?.[3])errs.push('room07-dust-still-awards-evidence');
  if(findSpot('station','project')?.[3])errs.push('station-project-still-awards-E20');
  if(!dining?.some(s=>s[3]==='E33'))errs.push('E33-no-ui-source');
  if(D.evidence?.E34?.[1]!=='旧缆车站')errs.push('E34-source-label');
  if(!hiddenSet.has('E30'))errs.push('E30-not-hidden');
  if(missing.length)errs.push('regular-evidence-without-source:'+missing.join(','));
  const result={ok:errs.length===0,errors:errs,missingRegularEvidence:missing,regularTotal:regularEvidenceIds().length,hidden:[...hiddenSet]};
  console.info('[雾岭山庄 hotfix 2.5.1 audit]',result.ok?'PASS':result);
  return result;
}
window.WL_HOTFIX_TEST={audit,regularEvidenceIds,hiddenEvidenceIds:()=>[...hiddenSet]};
setTimeout(audit,0);
})();
