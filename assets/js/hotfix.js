(()=>{'use strict';
const D=window.WL_DATA;
if(!D)return;

// 2.5.2：延续 2.5.1 证物来源/隐藏证物修复，并修复 D07 乱序推理与阶段目标停滞。
D.version='2.5.2';
D.hiddenEvidence=['E30'];
const hiddenSet=new Set(D.hiddenEvidence);

const findSpot=(loc,id)=>D.locations?.[loc]?.spots?.find(s=>s[0]===id);
const sameSet=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every(x=>b.includes(x));

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

// D07 原先只认可 D05 + D06 + E25。玩家若已先形成信息量更强的 D12，
// 会自然使用 D06 + D12 + E25 比较两起密室，却被系统判定“材料不足”。
// 新增等价且更符合后期实际推理顺序的组合，不删除旧组合，兼容所有旧存档/攻略。
const d07=(D.deductions||[]).find(d=>d.id==='D07');
if(d07){
  d07.needAny=Array.isArray(d07.needAny)?d07.needAny:[];
  const advanced=['D06','D12','E25'];
  if(!d07.needAny.some(set=>sameSet(set,advanced)))d07.needAny.push(advanced);
  d07.text='两房都没有可供成人进出的暗道。林岳在旧站受伤后仍能自行返回07房；唐砚则是在回房前已被预置第二轮干预，之后本人挂上安全链。两案最后都由受害者自己完成内锁，但致死过程并不相同。';
}

// 双密室提示同步认可“先推出 D12 再回补 D07”的正常乱序玩法。
if(D.hints?.dual){
  D.hints.dual=[
    '把“谁最后锁门”和“致死过程发生在哪里”分成两个问题。林岳线先确认伤后仍能自行返回，唐砚线则确认第二轮干预发生在他锁门之前。',
    '维修图纸 E25 用来排除07与09房存在可通行暗道。如果你已经有 D06 和 D12，这两个推论已经分别概括了两起案件。',
    '后期可直接用 D06＋D12＋E25 形成 D07；若尚未形成 D12，原来的 D05＋D06＋E25 也仍然成立。'
  ];
}

// 林岳线提示：明确 E30/E33 不是 D06/D09 前置，同时保持独立调查模式不主动显示局部提示。
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
function hasState(s,id){return (s?.evidence||[]).includes(id)||(s?.deductions||[]).includes(id)}

// 顶部目标按实际已完成链条动态更新，避免玩家已经推出 D12/D09 后仍只看到泛泛的
// “分别解释两起房间”，却不知道 D07 还缺哪一环。
function advancedDualObjective(s){
  if(!s||hasState(s,'D07')||!hasState(s,'D11'))return '';
  if(s.mode==='independent'){
    if(!hasState(s,'D06'))return'补全林岳受伤后返回07房的行动链，再比较两起密室';
    if(!hasState(s,'E25'))return'核对两房结构是否存在可通行暗道，再完成双密室比较';
    return hasState(s,'D12')?'用已经确认的两案过程补全双密室比较结论':'比较林岳与唐砚各自回房、内锁与死亡发生的先后关系';
  }
  if(!hasState(s,'D06'))return'林岳线还缺 D06：用 E18＋E19＋E26 证明他受伤后能自行返回07房';
  if(!hasState(s,'E25'))return'回07旧站房核对维修图纸 E25，排除07/09房存在可通行暗道';
  if(hasState(s,'D12'))return'推理板组合 D06＋D12＋E25，补全 D07“两起密室不是同一种机关”';
  if(hasState(s,'D05'))return'推理板组合 D05＋D06＋E25，比较两起从内部锁住的房间';
  return'先形成唐砚回房后的第二轮干预 D05，再与 D06、E25 比较两起密室';
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

  const dynamicObjective=advancedDualObjective(s);
  if(dynamicObjective)setText(document.querySelector('.objective b'),dynamicObjective);

  // 初次侦探模式在推理板给出“缺哪一环”的上下文说明；不替玩家自动形成推论。
  const dedResults=document.querySelector('.deduction-room .ded-results');
  const oldLinNote=document.querySelector('[data-lin-chain-note]');
  const needLin=s.mode==='newbie'&&hasState(s,'D12')&&!hasState(s,'D06');
  if(needLin&&dedResults&&!oldLinNote){
    const note=document.createElement('div');
    note.dataset.linChainNote='1';
    note.className='success-note';
    note.innerHTML='<b>林岳线仍缺一个中间推论</b><p>D12只属于唐砚案。先把“旧伤记录＋旧站血滴方向＋鞋底纤维”组成林岳受伤后的行动链，再去连接旧站录音与D12。</p>';
    dedResults.appendChild(note);
  }else if(!needLin&&oldLinNote){oldLinNote.remove()}

  const oldDualNote=document.querySelector('[data-d07-chain-note]');
  const needDual=s.mode==='newbie'&&hasState(s,'D11')&&!hasState(s,'D07');
  if(needDual&&dedResults&&!oldDualNote){
    const note=document.createElement('div');
    note.dataset.d07ChainNote='1';
    note.className='success-note';
    let text='';
    if(!hasState(s,'D06'))text='D07 先缺林岳侧中间结论：E18＋E19＋E26 → D06。';
    else if(!hasState(s,'E25'))text='两案过程已经能比较，但还缺结构排除项：回07旧站房查看“维修图纸”取得 E25。';
    else if(hasState(s,'D12'))text='你已经有更强的唐砚案结论。现在可直接选择 D06＋D12＋E25 形成 D07，不必倒回去重新猜旧组合。';
    else text='选择 D05＋D06＋E25，即可比较两起“本人最后内锁、但致死过程不同”的案件。';
    note.innerHTML=`<b>D07 双密室比较</b><p>${text}</p>`;
    dedResults.appendChild(note);
  }else if(!needDual&&oldDualNote){oldDualNote.remove()}
}
let queued=false;
const scheduleUi=()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;patchUi()})};
if(typeof MutationObserver!=='undefined'){
  const observer=new MutationObserver(scheduleUi);
  observer.observe(document.documentElement,{childList:true,subtree:true});
}
window.addEventListener('DOMContentLoaded',scheduleUi,{once:true});
setTimeout(scheduleUi,0);

