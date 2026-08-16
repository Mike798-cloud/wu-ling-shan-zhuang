(()=>{'use strict';
const D=window.WL_DATA,T=window.__WL_TEST__;
if(!D||!T)return;
D.version='3.1.1';
const esc=s=>String(s??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
const state=()=>{try{return T.state()}catch{return null}};
const persistStateSnapshot=()=>{try{const s=state();if(s)localStorage.setItem(D.saveKey,JSON.stringify(s))}catch{}};
const has=(s,id)=>(s?.evidence||[]).includes(id)||(s?.deductions||[]).includes(id);

/* 1) 先把“山庄为什么没有普通员工”讲清楚：冬季停业 + 收购尽调包场。 */
if(D.locations?.lobby){
  D.locations.lobby.desc='山庄正处冬季暂停对外营业与出售尽调阶段。普通短期员工已在封山前下山；今晚留守经营方只有老板沈伯川和经理沈知遥。前台仍保存登记簿、服务器与值班记录。';
}
if(D.locations?.dining){
  D.locations.dining.desc='尽调包场使用的公共餐厅。常规服务班已经结束，晚间餐桌、杯垫与应急事务由沈知遥提前布置并自行值守。';
}
const yao=D.people?.find(p=>p.id==='yao');
if(yao){
  const cups=yao.talks?.find(t=>t[0]==='杯子');
  if(cups)cups[1]='“今晚不是正常营业，服务员早在封山前下山了。四个人的杯垫是我按名单提前摆的，颜色固定，我靠颜色确认每个人原来的位置。”';
  yao.summary='山庄经理，实际负责冬季停业期间的出售尽调与今晚留守事务，希望尽快完成出售并离开山区。';
}
const shen=D.people?.find(p=>p.id==='shen');
if(shen)shen.summary='山庄老板。冬季停业和出售尽调期间仍留守山庄，温和、念旧，对旧缆车站与山庄出售都格外谨慎。';


/* 1.2) 人物口供必须和“质证原话”一致，且不在访谈阶段直接承认待核实的旧案事实。 */
function setTalk(pid,oldLabel,newLabel,text){
  const p=D.people?.find(x=>x.id===pid);if(!p)return;
  let t=p.talks?.find(x=>x[0]===oldLabel||x[0]===newLabel);
  if(t){t[0]=newLabel;t[1]=text}else{(p.talks||(p.talks=[])).push([newLabel,text])}
}
setTalk('tang','来访目的','来访目的','“我第一次来雾岭，只是看看旧家具。”');
setTalk('fang','1998','1998','“1998年我还在外地读书，与雾岭事故没有任何关系。”');
setTalk('ji','明信片','明信片','“我只研究过明信片，从未参与制作它们。”');
setTalk('ji','09晴峰房','09晴峰房','“我没有进过09晴峰房，备用钥匙登记是前台写错了。”');
setTalk('shen','1998事故','1998事故','“1998事故完全是自然滑坡，山庄没有隐瞒施工。”');
setTalk('qiao','晴峰窗外','晴峰窗外','“我没拍到晴峰窗外有人经过的痕迹。”');
setTalk('luo','改造图纸','改造图纸','“我没有保留过山庄改造图纸。”');
setTalk('yao','母亲留下的名单','1998家中记录','“我家和1998旧事故只有经营方关系，家里没有留下任何当夜原始记录。”');
setTalk('lu','1998急诊页','1998事故接诊','“1998年我没有接触过事故伤员，只是后来听同行说过。”');
setTalk('qiao','1998底片','1998旧站拍摄','“我第一次拍旧站，是为了后来那本摄影集。”');
setTalk('luo','1998测绘本','1998现场测量','“1998年我只是外围测量，没有留下与施工安全有关的判断。”');
setTalk('tang','父亲唐世明','1998遇难者','“我来雾岭只是因为最近听到旧事故传闻，与遇难者没有家庭关系。”');
setTalk('lu','唐砚','现场初检','“人倒在09房后，我可以先做现场初检；正式死因和毒理仍要等道路恢复后交由法医复核。”');

/* 1.1) 去掉“明明停业却有服务员”的残余口径，并让现场检验有明确执行者/边界。 */
const findSpot=(loc,id)=>D.locations?.[loc]?.spots?.find(x=>x[0]===id);
const serviceSpot=findSpot('dining','service');
if(serviceSpot){
  serviceSpot[1]='晚餐摆台记录';
  serviceSpot[2]='沈知遥为尽调晚餐提前做的摆台记录：唐砚黑咖啡、乔雪柠檬水、陆怀青温水、沈知遥红茶。';
}
if(D.evidence?.E16){
  D.evidence.E16[0]='沈知遥晚餐摆台记录';
  D.evidence.E16[1]='餐厅 / 尽调晚餐';
  D.evidence.E16[2]='沈知遥按尽调名单提前记录四人的饮品：唐砚黑咖啡、乔雪柠檬水、陆怀青温水、沈知遥红茶。';
}
const coffeeSpot=findSpot('dining','coffee');
if(coffeeSpot){
  coffeeSpot[1]='黑咖啡现场快筛';
  coffeeSpot[2]='陆怀青用随身急救箱里的常见药物筛查试纸对残液做现场初筛：检出短效镇静成分，但剂量不足以单独解释死亡。正式毒理仍需下山复核。';
}
if(D.evidence?.E27){
  D.evidence.E27[0]='黑咖啡现场快筛';
  D.evidence.E27[1]='陆怀青现场初筛 / 餐厅';
  D.evidence.E27[2]='现场快筛提示短效镇静成分；剂量不足以单独解释死亡。该结论只用于调查方向，正式毒理需下山复核。';
}
const gastricSpot=findSpot('room09','gastric');
if(gastricSpot){
  gastricSpot[1]='胃内容现场初检';
  gastricSpot[2]='陆怀青在现场发现尚未完全溶解的胶囊壳残片，快筛显示它与咖啡中的成分不同；结合唐砚死亡前“回房后会服胃药”的登记谈话，可判断第二种成分晚于餐厅热饮进入。正式毒理仍需下山复核。';
}
if(D.evidence?.E28){
  D.evidence.E28[0]='唐砚胃内容现场初检';
  D.evidence.E28[1]='陆怀青现场初检 / 09晴峰房';
  D.evidence.E28[2]='胃内容有尚未完全溶解的胶囊壳残片，现场快筛显示存在区别于咖啡的第二种成分；结合唐砚死亡前的胃药习惯记录，其进入时间晚于餐厅热饮。正式毒理待下山复核。';
}
if(D.evidence?.E44){
  D.evidence.E44[1]='案发后公共安全核验';
  D.evidence.E44[2]='第二起疑似用药干预发生后，经营方要求所有住客在多人见证下登记随身药物；季文山书袋药盒中的空胶囊壳、裁切铝箔与09房伪装胃药残留相符。';
}

/* 2) 把时间材料放回“调查页取得，分析页只分析”。 */
function addSpot(loc,id,label,text,eid){
  const arr=D.locations?.[loc]?.spots;if(!Array.isArray(arr)||arr.some(x=>x[0]===id))return;
  arr.push([id,label,text,eid]);
}
addSpot('lobby','qiao_original','乔雪交出的大厅原片','你向乔雪核对相机时间后，她把大厅原始照片交给你。EXIF显示22:31；照片里同时拍到前台日志屏22:37。','E31');
addSpot('lobby','power_log','前台电力值班记录','停电后补记的值班记录写明：23:40:12断电，23:42:21恢复。','E11');
addSpot('dining','kitchen_ticket','厨房取餐票夹','取餐台夹着当晚小票：打印时间23:00；留档照片里的厨房挂钟同时指向23:07。','E32');
addSpot('room09','blackmail_draft','唐砚的施压信草稿','唐砚随身文件夹里夹着一份未寄出的施压信草稿：要求季文山交出暗号原稿，否则公开其参与旧材料隐匿一事。它只能证明唐砚的施压计划，不能由“登记簿质证”凭空产生。','E23');
if(D.evidence?.E23){D.evidence.E23[1]='09晴峰房 / 唐砚文件夹';D.evidence.E23[2]='未寄出的施压信草稿要求季文山交出暗号原稿，否则公开其参与旧材料隐匿一事。';}
if(D.evidence?.E31)D.evidence.E31[1]='乔雪提供 / 大厅原片';
if(D.evidence?.E32)D.evidence.E32[1]='餐厅取餐台';
if(D.evidence?.E11)D.evidence.E11[1]='前台电力值班记录';
D.hints.clock=[
  '时间页不再发放材料。先回调查现场取得三个独立来源：前台服务器基准、乔雪大厅原片、厨房取餐票。',
  '先和乔雪核对“相机时间”，再回大厅登记她交出的原片；厨房取餐票在餐厅，外部基准在前台服务器。停电记录也是前台值班记录的一部分。',
  '材料齐后比较同一画面/同一时刻：相机22:31对应真实22:37，所以相机慢6分钟；厨房票23:00对应挂钟23:07，所以厨房钟快7分钟。输入 -6 和 7，不需要给正数加“+”。'
];

/* 3) 保留原明信片核心：四字/短句中的数字负责排序，背面边角字负责指向钟楼。
      只精简解释与三级提示，不因为熟练玩家觉得简单就重做谜题。 */
D.postcardRule='第一层根据每张背面正文中的数字提示确定阅读顺序；第二层按这个顺序读取背面边角小字，拼出下一处调查位置。';
D.hints.route=[
  '“第九张没有雪”先确定起点。接下来只关注每张背面正文里出现的数字，看它把你带到哪一张卡。',
  '从09开始顺着数字继续往下排；如果中途重复或断掉，就回看上一张正文中的数字提示。',
  '完整闭环是：9→3→7→1→5→2→8→6→4，最后04再指回09。'
];
D.hints.phrase=[
  '第一层已经解决“先读哪张”。现在按刚才的顺序重新翻九张卡，注意每张背面的边角小字。',
  '按顺序抄下边角字；前几段会逐渐组成一个山庄里的具体位置。',
  '九段连起来是“旧钟背后第三格第三板”。这是去旧钟楼继续调查的方向，不等于钥匙已经到手。'
];
D.hints.oldlinks=[
  '从已经取得的原始卷宗开始逐个人核对：一份材料能证明谁、证明到哪一步？不要预设所有住客都与1998有关。',
  '优先检查会签单、前台复写记录、赔偿卷宗、急诊页、底片登记册、工作证、测绘本和家属认领材料；已核实的人会在人物页留下标记。',
  '如果需要直接核对：E35沈伯川、E36沈知遥、E22方致远、E37陆怀青、E38乔雪、E24季文山、E39罗诚、E40唐砚。八条都成立后才能形成D10。'
];
if(D.hints.culprit)D.hints.culprit=[
  '分别完成林岳受伤链与唐砚胃药替换链，再寻找能唯一连接两案的人。',
  '旧站争执录音负责指向一年前的推伤者；唐砚案则必须先完成备用钥匙、被替换胃药和药盒比对。',
  'E18＋E19＋E26形成D06；D05＋E42＋E43＋E44形成D12；最后用D06＋E34＋D12形成D09。'
];
if(D.finalAnswers)D.finalAnswers.postcards='九张明信片先用背面正文中的数字提示形成阅读闭环，再按该顺序读取边角小字，拼出旧档案的具体藏匿位置。';

/* 3.1) 推理板不能绕过真正谜题：D01/D02 只能在时间校准成功后形成；D07 移除信息量不足的捷径。 */
const sameSet=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every(x=>b.includes(x));
const d01=(D.deductions||[]).find(d=>d.id==='D01');
if(d01)d01.needAny=[['E08','E09']];
const d02=(D.deductions||[]).find(d=>d.id==='D02');
if(d02)d02.needAny=[['E08','E10']];
const d07=(D.deductions||[]).find(d=>d.id==='D07');
if(d07){
  d07.needAny=(d07.needAny||[]).filter(set=>!sameSet(set,['E18','E25','E28']));
  for(const set of [['D05','D06','E25'],['D06','D12','E25']])if(!d07.needAny.some(x=>sameSet(x,set)))d07.needAny.push(set);
  d07.text='两房都没有可供成人进出的暗道。林岳在旧站受伤后仍能自行返回07房；唐砚则是在本人挂上安全链之前已遭到第二轮干预。两案最后都由受害者自己完成内锁，但致死过程不同。';
}

/* 4) 修复第二起死亡时 E05/E06/E07 被系统静默发放。
      game.js 的 ev() 每次都会动态读取 D.evidence；在旧房提交后的短窗口内让这三项不可见，
      这样它们必须由玩家亲自查看登记簿、手表、安全链取得。 */
let incidentGate=false,transientEvidenceBlock=new Set();
if(D.evidence&&!D.evidence.__wl300proxy){
  const target=D.evidence;
  const proxy=new Proxy(target,{get(obj,prop,recv){
    if(prop==='__wl300proxy')return true;
    if((incidentGate&&['E05','E06','E07'].includes(String(prop)))||transientEvidenceBlock.has(String(prop)))return undefined;
    return Reflect.get(obj,prop,recv);
  }});
  D.evidence=proxy;
}
document.addEventListener('click',e=>{
  if(!e.target?.closest?.('#oldroomBtn'))return;
  incidentGate=true;
  // E04“林岳笔记”必须由玩家真的点开笔记取得；提交门窗判断不能顺手发放。
  transientEvidenceBlock.add('E04');
  setTimeout(()=>{transientEvidenceBlock.delete('E04')},0);
  // 原逻辑的第二起死亡在约300ms后发生，自动证物被我们拦截后要主动保存 murder 状态，
  // 否则刷新可能回到“死亡尚未发生”。
  setTimeout(()=>persistStateSnapshot(),380);
  setTimeout(()=>{incidentGate=false},520);
},true);
document.addEventListener('click',e=>{
  if(!e.target?.closest?.('#phraseBtn'))return;
  // 解出地点只开放旧钟楼，不等于已经去现场打开暗格。
  transientEvidenceBlock.add('E29');
  // ev(E29) 被拦截后原流程不会 save，单独保存 phrase=true，避免刷新丢失谜题进度。
  setTimeout(()=>{persistStateSnapshot();transientEvidenceBlock.delete('E29')},0);
},true);

document.addEventListener('click',e=>{
  const btn=e.target?.closest?.('[data-contr-btn]');if(!btn)return;
  // 原 game.js 会把“质证成功”错误当成新证物来源：唐砚质证凭空发E23、方致远质证凭空发E21。
  // 在本次点击的同步事件周期内临时屏蔽它们；真正来源分别改为09房文件夹与身份核验。
  const id=btn.dataset?.contrBtn;
  if(id==='tang')transientEvidenceBlock.add('E23');
  if(id==='fang')transientEvidenceBlock.add('E21');
  setTimeout(()=>{transientEvidenceBlock.delete('E23');transientEvidenceBlock.delete('E21')},0);
},true);

function logicToast(msg){const wrap=document.getElementById('toast');if(!wrap)return;const el=document.createElement('div');el.className='toast warn';el.textContent=msg;wrap.appendChild(el);setTimeout(()=>el.remove(),3000)}
document.addEventListener('click',e=>{
  const archive=e.target?.closest?.('[data-tool="archive"],[data-loc="archive"]');if(!archive)return;
  const s=state();if(!s?.flags?.phrase)return;
  const progressed=['E20','E22','E24','E35','E36','E37','E38','E39','E40'].some(id=>has(s,id))||s.flags?.identity;
  if(has(s,'E29')||progressed)return;
  e.preventDefault();e.stopImmediatePropagation();
  logicToast('明信片只确定了位置。先去旧钟楼找到“第三格 · 第三块活动木板”，拿到档案柜钥匙。');
},true);

document.addEventListener('click',e=>{
  const b=e.target?.closest?.('[data-person-ev="E44"]');if(!b)return;
  const s=state();if(has(s,'E42'))return;
  e.preventDefault();e.stopImmediatePropagation();logicToast('先在09晴峰房确认被替换的胃药胶囊。没有现场对照，不能把任何人的随身药盒直接当成案物。');
},true);

document.addEventListener('click',e=>{
  const reset=e.target?.closest?.('#resetBtn,#resetSplash,#restart');
  const fresh=e.target?.closest?.('#newgame');
  if(!reset&&!fresh)return;
  setTimeout(()=>{
    try{
      if(reset){if(!localStorage.getItem(D.saveKey)&&!localStorage.getItem(D.legacyKey))localStorage.removeItem('wuling_interview_topics_v3');return}
      const s=state();
      if(s?.started&&!s.flags?.room&&(s.seenPeople||[]).length===0&&(s.contradictions||[]).length===0)localStorage.removeItem('wuling_interview_topics_v3');
    }catch{}
  },0);
});

/* 5) 兼容旧存档：旧版若“没看现场却自动有 E05/E06/E07”，仅回收这三项错误自动证物。 */
(function repairLegacyAutoEvidence(){
  try{
    const raw=localStorage.getItem(D.saveKey);if(!raw)return;
    const s=JSON.parse(raw);if(!s||s._wlLogic300)return;
    const seen=new Set(Array.isArray(s.seenSpots)?s.seenSpots:[]),ev=Array.isArray(s.evidence)?s.evidence:[];
    const gate={E05:'lobby:guestbook',E06:'room09:watch',E07:'room09:chain'};
    let changed=false;
    for(const [id,key] of Object.entries(gate)){
      if(ev.includes(id)&&!seen.has(key)){
        s.evidence=s.evidence.filter(x=>x!==id);changed=true;
      }
    }
    // 旧版允许在21:37抵达后立刻读到22:00服务器记录和22:46—22:55备用钥匙登记，形成“读取未来记录”。
    // 若第二起死亡尚未发生，回收这两个提前取得项，待23:50后再按现场流程重新调查。
    if(!s.flags?.murder){
      for(const [id,key] of [['E08','lobby:server'],['E43','lobby:sparekey']]){
        if((s.evidence||[]).includes(id)){s.evidence=s.evidence.filter(x=>x!==id);changed=true}
        if(seen.has(key)){s.seenSpots=(s.seenSpots||[]).filter(x=>x!==key);changed=true}
      }
    }
    // 旧版质证唐砚会凭空产生E23。若没有09房实际观察记录，则回收并让玩家去文件夹取得。
    if((s.evidence||[]).includes('E23')&&!seen.has('room09:blackmail_draft')){s.evidence=s.evidence.filter(x=>x!=='E23');changed=true}
    // 旧版明信片提交会直接发E29并跳过钟楼。只修复尚未进入地下档案主链的早期存档，避免破坏已通关档。
    const archiveProgress=['E20','E22','E24','E35','E36','E37','E38','E39','E40'].some(id=>(s.evidence||[]).includes(id))||s.flags?.identity;
    if((s.evidence||[]).includes('E29')&&!seen.has('clock:board')&&!archiveProgress){s.evidence=s.evidence.filter(x=>x!=='E29');changed=true}
    s._wlLogic300=true;localStorage.setItem(D.saveKey,JSON.stringify(s));
    if(changed&&!sessionStorage.getItem('wl_logic300_reloaded')){
      sessionStorage.setItem('wl_logic300_reloaded','1');location.reload();
    }
  }catch{}
})();

const INTERVIEW_KEY='wuling_interview_topics_v3';
const CONTR_TOPIC={tang:['tang','来访目的'],fang:['fang','1998'],ji:['ji','明信片'],ji09:['ji','09晴峰房'],shen:['shen','1998事故'],qiao:['qiao','晴峰窗外'],luo:['luo','改造图纸'],yao98:['yao','1998家中记录'],lu98:['lu','1998事故接诊'],qiao98:['qiao','1998旧站拍摄'],luo98:['luo','1998现场测量'],tang98:['tang','1998遇难者']};
function interviewTopics(){try{
  const set=new Set(JSON.parse(localStorage.getItem(INTERVIEW_KEY)||'[]'));
  const aliases={'yao:母亲留下的名单':'yao:1998家中记录','lu:1998急诊页':'lu:1998事故接诊','qiao:1998底片':'qiao:1998旧站拍摄','luo:1998测绘本':'luo:1998现场测量','tang:父亲唐世明':'tang:1998遇难者'};
  let changed=false;for(const [a,b] of Object.entries(aliases))if(set.has(a)&&!set.has(b)){set.add(b);changed=true}
  if(changed)localStorage.setItem(INTERVIEW_KEY,JSON.stringify([...set]));return set
}catch{return new Set()}}
function rememberTopic(pid,topic){if(!pid||!topic)return;const set=interviewTopics();set.add(pid+':'+topic);try{localStorage.setItem(INTERVIEW_KEY,JSON.stringify([...set]))}catch{}}
function heardContradiction(s,id){if((s?.contradictions||[]).includes(id))return true;const ref=CONTR_TOPIC[id];if(!ref)return false;return interviewTopics().has(ref[0]+':'+ref[1])}
const personIdByName=new Map((D.people||[]).map(p=>[p.name,p.id]));
function replaceText(root,from,to){
  for(const el of root.querySelectorAll('p,small,span,b'))if(el.textContent?.trim()===from)el.textContent=to;
}
function patchArrival(){
  const box=document.querySelector('.arrival-copy');if(!box||box.dataset.wl300)return;
  box.dataset.wl300='1';
  const status=document.createElement('div');status.className='wl-world-status';
  status.innerHTML='<b>今晚的山庄不是正常营业日</b><br>冬季已经暂停普通接客，这次是收购尽调包场。普通短期员工在封山前已下山；沈伯川与沈知遥父女留守。你进门后由沈知遥亲自接待，并在大厅做了一轮十分钟的尽调碰头，人物页会保存这些基础说法。';
  box.querySelector('.arrival-clues')?.insertAdjacentElement('beforebegin',status);
}
function patchSplash(){
  const notes=document.querySelector('.splash-notes');if(!notes||notes.querySelector('[data-wl300]'))return;
  const s=document.createElement('span');s.dataset.wl300='1';s.textContent='冬季停业 · 尽调包场';notes.appendChild(s);
}
function patchManor(s){
  if(!document.querySelector('.manor-layout'))return;
  const toggle=(id,show)=>{const el=document.querySelector(`[data-spot="${id}"]`);if(el)el.classList.toggle('wl-hidden-source',!show)};
  // 这些记录的时间晚于玩家21:37抵达；第二起死亡前不能“读到未来”。
  toggle('server',!!s.flags?.murder);
  toggle('sparekey',!!s.flags?.murder);
  toggle('qiao_original',!!(s.flags?.murder&&interviewTopics().has('qiao:相机时间')));
  toggle('power_log',!!s.flags?.murder);
  toggle('kitchen_ticket',!!s.flags?.murder);
  // 胃内容是陆怀青在案发现场做的初步医学检查，不是玩家一进09房就凭空知道的数值。
  toggle('gastric',!!(s.flags?.murder&&(s.seenPeople||[]).includes('lu')));
  // 明信片只给出地点，地下档案钥匙必须去钟楼现场取得E29。
  const archiveProgress=['E20','E22','E24','E35','E36','E37','E38','E39','E40'].some(id=>has(s,id))||s.flags?.identity;
  const archiveReady=has(s,'E29')||archiveProgress;
  const archiveNode=document.querySelector('[data-loc="archive"]');if(archiveNode)archiveNode.classList.toggle('locked',!archiveReady);
  const archiveTool=document.querySelector('[data-tool="archive"]');if(archiveTool)archiveTool.classList.toggle('locked',!archiveReady);
  const cap=document.querySelector('.scene-caption>span');
  if(cap){const buttons=[...document.querySelectorAll('.scene-notes [data-spot]')].filter(b=>!b.classList.contains('wl-hidden-source'));const done=buttons.filter(b=>b.classList.contains('done')).length;cap.textContent=`已观察 ${done}/${buttons.length}`;}
  if(s.location==='room07'&&!s.flags?.oldroom){
    const btn=document.getElementById('oldroomBtn');
    const enough=(s.seenSpots||[]).includes('room07:lock')&&(s.seenSpots||[]).includes('room07:dust');
    if(btn){btn.disabled=!enough;const small=btn.closest('.field-puzzle')?.querySelector('small');if(small)small.textContent=enough?'门锁与窗槽都已核对，可以记录警方当年的初始判断。':'这一步必须亲自核对“门内插销”和“窗槽”两项；林岳笔记不能代替现场条件。'}
  }
}

function patchTimeline(s){
  const lab=document.querySelector('.time-lab');if(!lab)return;
  const entries=[
    ['E08','外部广播 / 前台日志','22:00 同刻','尚未取得：回大厅检查前台服务器'],
    ['E31','乔雪相机大厅照','相机 22:31 / 前台 22:37','尚未取得：先在人物页核对乔雪的“相机时间”，再回大厅接收原片'],
    ['E32','厨房取餐票同框照','打印票 23:00 / 挂钟 23:07','尚未取得：到餐厅检查取餐票夹'],
    ['E11','发电机停电记录','23:40:12 → 23:42:21','尚未取得：回大厅检查停电后的电力值班记录']
  ];
  const cards=[...lab.querySelectorAll('.time-source')];
  entries.forEach((x,i)=>{const card=cards[i];if(!card)return;card.classList.add('wl-time-patched');const owned=has(s,x[0]);card.classList.toggle('wl-missing',!owned);const b=card.querySelector('b');if(b)b.textContent=owned?x[2]:'尚未取得';const old=card.querySelector('button[data-add-ev]');if(old)old.remove();let note=card.querySelector('.wl-source-state');if(!note){note=document.createElement('small');note.className='wl-source-state';card.appendChild(note)}note.textContent=owned?'已从调查现场登记，可用于分析。':x[3]});
  const cam=document.getElementById('camOffset'),kit=document.getElementById('kitOffset');
  if(cam)cam.placeholder='例如：-6';if(kit)kit.placeholder='例如：7（正数不用写 +）';
  const solve=document.getElementById('clockSolve');
  const ready=['E08','E31','E32'].every(id=>has(s,id));
  if(solve){solve.disabled=!ready;if(!ready)solve.title='先在调查现场取得前台基准、乔雪原片和厨房取餐票'}
  const intro=lab.querySelector('.clock-work>p');if(intro)intro.textContent='分析页只计算已经取得的材料。以外部广播/前台服务器为基准：慢写负数，快写正数；正数直接填数字，不需要输入“+”。';
}
function patchPeopleModal(modal,s){
  const pf=modal.querySelector('.person-file');if(!pf)return;
  const name=pf.querySelector('h2')?.textContent?.trim()||'';
  const pid=personIdByName.get(name);
  let note=modal.querySelector('.wl-interview-source');
  if(!note){note=document.createElement('div');note.className='wl-interview-source';const log=modal.querySelector('.interview-log');log?.insertAdjacentElement('beforebegin',note)}
  if(note){
    note.innerHTML=name==='唐砚'&&s.flags?.murder?'<b>口供来源</b> · 唐砚死亡前的大厅尽调碰头与此前登记谈话。这里不是“死亡后问话”。展开一个话题，才会把那句话登记为可用于质证的口供。':'<b>口供来源</b> · 今晚大厅尽调碰头及后续当面核对。展开一个话题，才会把那句话登记为可用于质证的口供。';
  }
  const postMurder={shen:new Set(['当晚行程']),yao:new Set(['停电']),lu:new Set(['现场初检','时间']),qiao:new Set(['雪地','杯子','晴峰窗外']),ji:new Set(['停电','09晴峰房'])};
  for(const d of modal.querySelectorAll('.interview-log details')){
    const topic=d.querySelector('summary')?.textContent?.trim()||'';
    const future=postMurder[pid]?.has(topic);d.classList.toggle('wl-hidden-source',!!future&&!s.flags?.murder);
    if(d.dataset.wlTopicBound)continue;d.dataset.wlTopicBound='1';
    d.addEventListener('toggle',()=>{if(d.open){rememberTopic(pid,d.querySelector('summary')?.textContent?.trim());schedule()}});
  }
  const personal=modal.querySelector('.personal-check');
  if(name==='季文山'&&personal){
    const ready=has(s,'E42');personal.classList.toggle('wl-hidden-source',!ready);
    const b=personal.querySelector('b'),p=personal.querySelector('p'),btn=personal.querySelector('[data-person-ev="E44"]');
    if(b)b.textContent='案发后公共安全核验';
    if(p)p.textContent='你已经在09房确认胃药被拆封替换。为排除继续用药风险，沈知遥要求所有住客在经营方、陆怀青和你共同见证下登记随身药物。季文山书袋中的药盒因此进入比对。';
    if(btn&&!s.evidence?.includes('E44'))btn.textContent='在见证下核对药盒';
  }
  const caseNote=modal.querySelector('.case-note');
  if(caseNote&&!s.flags?.final&&!s.ending){caseNote.innerHTML='<b>调查备注</b><p>尚有未核实信息。人物页只保留口供和已核实关系，不提前显示系统掌握的隐藏事实。</p>';}
}
function patchTestimony(s){
  const room=document.querySelector('.testimony-room');if(!room)return;
  const intro=room.querySelector('.interrogation-intro p');if(intro)intro.textContent='质证只显示你已经在人物页真正展开并记录过的原话。先问，再拿物证击穿；系统不会把从未听过的台词直接塞进质证页。';
  let visible=0;
  for(const card of room.querySelectorAll('.testimony')){
    const id=card.querySelector('[data-contr-btn]')?.dataset.contrBtn;
    const who=card.querySelector('header b')?.textContent?.trim();
    const ref=CONTR_TOPIC[id];
    const heard=heardContradiction(s,id);
    card.classList.toggle('wl-unheard',!heard);if(!heard)continue;visible++;
    if(!card.querySelector('.wl-testimony-source')){const tag=document.createElement('small');tag.className='wl-testimony-source';tag.textContent=`来源：人物访谈记录 · ${who}${ref?.[1]?' / '+ref[1]:''}`;card.querySelector('blockquote')?.insertAdjacentElement('beforebegin',tag)}
  }
  let empty=room.querySelector('.wl-testimony-empty');
  if(!visible&&!empty){empty=document.createElement('div');empty.className='wl-testimony-empty';empty.innerHTML='<b>还没有可质证的口供</b><br>先去“人物”页，展开具体访谈话题。只有你亲自记录过的原话才会进入这里。';room.querySelector('.testimony-list')?.prepend(empty)}else if(visible&&empty)empty.remove();
}

function patchPostcardPage(s){
  const root=document.querySelector('.postcard-table');if(!root)return;
  const paper=root.querySelector('.puzzle-paper');if(!paper)return;
  const first=[...paper.querySelectorAll('h3')].find(x=>x.textContent.trim()==='第一层');
  if(first&&first.nextElementSibling)first.nextElementSibling.textContent='从第09张开始，根据每张背面正文中的数字提示排列九张明信片，直到首尾形成闭环。先只解决顺序。';
  const second=[...paper.querySelectorAll('h3')].find(x=>x.textContent.trim()==='第二层');
  if(second&&second.nextElementSibling)second.nextElementSibling.textContent='顺序确定后，按同一顺序读取每张背面的边角小字，把它们连起来，得到下一处调查位置。';
  // postcard-fix.js 原本会额外插入一整块规则说明。这里删除重复说明，避免同一规则在详情里反复出现。
  paper.querySelector('[data-wl-postcard-rule]')?.remove();
  paper.querySelector('.wl-postcard-rule-300')?.remove();
  const success=paper.querySelector('.success-note');
  if(success&&s.flags?.phrase){
    const got=has(s,'E29'),b=success.querySelector('b'),p=success.querySelector('p');
    if(b)b.textContent=got?'现场核验完成':'位置已解出';
    if(p)p.textContent=got?'你已经在旧钟楼第三格的第三块活动木板后取得档案柜钥匙。':'明信片已经指向旧钟楼的具体位置。去现场核验并亲自取得档案钥匙。';
  }
}
function patchPostcardModal(modal,s){
  const back=modal.querySelector('.post-back');if(!back)return;
  // 保留 postcard-fix.js 已经呈现的正文与“边角小字”，不隐藏第二层材料，也不改写原谜面。
  // 只压缩重复解释：玩家自己决定何时记下边角字，三级提示负责照顾不同解谜水平。
  const mark=back.querySelector('.wl-edge-mark');
  if(mark){
    const small=mark.querySelector('small');
    if(small)small.textContent=s.flags?.route?'按已确认的阅读顺序记录这个边角字。':'正文中的数字用于排序；边角字先保留，顺序确定后再连读。';
  }
  const old=back.querySelector('small:not(.wl-edge-mark small)');
  if(old)old.remove();
}
function patchIncident(modal){
  const inc=modal.querySelector('.incident');if(!inc||inc.dataset.wl300)return;
  const h=inc.querySelector('h2');if(!h||h.textContent.trim()!=='第二起死亡')return;
  inc.dataset.wl300='1';
  inc.innerHTML='<div class="eyebrow">23:40—23:50 · 七楼走廊 / 09晴峰门外</div><h2>第二起死亡</h2><p class="wl-time-bridge">从21:37抵达到完成登记、尽调碰头、旧卷交接和07房现场复核，你实际已经在山庄里工作了两个多小时。接近23:40时，你才把07房的初始判断写完。</p><p class="wl-found-envelope">整理07房封存物时，床板夹层滑出一个牛皮纸封：林岳留下的其余八张旧明信片都在里面。你这一年来随身带的只是最后寄出的第09张，因此九张卡直到此刻才真正凑齐。</p><ol class="wl-incident-steps"><li><b>23:40</b> 全庄突然断电。你留在07房门口等待应急照明。</li><li><b>23:42</b> 供电恢复。沈知遥急促敲门：唐砚没有回应，09房门从里面挂着安全链。</li><li>经营方备用钥匙只能把门推开一道缝；链仍在内侧。此时你还没有进入现场，也没有取得手表或链扣证物。</li><li>陆怀青从门缝确认唐砚倒在床侧。沈伯川与沈知遥在多人见证下处理链扣，随后你们才进入09房。</li><li><b>23:50</b> 陆怀青确认唐砚已经死亡。沈知遥立即联系县里值班部门；暴雪封路，警方与急救力量最快只能次日抵达。值班人员要求封闭房门、保留原状和出入记录。</li><li>在沈伯川、沈知遥和陆怀青共同见证下，你只做临时拍照、编号和可逆取样，所有记录等待警方到场移交。09晴峰房从这一刻开放调查。</li></ol><p>你现在只知道“发生了死亡”，并不知道它如何发生。去09房自己取得证据；你的记录是封路期间的现场保全，不替代警方和正式法医结论。</p>';
}
function patchHintModal(modal){
  for(const el of modal.querySelectorAll('p,small,li,span')){
    const t=el.textContent||'';
    if(/本页可以取得并校准两套时间源/.test(t))el.textContent='本页只分析已经在调查现场取得的时间材料，不会在这里生成新证物。';
    else if(/进入时间页.*核对|点击.*核对日志/.test(t))el.textContent='外部基准来自大厅前台服务器；第二起案件发生后回大厅亲自检查该记录。';
    else if(/查看原图信息|乔雪大厅照片/.test(t)&&/点击|时间页|取得/.test(t))el.textContent='先在人物页展开乔雪“相机时间”的谈话，再回大厅登记她交出的原始照片。';
    else if(/查看票据|厨房取餐票/.test(t)&&/点击|时间页|取得/.test(t))el.textContent='厨房取餐票必须到餐厅取餐台亲自取得，时间分析页只负责计算。';
    else if(/抄录停电记录|发电机停电记录/.test(t)&&/点击|时间页|取得/.test(t))el.textContent='停电时段来自大厅的电力值班记录；第二起案件后回前台核对。';
    else if(/时间页.*取得|查看原图信息|抄录停电记录/.test(t))el.textContent='时间分析页不再生成证物。材料必须先从大厅、人物访谈或餐厅调查中取得，再回来做校准。';
    if(/例如\s*\+\s*5|正数.*\+/.test(t))el.textContent='快7分钟填写 7；慢6分钟填写 -6。正数不需要输入“+”。';
    if(/比较邮戳日期与题字|日期里的数字|邮戳.*提取/.test(t))el.textContent='第一层只负责排序；第二层按同一顺序读取背面的边角小字，得到下一处调查位置。';
    if(/提交后.*档案.*钥匙|取得档案钥匙/.test(t)&&/明信片|地点|提交/.test(t))el.textContent='提交只确认藏匿位置。还要去旧钟楼第三格的第三块活动木板现场取得档案钥匙。';
    if((/E23|勒索信/.test(t))&&/质证|第一次入住|击穿唐砚/.test(t))el.textContent='E23 不再由质证奖励。第二起案件后进入09晴峰房，在唐砚文件夹中亲自取得施压信草稿。';
    if((/E21|三年代身份/.test(t))&&/质证方致远|E22/.test(t))el.textContent='E21 只由地下档案的三年代身份核验形成；先核对 E22 原卷宗，再提交至少两处稳定面部特征。';
  }
}

function patchModal(node,s){if(!(node instanceof HTMLElement)||!node.classList.contains('modalback'))return;patchPeopleModal(node,s);patchPostcardModal(node,s);patchIncident(node);patchHintModal(node)}
function patchArchiveLogic(s){
  const progressed=['E20','E22','E24','E35','E36','E37','E38','E39','E40'].some(id=>has(s,id))||s.flags?.identity;
  const readyKey=has(s,'E29')||progressed;
  const desk=document.querySelector('.archive-desk');
  if(desk&&!readyKey&&!desk.dataset.wlLocked){
    desk.dataset.wlLocked='1';desk.innerHTML='<div class="locked-room wl-archive-locked"><h2>地下档案室还没有钥匙</h2><p>明信片只让你推断出藏匿位置。去旧钟楼核对“第三格 · 第三块活动木板”，亲自取得 E29 和档案柜钥匙后再回来。</p></div>';
  }
  if(desk&&readyKey){
    const verified=[...desk.querySelectorAll('.archive-person-doc.done')].length;
    const chip=desk.querySelector('.progress-chip');if(chip&&!has(s,'D10'))chip.textContent=`已核实 ${verified} 条1998关联`;
    for(const card of desk.querySelectorAll('.archive-person-doc:not(.done)')){
      const p=card.querySelector('p');if(p)p.textContent='把此人作为待核对对象，不预设一定与1998事故有关。先翻查原始卷宗，再决定是否建立关系。';
      for(const b of card.querySelectorAll('[data-doc-ev]'))b.textContent='翻查相关原始卷宗';
    }
  }
  const btn=document.getElementById('identityBtn');if(!btn)return;
  const ready=has(s,'E22');btn.disabled=!ready;
  let note=btn.parentElement?.querySelector('.wl-identity-source');
  if(!note){note=document.createElement('small');note.className='wl-identity-source';btn.insertAdjacentElement('afterend',note)}
  if(note)note.textContent=ready?'方致远相关原卷宗已登记，可以进行跨年代影像核验。':'先在上方方致远卷宗卡片中亲自“核对 E22”，再进行身份核验；系统不会用质证替你生成身份材料。';
}

function patchPeoplePage(s){
  const sheet=document.querySelector('.oldcase-sheet');if(!sheet)return;
  const linked=[...sheet.querySelectorAll('.oldcase-link.verified')].length;
  const h=sheet.querySelector('.rel-head h2'),p=sheet.querySelector('.rel-head p'),b=sheet.querySelector('.rel-head>b');
  if(h)h.textContent=has(s,'D10')?'1998旧事故关系网':'住客 / 1998旧案交叉核对';
  if(p)p.textContent=has(s,'D10')?'原始材料已经证明八名核心住客都与旧事故存在可核验联系；关联并不等于承担同一种责任。':'逐一核对今晚住客与1998卷宗的真实关联，不预设“所有人都有关”。只有亲自取得的原始材料才能把某个人放进旧案关系网。';
  if(b)b.textContent=has(s,'D10')?`${linked}/8 已核实`:`已核实 ${linked} 条关联`;
}

function patchObjectiveAndToasts(s){
  if(s?.flags?.identity&&!has(s,'D10')){
    const main=document.querySelector('.objective b');if(main)main.textContent='核实住客与1998事故的真实关联';
    const card=document.querySelector('.objective-card');if(card)card.textContent='核实住客与1998事故的真实关联';
    for(const el of document.querySelectorAll('.objective-step,.case-objective-step'))el.textContent='逐一打开地下档案原卷宗并核对人物，不预设所有人都与旧案有关。';
  }
  if(s?.flags?.phrase&&!has(s,'E29')){
    const main=document.querySelector('.objective b');if(main)main.textContent='去旧钟楼核验明信片指向并取得档案钥匙';
    const card=document.querySelector('.objective-card');if(card)card.textContent='去旧钟楼核验明信片指向并取得档案钥匙';
    for(const el of document.querySelectorAll('.objective-step,.case-objective-step'))el.textContent='地点已经解出，但钥匙还在现场。前往旧钟楼，检查第三格中的第三块活动木板。';
  }
  for(const el of document.querySelectorAll('.objective-step,.case-objective-step')){
    const t=el.textContent||'';
    if(/下一张编号|沿每张卡背面的下一张编号|正文里的数字指向|地景描述/.test(t))el.textContent='从09“晴峰”开始，根据每张背面正文里的数字提示继续排序，直到九张首尾闭合。';
    else if(/比较日期与题字|提取.*具体地点|日期里的数字|边角小字/.test(t))el.textContent='第一层顺序已确定；按同一顺序读取每张背面的边角小字，拼出下一处调查位置。';
  }
  for(const el of document.querySelectorAll('.toast')){const t=el.textContent||'';if(/逐卡追号码|链条有断点/.test(t))el.textContent='链条有断点；从09“晴峰”开始，重新核对上一张背面正文里的数字指向。';else if(/旧钟暗格打开.*档案室钥匙到手/.test(t))el.textContent='地点已经解出。旧钟楼现已开放；去现场找到第三格中的第三块活动木板，亲自取得档案钥匙。';}
}
function patchProgressPrivacy(s){
  const hidden=(s.evidence||[]).includes('E30'),regularTotal=Object.keys(D.evidence||{}).filter(id=>id!=='E30').length,regular=(s.evidence||[]).filter(id=>id!=='E30').length;
  const text=`常规证物 ${regular}/${regularTotal}${hidden?' · 特殊卷宗 1':''}`;
  const nodes=[...document.querySelectorAll('.statusbar span,.facts-mini span,.ending-stats span')].filter(el=>/^(证物|常规证物)/.test(el.textContent||''));
  for(const el of nodes){el.classList.add('wl-evidence-count');el.dataset.wlCount=text}
  const note=document.querySelector('[data-hidden-evidence-note]');if(note)note.textContent='特殊结案可能生成额外卷宗；这类卷宗不计入常规调查进度，也不会作为主线缺失证物提示。';
}

function patchUi(){const s=state();if(!s)return;patchSplash();patchArrival();patchManor(s);patchTimeline(s);patchPeoplePage(s);patchTestimony(s);patchPostcardPage(s);patchArchiveLogic(s);patchObjectiveAndToasts(s);patchProgressPrivacy(s);for(const m of document.querySelectorAll('.modalback'))patchModal(m,s)}
let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;patchUi()})};
const app=document.getElementById('app');if(app)new MutationObserver(schedule).observe(app,{childList:true});
new MutationObserver(records=>{const s=state();for(const r of records)for(const n of r.addedNodes)if(n instanceof HTMLElement&&n.classList.contains('modalback'))patchModal(n,s);schedule()}).observe(document.body,{childList:true});
setTimeout(schedule,0);
// 继续旧存档时，game.js 已经先于本补丁完成了首屏 render；主动把“当前页”原地重绘一次，
// 让新增调查点和改写后的数据立刻进入 DOM。新开案件不需要这一步，因为后续 render 天然使用新数据。
setTimeout(()=>{
  try{
    const s=state();if(!s?.started||sessionStorage.getItem('wl_logic300_first_render'))return;
    const btn=document.querySelector(`[data-tool="${s.page}"]`);
    if(btn&&!btn.classList.contains('locked')){sessionStorage.setItem('wl_logic300_first_render','1');btn.click()}
  }catch{}
},0);

