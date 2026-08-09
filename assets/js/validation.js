(()=>{'use strict';
const norm=s=>String(s||'').toLowerCase().replace(/[\s，。、“”‘’；;：:,.!！?？/\\\-（）()【】\[\]]/g,'');
const disqualifyingNegation=v=>/(不是|并非|没有|并没有|并未|未曾|从未|不曾|不可能|不能|无法|不属于|不一致|完全不同|并不相同|否认|否定|非同一)/.test(norm(v));
const includesAny=(v,terms)=>terms.some(t=>v.includes(norm(t)));
function finalAnswerOk(value,key,rules){
  const v=norm(value),rule=rules?.[key];
  if(!rule||v.length<(rule.minLength||2)||disqualifyingNegation(v))return false;
  if((rule.forbidden||[]).some(t=>v.includes(norm(t))))return false;
  return (rule.groups||[]).every(group=>includesAny(v,group));
}
function roomAnswerOk(value){const v=norm(value);return /(?:^|[^0-9])0?6(?:[^0-9]|$)/.test(String(value||''))&&v.includes('鹿泉')&&!disqualifyingNegation(v)}
function oldRoomAnswerOk(value){
  const v=norm(value);
  const door=/(门.{0,6}(内侧|里面|内部|内).{0,6}(锁|插销|扣住|闭锁)|(内侧|里面|内部|内).{0,6}(插销|门锁|锁舌).{0,6}(扣住|闭合|锁住|反锁))/.test(v);
  const window=/(窗.{0,9}(未开|没开|没有开|未动|没动|封闭|关闭|积尘连续|积灰连续)|窗槽.{0,8}(积尘连续|积灰连续)|积尘.{0,6}(窗|窗槽))/.test(v);
  const contrary=/(门.{0,5}(没有|并未|未).{0,4}(内锁|插销|反锁)|窗.{0,4}(已经|曾经|从).{0,4}(打开|开启))/.test(v);
  return door&&window&&!contrary;
}
function phraseAnswerOk(value){const v=norm(value);return !disqualifyingNegation(v)&&v.includes('旧钟')&&v.includes('三')&&(v.includes('格')||v.includes('块'))&&(v.includes('砖')||v.includes('板'))}
function identityAnswerOk(value){
  const v=norm(value),hits=['眉','耳','脸','鼻','颧','眼'].filter(k=>v.includes(k)).length;
  const affirmative=/(同一人|同一身份|属于同一|就是方志远|方致远就是|确认一致|特征一致)/.test(v);
  const contrary=/(不是同一|并非同一|非同一|不同|不一致|无法确认|不能确认|否认同一)/.test(v);
  return hits>=2&&affirmative&&!contrary;
}
window.WL_VALIDATION={norm,disqualifyingNegation,finalAnswerOk,roomAnswerOk,oldRoomAnswerOk,phraseAnswerOk,identityAnswerOk};
})();
