(()=>{'use strict';
const PAID_KEY='_wuling_manor_support_v1',PROMPTED_KEY='_wuling_manor_support_prompted_v1',SESSION_KEY='_wuling_manor_support_session',COOKIE_KEY='_wuling_support_flag';
const getCookie=name=>document.cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1)||'';
const setCookie=(name,value,days)=>{const d=new Date(Date.now()+days*86400000);document.cookie=`${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax`};
const safeGet=(store,key)=>{try{return store.getItem(key)||''}catch{return''}};
const safeSet=(store,key,value)=>{try{store.setItem(key,value)}catch{}};
const Support={
  hasPaid(){return!!(safeGet(localStorage,PAID_KEY)||safeGet(sessionStorage,SESSION_KEY)||getCookie(COOKIE_KEY))},
  hasPrompted(){return!!safeGet(localStorage,PROMPTED_KEY)},
  markPrompted(){safeSet(localStorage,PROMPTED_KEY,'1')},
  markPaid(){const token=btoa(`${Date.now()}_${Math.random().toString(36).slice(2,10)}_wuling`);safeSet(localStorage,PAID_KEY,token);safeSet(sessionStorage,SESSION_KEY,token);setCookie(COOKIE_KEY,token,365)},
  promptOnce(config){if(this.hasPaid()||this.hasPrompted())return false;this.markPrompted();return this.show(config)},
  show(config={}){
    if(this.hasPaid())return false;
    const existing=document.getElementById('support-overlay');if(existing){existing.hidden=false;requestAnimationFrame(()=>existing.classList.add('show'));existing.querySelector('.support-close')?.focus();return true}
    const cfg={qrCode:'assets/images/paycode.png',price:'1元',title:'支持《雾岭山庄谜案》',studio:'abc studio',...config};
    const overlay=document.createElement('div');overlay.id='support-overlay';overlay.className='support-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','support-title');
    overlay.innerHTML=`<section class="support-card"><button class="support-close" type="button" aria-label="关闭自愿支持窗口">×</button><div class="support-inner"><header><div class="support-title-row"><span>◇</span><h2 id="support-title">${cfg.title}</h2><span>◇</span></div><p>${cfg.price} 自愿支持 · 不影响调查与结局</p></header><div class="support-body"><figure><img src="${cfg.qrCode}" alt="${cfg.price}自愿支持收款码"><figcaption>请用某宝扫码，自愿支持 ${cfg.price}</figcaption></figure><div class="support-message"><b>你好，我是 ${cfg.studio} 的独立开发者。</b><p>这座山庄里的每份卷宗、每条时间线和每一场暴雪，都经过了反复打磨。如果这次调查给你留下了一点印象，愿意支持 <strong>${cfg.price}</strong>，会成为我继续制作网页解谜的动力。</p><p class="support-note">一元买不到山下的热咖啡，但能让雾岭的下一盏灯继续亮着。</p><p>完全自愿，不验证付款，不解锁额外线索，也不会改变提示、存档或任何结局。</p></div></div><footer><p>清除浏览器数据后，本地记录可能消失；案件重置不会清除支持记录。</p><div><button class="support-button done" type="button">已完成支持 ♡</button><button class="support-button later" type="button">暂时关闭</button></div></footer><small>${cfg.studio}</small></div></section>`;
    document.body.appendChild(overlay);
    const close=()=>this.hide();overlay.querySelector('.support-close').onclick=close;overlay.querySelector('.later').onclick=close;overlay.querySelector('.done').onclick=()=>{this.markPaid();this.hide();this.thanks()};overlay.onclick=e=>{if(e.target===overlay)close()};overlay.onkeydown=e=>{if(e.key==='Escape')close()};
    requestAnimationFrame(()=>requestAnimationFrame(()=>overlay.classList.add('show')));overlay.querySelector('.support-close').focus();return true;
  },
  hide(){const overlay=document.getElementById('support-overlay');if(!overlay)return;overlay.classList.remove('show');overlay.classList.add('closing');setTimeout(()=>{overlay.hidden=true;overlay.classList.remove('closing')},320)},
  thanks(){const el=document.createElement('div');el.className='support-thanks';el.textContent='感谢你的支持！山庄的灯还会继续亮着。';document.body.appendChild(el);setTimeout(()=>el.classList.add('show'),30);setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),320)},3000)}
};
window.WulingSupport=Support;
})();
