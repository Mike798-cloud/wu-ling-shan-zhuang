(()=>{'use strict';
const D=window.WL_DATA;
if(!D)return;

// 2.6.1：保留 2.6.0 的结案修复，并统一标明哪些提示必须在推理板形成推论。
D.version='2.6.1';
D.hiddenEvidence=['E30'];
const hiddenSet=new Set(D.hiddenEvidence);

// 这些提示给出的是“推论方向”，不是结案页文字答案。game.js 会根据难度模式：
// 初次侦探显示可用证据链；独立调查只说明操作入口在推理板，不泄露组合配方。
D.hintDeductionTargets={
  snow:'D03',
  cups:'D04',
  oldlinks:'D10',
  gathering:'D11',
  dual:'D07',
  secondround:'D12',
  culprit:'D09'
};

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

// 2.5.3 目标系统：同一谜题链不改难度，只改变“系统主动告诉玩家多少”。
// 初次侦探 = 主目标 + 当前步骤；独立调查 = 只显示主目标，不主动暴露地点、编号或组合配方。
function objectivePlan(s){
  if(!s)return{main:'继续调查',step:''};
  const independent=s.mode==='independent';
  const plan=(main,step='')=>({main,step:independent?'':step});
  const has=id=>hasState(s,id);
  const oldLinks=()=>D.people.filter(p=>(p.oldEvidence||[]).some(id=>(s.evidence||[]).includes(id))).length;

  if(!s.flags?.room)return plan(
    independent?'核对入住信息并熟悉山庄':'确认入住信息并找到自己的房间',
    '先在前台核对登记簿，把房卡上的“06”对应到正确房名。'
  );
  if(!s.flags?.oldroom)return plan(
    independent?'重新检查一年前的07房旧案':'复原警方为何把07旧站房判断为“密室自杀”',
    '进入07旧站房，核对门锁、窗槽与旧案记录；这一阶段只解释警方当年的初始判断，不要提前猜真正死因。'
  );
  if(!s.flags?.murder)return plan(
    independent?'整理林岳留下的旧案材料':'整理林岳留下的明信片与旧案记录',
    '把07房已经确认的现场事实记录下来，等待新的案件变化。'
  );
  if(!s.flags?.route)return plan(
    independent?'解开九张明信片留下的路线':'确定九张明信片的完整阅读顺序',
    '从“第九张没有雪”开始，沿每张卡背面的下一张编号追出完整闭环。'
  );
  if(!s.flags?.phrase)return plan(
    independent?'解开九张明信片的第二层信息':'从九张明信片中定位旧档案藏匿处',
    '顺序已经确定；继续比较日期与题字，提取“具体地点 + 具体位置”，不要只写一个模糊地点名。'
  );
  if(!has('D01')||!has('D02'))return plan(
    independent?'建立可信的统一时间轴':'统一相机与厨房挂钟的时间基准',
    '先判断哪只钟偏慢、哪只偏快，再把两套记录校正到同一真实时间。'
  );
  if(!has('D03'))return plan(
    independent?'判断雪地与窗户证据的证明力':'解释“没有脚印”究竟能证明什么',
    '结合09晴峰房窗槽与雪地状态，区分“没人从窗户进出”与“房内一定没有其他过程”这两件事。'
  );
  if(!has('D04'))return plan(
    independent?'重建停电期间发生的物品变化':'还原停电前后的杯子位置变化',
    '对照餐桌记录、停电时段与相关证词，确认哪只杯子的位置在黑暗中发生了变化。'
  );
  if(!s.flags?.identity)return plan(
    independent?'核验旧档案中的身份链':'确认方致远与旧资料中的方志远是否为同一人',
    '进入地下档案，比较不同年代影像里稳定的面部特征；至少确认两处不会随年龄轻易改变的特征。'
  );
  if(!has('D10'))return plan(
    independent?'重建1998事故关系网':'把八名核心住客逐一放回1998事故关系网',
    `当前已核实 ${oldLinks()}/8。逐份打开地下档案中的人物原始材料；八个人都要有独立可核验的旧案联系。`
  );
  if(!has('D11'))return plan(
    independent?'解释这次山庄聚集为何不是偶然':'解释八名旧案关系人为何在同一个尽调周末出现',
    '关系网已经齐全；把“1998旧案关系”与本周收购尽调/邀请安排放在一起，形成聚集原因。'
  );
  if(!has('D06'))return plan(
    independent?'重建林岳受伤后的行动':'判断林岳受伤后是否仍能自行返回07房',
    '重新核对林岳旧伤记录、旧站血滴方向和鞋底残留，先回答“他受伤后还能不能自己离开旧站”。'
  );
  if(!has('D07')){
    if(!has('E25'))return plan(
      independent?'比较两起密室的形成过程':'比较两起“从内部锁住”的房间',
      '先回07旧站房核对维修图纸，排除07与09房之间存在可供成人通行的隐藏通道。'
    );
    if(has('D12'))return plan(
      independent?'比较两起密室的形成过程':'比较两起“从内部锁住”的房间',
      '两案各自的完整过程已经成立。现在比较“最后是谁完成内锁”与“致死干预发生在锁门前还是锁门后”，形成双密室结论。'
    );
    if(has('D05'))return plan(
      independent?'比较两起密室的形成过程':'比较两起“从内部锁住”的房间',
      '林岳侧行动链已经成立，唐砚侧也已确认回房前后存在第二轮干预；把这两条过程与维修图纸放在一起比较。'
    );
    return plan(
      independent?'比较两起密室的形成过程':'先补齐唐砚侧过程，再比较两起密室',
      '林岳侧已经能解释。唐砚侧先确认“餐厅计划失败后仍存在第二轮干预”，再回到双密室比较。'
    );
  }
  if(!has('D12'))return plan(
    independent?'重建唐砚真正的致死过程':'还原唐砚本人锁门之前发生的第二轮干预',
    '双密室结构已经解释；现在围绕胃药、09房备用钥匙与随身药盒，确认真正的致死干预是在唐砚自行挂链之前完成。'
  );
  if(!has('D09'))return plan(
    independent?'完成两案责任人的唯一性论证':'把林岳案与唐砚案连接成唯一责任链',
    '把林岳旧站录音与已经确认的唐砚案手段放在同一条链上，判断两案责任人是否唯一重合。'
  );
  if(!s.flags?.final)return plan(
    independent?'整理完整结案链':'整理“过程—动机—旧案责任”的完整结案链',
    '关键推论已齐。进入结案页，用自己的话分别说明两起密室、明信片、聚集原因、身份隐瞒与责任人。'
  );
  return plan('案件已结','可从结局页导出存档或重新调查。');
}

function ensureObjectiveStyles(){
  if(document.getElementById('wl-objective-253-style'))return;
  const style=document.createElement('style');
  style.id='wl-objective-253-style';
  style.textContent=`
    .objective .objective-step{display:block;margin-top:4px;font-size:12px;font-weight:500;line-height:1.42;opacity:.82;max-width:680px}
    .objective .objective-step::before{content:'当前步骤 · ';font-weight:800;letter-spacing:.04em;opacity:.9}
    .objective.objective-independent .objective-step{display:none}
    .objective-card[data-objective253]{white-space:normal}
    .case-objective-step{margin:.55rem 0 0;padding:.55rem .7rem;border-left:2px solid rgba(176,153,110,.5);font-size:.88rem;line-height:1.55;opacity:.88}
    .case-objective-step b{margin-right:.35rem}
    @media (max-width:900px){.objective .objective-step{font-size:11px;line-height:1.35}}
  `;
  document.head.appendChild(style);
}

function applyObjectiveUi(s){
  const goal=objectivePlan(s);
  ensureObjectiveStyles();
  const header=document.querySelector('.objective');
  if(header){
    header.classList.toggle('objective-independent',s.mode==='independent');
    const main=header.querySelector('b');
    setText(main,goal.main);
    let step=header.querySelector('.objective-step');
    if(goal.step){
      if(!step){step=document.createElement('small');step.className='objective-step';header.appendChild(step)}
      setText(step,goal.step);
    }else if(step){step.remove()}
  }

  const card=document.querySelector('.objective-card');
  if(card){
    card.dataset.objective253='1';
    setText(card,goal.main);
    let step=card.parentElement?.querySelector('.case-objective-step');
    if(goal.step){
      if(!step){step=document.createElement('p');step.className='case-objective-step';card.insertAdjacentElement('afterend',step)}
      step.innerHTML='<b>当前步骤</b>'+goal.step;
    }else if(step){step.remove()}
  }
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

  applyObjectiveUi(s);

  // 初次侦探模式在推理板给出“缺哪一环”的上下文说明；不替玩家自动形成推论。
  const dedResults=document.querySelector('.deduction-room .ded-results');
  const oldLinNote=document.querySelector('[data-lin-chain-note]');
  const needLin=s.mode==='newbie'&&hasState(s,'D12')&&!hasState(s,'D06');
  if(needLin&&dedResults&&!oldLinNote){
    const note=document.createElement('div');
    note.dataset.linChainNote='1';
    note.className='success-note';
    note.innerHTML='<b>林岳线仍缺一个中间推论</b><p>D12只属于唐砚案。先判断林岳受伤后是否仍能自行离开旧站：重新核对旧伤、血滴方向与鞋底残留，再回到推理板形成行动链。</p>';
    dedResults.appendChild(note);
  }else if(!needLin&&oldLinNote){oldLinNote.remove()}

  const oldDualNote=document.querySelector('[data-d07-chain-note]');
  const needDual=s.mode==='newbie'&&hasState(s,'D11')&&!hasState(s,'D07');
  if(needDual&&dedResults&&!oldDualNote){
    const note=document.createElement('div');
    note.dataset.d07ChainNote='1';
    note.className='success-note';
    let text='';
    if(!hasState(s,'D06'))text='D07 之前还缺林岳侧行动结论：先用旧伤、血滴方向与鞋底残留判断他能否自行返回07房。';
    else if(!hasState(s,'E25'))text='两案过程已经能比较，但还缺结构排除项：回07旧站房核对维修图纸，确认两房不存在可通行暗道。';
    else if(hasState(s,'D12'))text='两起案件的独立过程和结构排除项已经齐全。现在比较“受害者最后内锁”与“致死过程发生在锁门之前”这两个共同点。';
    else text='把两起案件各自的回房、内锁与致死过程放在一起比较；不要把“密室”误当成必须存在机关。';
    note.innerHTML=`<b>D07 双密室比较</b><p>${text}</p>`;
    dedResults.appendChild(note);
  }else if(!needDual&&oldDualNote){oldDualNote.remove()}
}
let queued=false;
const scheduleUi=()=>{if(queued)return;queued=true;const run=()=>{queued=false;patchUi()};if(typeof requestAnimationFrame==='function')requestAnimationFrame(run);else setTimeout(run,0)};
function observeApp(){
  const app=document.getElementById('app');
  if(!app||typeof MutationObserver==='undefined')return;
  // game.js 每次换页都会整体替换 #app；只监听根节点子级即可，避免观察整个 document 子树造成无意义回调。
  const observer=new MutationObserver(scheduleUi);
  observer.observe(app,{childList:true});
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',()=>{observeApp();scheduleUi()},{once:true});
else{observeApp();scheduleUi()}
// 设置页切换难度时，game.js 只保存 mode 而不立即 render。主动重绘当前工具页，
// 避免关闭设置后仍残留上一难度的目标/局部提示，直到玩家再点一次导航才更新。
document.addEventListener('change',e=>{
  if(e.target?.id!=='modeSel')return;
  setTimeout(()=>{
    const active=document.querySelector('[data-tool].active');
    if(active)active.click();else scheduleUi();
  },0);
});
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

  for(const [hintKey,deductionId] of Object.entries(D.hintDeductionTargets||{})){
    if(!D.hints?.[hintKey]?.length)errs.push('deduction-hint-missing:'+hintKey);
    const target=(D.deductions||[]).find(d=>d.id===deductionId);
    if(!target?.needAny?.length)errs.push('deduction-hint-target-missing:'+hintKey+':'+deductionId);
  }

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

  // 目标系统回归：两个难度必须使用同一主线，但初次侦探有小步骤、独立调查不泄露小步骤。
  const baseFlags={room:true,oldroom:true,murder:true,route:true,phrase:true,identity:true,final:false};
  const newbieLate={mode:'newbie',flags:baseFlags,evidence:['E25'],deductions:['D01','D02','D03','D04','D10','D11','D06','D12']};
  const independentLate={...newbieLate,mode:'independent'};
  const ng=objectivePlan(newbieLate),ig=objectivePlan(independentLate);
  if(!/(密室|房间)/.test(ng.main)||!/(密室|房间)/.test(ig.main))errs.push('objective-main-stage-mismatch');
  if(!ng.step)errs.push('newbie-objective-missing-step');
  if(ig.step)errs.push('independent-objective-leaks-step');
  const linGap=objectivePlan({...newbieLate,evidence:[],deductions:['D01','D02','D03','D04','D10','D11','D12']});
  if(!/林岳/.test(linGap.main))errs.push('objective-does-not-prioritize-D06-gap');
  const finalGoal=objectivePlan({...newbieLate,deductions:['D01','D02','D03','D04','D06','D07','D09','D10','D11','D12']});
  if(!/结案/.test(finalGoal.main))errs.push('objective-final-goal-missing');

  const result={
    ok:errs.length===0,
    errors:errs,
    missingRegularEvidence:missing,
    unreachableDeductions:unreachable,
    regularTotal:regularEvidenceIds().length,
    hidden:[...hiddenSet],
    d07Routes:dual?.needAny||[]
  };
  console.info('[雾岭山庄 hotfix 2.6.1 audit]',result.ok?'PASS':result);
  return result;
}
window.WL_HOTFIX_TEST={audit,regularEvidenceIds,hiddenEvidenceIds:()=>[...hiddenSet],objectivePlan};
setTimeout(audit,0);
})();