/* 自检：只检查本补丁自身可静态验证的核心约束。 */
function selfTest(){
  const errors=[],byId=new Map((D.postcards||[]).map(p=>[p.id,p]));let cur=9,route=[];
  const originalText={1:'桥影压雪，归路看五',2:'松针落肩，八号灯灭',3:'风口向北，七阶后停',4:'塔钟无声，九点回望',5:'湖面冻白，二痕如线',6:'泉路最好，四时莫行',7:'旧站封门，一钥向前',8:'鸦林深处，六木相接',9:'夏峰无雪，三岔右行'};for(let i=0;i<9;i++){const p=byId.get(cur);if(!p){errors.push('明信片链缺卡 '+cur);break}route.push(cur);const base=String(p.text||'').split(/[｜|]/)[0].trim();if(base!==originalText[p.id])errors.push('明信片原谜面被改写：'+p.id);cur=p.next}
  if(route.join(',')!=='9,3,7,1,5,2,8,6,4'||cur!==9)errors.push('明信片闭环异常');
  const phrase=route.map(id=>byId.get(id)?.backMark||byId.get(id)?.extract||'').join('');
  if(phrase!=='旧钟背后第三格第三板')errors.push('明信片边角字拼接异常：'+phrase);
  for(const [loc,id] of [['lobby','qiao_original'],['lobby','power_log'],['dining','kitchen_ticket'],['room09','blackmail_draft']])if(!D.locations?.[loc]?.spots?.some(x=>x[0]===id))errors.push('缺少现场时间证物入口 '+id);
  if(yao?.talks?.find(t=>t[0]==='杯子')?.[1]?.includes('服务员靠颜色认人'))errors.push('旧服务员口径未替换');
  if(D.evidence?.E16?.[0]!=='沈知遥晚餐摆台记录')errors.push('E16仍暗示普通服务员');
  const d1=(D.deductions||[]).find(d=>d.id==='D01'),d2=(D.deductions||[]).find(d=>d.id==='D02'),d7=(D.deductions||[]).find(d=>d.id==='D07');
  if(!d1||d1.needAny.some(set=>set.includes('E31')))errors.push('D01仍可绕过时间校准');
  if(!d2||d2.needAny.some(set=>set.includes('E32')))errors.push('D02仍可绕过时间校准');
  if(!d7||d7.needAny.some(set=>sameSet(set,['E18','E25','E28'])))errors.push('D07仍保留信息量不足捷径');
  if(!D.evidence?.E44?.[1]?.includes('公共安全'))errors.push('E44获取理由仍不自然');
  const sourceMap={tang:['tang','来访目的'],fang:['fang','1998'],ji:['ji','明信片'],ji09:['ji','09晴峰房'],shen:['shen','1998事故'],qiao:['qiao','晴峰窗外'],luo:['luo','改造图纸'],yao98:['yao','1998家中记录'],lu98:['lu','1998事故接诊'],qiao98:['qiao','1998旧站拍摄'],luo98:['luo','1998现场测量'],tang98:['tang','1998遇难者']};
  for(const c of D.contradictions||[]){const ref=sourceMap[c.id];if(!ref)continue;const talk=D.people?.find(p=>p.id===ref[0])?.talks?.find(t=>t[0]===ref[1]);if(!talk||talk[1]!==c.quote)errors.push('质证原话没有真实访谈来源 '+c.id)}
  for(const old of ['母亲留下的名单','1998急诊页','1998底片','1998测绘本','父亲唐世明'])if(D.people?.some(p=>p.talks?.some(t=>t[0]===old)))errors.push('旧口供标签仍在 '+old);
  if((D.hints?.culprit||[]).some(x=>/E30|隐藏结局奖励/.test(x)))errors.push('责任链提示仍剧透隐藏奖励');
  return{ok:!errors.length,errors,route,phrase}
}

window.WL_LOGIC_300_TEST=selfTest;const r=selfTest();if(!r.ok)console.error('[WL logic 3.1.1]',r.errors);else console.info('[WL logic 3.1.1] 原明信片机制、叙事来源、时间证物与现场证物门控自检通过');
})();