// 比原 selfTest 更严格：验证常规证物来源、隐藏证物隔离、D01-D12 可达性，
// 并明确检查 D07 对“D12 先于 D07”的乱序流程兼容。
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

  const hiddenInMain=[];
  for(const d of (D.deductions||[]))for(const set of (d.needAny||[]))for(const id of set)if(hiddenSet.has(id))hiddenInMain.push(`${d.id}:${id}`);
  if(hiddenInMain.length)errs.push('hidden-evidence-in-main-deduction:'+hiddenInMain.join(','));

  const dual=(D.deductions||[]).find(d=>d.id==='D07');
  const advanced=['D06','D12','E25'];
  if(!dual?.needAny?.some(set=>sameSet(set,advanced)))errs.push('D07-missing-D06-D12-E25-route');

  // 假设全部常规原始材料都已取得，迭代推导所有结论，检测引用死锁/循环。
  const reachable=new Set(regularEvidenceIds());
  let changed=true;
  while(changed){
    changed=false;
    for(const d of (D.deductions||[])){
      if(reachable.has(d.id))continue;
      if((d.needAny||[]).some(set=>set.every(id=>reachable.has(id)))){
        reachable.add(d.id);changed=true;
      }
    }
  }
  const unreachable=(D.deductions||[]).map(d=>d.id).filter(id=>!reachable.has(id));
  if(unreachable.length)errs.push('unreachable-deductions:'+unreachable.join(','));
  for(const id of ['D07','D09','D11','D12'])if(!reachable.has(id))errs.push('final-chain-unreachable:'+id);

  const result={
    ok:errs.length===0,
    errors:errs,
    missingRegularEvidence:missing,
    unreachableDeductions:unreachable,
    regularTotal:regularEvidenceIds().length,
    hidden:[...hiddenSet],
    d07Routes:dual?.needAny||[]
  };
  console.info('[雾岭山庄 hotfix 2.5.2 audit]',result.ok?'PASS':result);
  return result;
}
window.WL_HOTFIX_TEST={audit,regularEvidenceIds,hiddenEvidenceIds:()=>[...hiddenSet],advancedDualObjective};
setTimeout(audit,0);
})();
