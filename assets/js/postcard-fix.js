(()=>{'use strict';
const D=window.WL_DATA,V=window.WL_VALIDATION;
if(!D||!V)return;

D.version='2.9.0';

const ROUTE=[9,3,7,1,5,2,8,6,4];
const MARKS=new Map([[9,'旧'],[3,'钟'],[7,'背'],[1,'后'],[5,'第'],[2,'三'],[8,'格'],[6,'第三'],[4,'板']]);
const PHRASE='旧钟背后第三格第三板';
const BASE_TEXT=new Map();

for(const p of D.postcards||[]){
  const mark=MARKS.get(p.id);
  if(!mark)continue;
  if(!BASE_TEXT.has(p.id)){
    BASE_TEXT.set(p.id,String(p.text||'').replace(/\s*[｜|]\s*边角小字「[^」]*」\s*$/,''));
  }
  p.extract=mark;
  p.backMark=mark;
  p.text=BASE_TEXT.get(p.id)+`｜边角小字「${mark}」`;
}
D.postcardRoute=[...ROUTE];
D.postcardPhrase=PHRASE;
D.postcardRule='第一层只确定阅读顺序；第二层按该顺序读取每张背面可见的“边角小字”。邮戳日期保留年代信息，不再承担隐藏取字规则。';

D.hints.route=[
  '“第九张没有雪”只是在告诉你从哪张开始，不是第二层取字规则。',
  '从09开始，只看每张背面正文里明确写出的下一张编号：09→03→07→01→05→02→08→06→04。',
  '第一层完整闭环是 9→3→7→1→5→2→8→6→4；最后04又指回09，说明没有断链。'
];
D.hints.phrase=[
  '第一层只负责确定“读卡顺序”。现在按 9→3→7→1→5→2→8→6→4 重新打开九张卡，只读取每张背面可见的“边角小字”。',
  '按顺序抄下边角字：旧、钟、背、后、第、三、格、第三、板。这里不需要再拿邮戳日期做第二次取字。',
  '九段连起来就是“旧钟背后第三格第三板”。去旧钟楼背板，找第三格里的第三块活动木板；现场“3 / 格 / 3”刻痕和罗诚的证词用于印证。'
];

if(D.locations?.clock){
  D.locations.clock.desc='老式木结构钟楼内部。机械钟与分格木背板仍保留；明信片暗号要求检查背板第三格中的活动木板。';
  const board=D.locations.clock.spots?.find(s=>s[0]==='board');
  if(board){
    board[1]='第三格 · 第三块活动木板';
    board[2]='按明信片暗号检查背板第三格，其中第三块木板可以活动；板后藏有135胶卷盒和一把旧档案柜钥匙。';
  }
  const marks=D.locations.clock.spots?.find(s=>s[0]==='marks');
  if(marks)marks[2]='背板第三格边缘可见“3 / 格 / 3”的旧铅笔刻痕，与明信片读出的“第三格第三板”相互印证。';
}
if(D.finalAnswers?.postcards){
  D.finalAnswers.postcards='九张明信片先用编号闭环确定阅读顺序，再用背面边角小字拼出“旧钟背后第三格第三板”，从而保存1998旧案档案的藏匿位置。';
}

const norm=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
const neg=/(不是|并非|没有|并没有|并未|不在|不位于|不可能|不能|无法|否认|非)/;
V.phraseAnswerOk=value=>{
  const raw=String(value||''),v=norm(raw);
  if(neg.test(v))return false;
  const clock=v.includes('旧钟');
  const back=v.includes('背后')||v.includes('钟后');
  const thirdCell=v.includes('第三格')||(v.includes('三')&&v.includes('格'));
  const thirdBoard=/(第三(?:格)?(?:里|内|中的?)?第三?(?:块)?(?:活动)?(?:木板|板|石砖|砖)|第三(?:块)?(?:活动)?(?:木板|板|石砖|砖))/.test(v);
  return clock&&back&&thirdCell&&thirdBoard;
};

function esc(s){return String(s??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}

function patchPostcardPage(){
  for(const el of document.querySelectorAll('.objective-step,.case-objective-step')){
    const t=el.textContent||'';
    if(/比较日期与题字|提取“具体地点/.test(t)){
      el.textContent='第一层顺序已经确定；按该顺序逐张读取明信片背面的“边角小字”，把九段连成具体藏匿位置。';
    }
  }
  const root=document.querySelector('.postcard-table');
  if(!root)return;
  const paper=root.querySelector('.puzzle-paper');
  if(!paper)return;

  const first=[...paper.querySelectorAll('h3')].find(x=>x.textContent.trim()==='第一层');
  if(first){
    const p=first.nextElementSibling;
    if(p&&p.tagName==='P'&&!p.dataset.wlRoute290){
      p.dataset.wlRoute290='1';
      p.textContent='从“第九张没有雪”确定起点，只根据每张背面正文里的数字指向追完整个闭环。边角小字先不要用，它属于第二层。';
    }
  }

  const second=[...paper.querySelectorAll('h3')].find(x=>x.textContent.trim()==='第二层');
  if(second){
    const p=second.nextElementSibling;
    if(p&&p.tagName==='P'){
      p.dataset.wlPhrase290='1';
      p.textContent='第一层只负责确定阅读顺序。现在按 9→3→7→1→5→2→8→6→4 重新打开九张卡，依次读取每张背面可见的“边角小字”，把它们连起来就是藏匿位置。邮戳日期不再参与二次取字。';
    }
    if(!paper.querySelector('[data-wl-postcard-rule]')){
      const note=document.createElement('div');
      note.dataset.wlPostcardRule='1';
      note.className='wl-postcard-rule';
      note.innerHTML='<b>第二层规则</b><span>顺序决定“先读哪张”；边角小字决定“地点写什么”。所有需要的字都能在明信片背面直接看到。</span>';
      p?.insertAdjacentElement('afterend',note);
    }
    const input=paper.querySelector('#phraseInput');
    if(input)input.placeholder='把九张卡的边角小字按第一层顺序连起来';
  }

  const success=paper.querySelector('.success-note p');
  if(success&&success.textContent!=='已解出“旧钟背后第三格第三板”。去旧钟楼按“第三格 → 第三块活动木板”核验并取得档案钥匙。'){
    success.textContent='已解出“旧钟背后第三格第三板”。去旧钟楼按“第三格 → 第三块活动木板”核验并取得档案钥匙。';
  }
}

function patchPostcardModal(modal){
  const back=modal.querySelector('.post-back');
  const hand=back?.querySelector('.hand');
  if(!back||!hand||back.dataset.wlPostcard290)return;
  const match=hand.textContent.match(/^(.*?)\s*[｜|]\s*边角小字「([^」]+)」\s*$/);
  if(!match)return;
  back.dataset.wlPostcard290='1';
  hand.textContent=match[1];
  const mark=document.createElement('div');
  mark.className='wl-edge-mark';
  mark.innerHTML=`<span>背面边角小字</span><b>${esc(match[2])}</b><small>第一层只看正文里的数字指向；第二层再按第一层顺序读取这个字。</small>`;
  hand.insertAdjacentElement('afterend',mark);
  const old=back.querySelector('small:not(.wl-edge-mark small)');
  if(old)old.textContent='正文中的数字用于第一层闭环；“边角小字”用于第二层地点拼接。';
}

const HINT_REPLACEMENTS=new Map([
 ['按已经确认的顺序比较邮戳日期与题字，逐张取出对应位置的字。','按第一层顺序重新打开九张卡，逐张读取背面可见的“边角小字”。邮戳日期不再承担隐藏取字规则。'],
 ['在第二层写明“旧钟背后第三格的第三块木板/石砖”；提交后才会取得档案钥匙。','边角字按第一层顺序连成“旧钟背后第三格第三板”；写出这个位置后，再去旧钟楼现场核验并取得档案钥匙。']
]);
function patchHintModal(modal){
  for(const p of modal.querySelectorAll('p')){
    const replacement=HINT_REPLACEMENTS.get(p.textContent.trim());
    if(replacement)p.textContent=replacement;
  }
}

function patchModal(modal){
  if(!(modal instanceof HTMLElement))return;
  patchPostcardModal(modal);
  patchHintModal(modal);
}

function start(){
  patchPostcardPage();
  const app=document.getElementById('app');
  if(app){
    new MutationObserver(()=>requestAnimationFrame(patchPostcardPage))
      .observe(app,{childList:true});
  }
  if(document.body){
    new MutationObserver(records=>{
      for(const r of records)for(const n of r.addedNodes){
        if(n instanceof HTMLElement&&n.classList.contains('modalback'))requestAnimationFrame(()=>patchModal(n));
      }
    }).observe(document.body,{childList:true});
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();

function selfTest(){
  const byId=new Map((D.postcards||[]).map(p=>[p.id,p]));
  let id=9,route=[],guard=0;
  while(guard++<9){
    const p=byId.get(id); if(!p)break;
    route.push(id); id=p.next;
  }
  const phrase=ROUTE.map(x=>byId.get(x)?.extract||'').join('');
  const errors=[];
  if(route.join(',')!==ROUTE.join(','))errors.push('第一层 next 闭环与既定顺序不一致');
  if(id!==9)errors.push('第一层末张没有回指09，闭环不完整');
  if(phrase!==PHRASE)errors.push(`第二层可见字顺序错误：${phrase}`);
  if(!V.phraseAnswerOk(PHRASE))errors.push('标准地点不能通过验证');
  if(!V.phraseAnswerOk('旧钟背后第三格的第三块活动木板'))errors.push('自然语言答案不能通过验证');
  if(V.phraseAnswerOk('不是旧钟背后第三格第三板'))errors.push('否定答案被错误接受');
  if(errors.length)console.error('[WL postcard 2.9.0]',errors);
  else console.info('[WL postcard 2.9.0] 第一层闭环、第二层可见字与地点验证通过');
  return {ok:!errors.length,route,phrase,errors};
}
window.WL_POSTCARD_FIX_TEST=selfTest;
selfTest();
})();