from pathlib import Path
p=Path('/mnt/data/v123work/app.js')
s=p.read_text()
start=s.index('function renderMockQuestion(){')
end=s.index('function renderBank(){', start)
new=r'''function renderMockQuestion(){
 var q=mock.pool[mock.index],opts=q.originalOptions||{},keys=Object.keys(opts),selected=mock.answers[q.id]||'',answered=!!selected;
 var h='<div class="q-top"><span>Question '+(mock.index+1)+' / '+mock.pool.length+'</span><span class="timer" id="mockTimer"></span></div>';
 h+='<div class="mock-run-meta"><span class="mock-run-badge">'+(mock.mode==='adaptive'?'🧠 Smart Adaptive':'🎯 Custom Exam')+'</span><span class="mock-progress">'+Math.round(((mock.index+1)/mock.pool.length)*100)+'% complete</span></div>';
 h+='<div class="mock-q">'+esc(q.originalQuestion)+'</div><div id="mockOptions">';
 var i;
 for(i=0;i<keys.length;i++){
  var k=keys[i],v=opts[k];if(!text(v).trim())continue;
  var cls='option';
  if(answered){if(isCorrect(q,k))cls+=' correct';if(k===selected&&!isCorrect(q,k))cls+=' wrong';cls+=' disabled';}
  h+='<button class="'+cls+'" data-key="'+esc(k)+'"><span class="letter">'+esc(k)+'</span><span>'+esc(v)+'</span></button>';
 }
 h+='</div><div id="mockFeedback"></div>';
 h+='<div class="actions"><button class="btn" id="mockPrev">← Previous</button><button class="btn primary" id="mockNext">'+(mock.index===mock.pool.length-1?'Finish':'Next Question →')+'</button></div>';
 $('mockRun').innerHTML=h;
 renderMockTimer();
 if(answered)renderMockFeedback(q,selected);
 var os=document.querySelectorAll('#mockOptions .option'),j;
 for(j=0;j<os.length;j++)os[j].onclick=function(){if(!mock.answers[q.id])chooseMock(q,this.getAttribute('data-key'));};
 $('mockPrev').onclick=function(){if(mock.index>0){mock.index--;renderMockQuestion();}};
 $('mockNext').onclick=function(){if(mock.index<mock.pool.length-1){mock.index++;renderMockQuestion();}else finishMock();};
}
function renderMockFeedback(q,key){
 var box=$('mockFeedback');if(!box)return;
 var ok=isCorrect(q,key),opts=q.originalOptions||{},correctLetter=text(q.correctAnswer||'').trim();
 var correctText='';
 if(correctLetter&&opts[correctLetter])correctText=opts[correctLetter];
 else{var ks=Object.keys(opts),i;for(i=0;i<ks.length;i++)if(isCorrect(q,ks[i])){correctLetter=ks[i];correctText=opts[ks[i]];break;}}
 var f='<div class="mock-feedback '+(ok?'is-correct':'is-wrong')+'">';
 f+='<div class="feedback-title">'+(ok?'✅ Correct Answer':'❌ Incorrect Answer')+'</div>';
 f+='<div class="feedback-correction"><b>Correct answer:</b> '+esc(correctLetter)+(correctText?' — '+esc(correctText):'')+'</div>';
 if(!ok)f+='<div class="feedback-your-answer"><b>Your answer:</b> '+esc(key||'Not answered')+(opts[key]?' — '+esc(opts[key]):'')+'</div>';
 if(q.explanation)f+='<div class="feedback-explanation"><b>📖 Explanation</b><br>'+esc(q.explanation)+'</div>';
 if(q.whyA)f+='<div class="feedback-line"><b>Why A?</b> '+esc(q.whyA)+'</div>';
 if(q.whyNotB)f+='<div class="feedback-line"><b>Why not B?</b> '+esc(q.whyNotB)+'</div>';
 if(q.whyNotC)f+='<div class="feedback-line"><b>Why not C?</b> '+esc(q.whyNotC)+'</div>';
 if(q.whyNotD)f+='<div class="feedback-line"><b>Why not D?</b> '+esc(q.whyNotD)+'</div>';
 if(q.whyNotE)f+='<div class="feedback-line"><b>Why not E?</b> '+esc(q.whyNotE)+'</div>';
 f+='</div>';
 box.innerHTML=f;
}
function chooseMock(q,key){
 if(!mock||mock.answers[q.id])return;
 mock.answers[q.id]=key;
 var ok=isCorrect(q,key);
 beep(ok);
 try{if(navigator.vibrate)navigator.vibrate(ok?[35,25,35]:[70]);}catch(e){}
 document.body.classList.remove('answer-correct-pulse','answer-wrong-shake');
 void document.body.offsetWidth;
 document.body.classList.add(ok?'answer-correct-pulse':'answer-wrong-shake');
 setTimeout(function(){document.body.classList.remove('answer-correct-pulse','answer-wrong-shake');},450);
 renderMockQuestion();
}
function finishMock(){
 if(!mock)return;
 clearInterval(timer);timer=null;
 var score=0,i,q,k,results=[];
 for(i=0;i<mock.pool.length;i++){
  q=mock.pool[i];k=mock.answers[q.id]||'';var ok=isCorrect(q,k);if(ok)score++;
  results.push({questionId:q.id,selected:k,correct:ok});
  state.attempts.push({questionId:q.id,selected:k,correct:ok,time:new Date().toISOString(),mode:'mock'});
 }
 state.examHistory.push({date:new Date().toISOString(),score:score,total:mock.pool.length,percent:pct(score,mock.pool.length),mode:mock.mode,timeMode:mock.timeMode});
 saveState();
 var p=pct(score,mock.pool.length),h='';
 h+='<div class="mock-result-hero"><div class="result-trophy">🏆</div><span class="page-kicker">Mock Exam Result</span><h2>'+score+' / '+mock.pool.length+'</h2><p>Accuracy: <b>'+p+'%</b></p><div class="bar"><i style="width:'+p+'%"></i></div><div class="result-status">'+(p>=85?'🎉 Excellent performance':p>=70?'👍 Good progress':p>=60?'📚 Keep reviewing your weak areas':'⚠️ Focus on mistakes and high-priority topics')+'</div></div>';
 h+='<div class="mock-result-actions"><button class="btn primary" id="againMock">New Mock Exam</button><button class="btn" id="goIntel">🧠 Intelligence</button></div>';
 h+='<div class="mock-review-head"><h3>📝 Question-by-Question Review</h3><p>Correct answer, your answer, and full correction.</p></div>';
 for(i=0;i<mock.pool.length;i++){
  q=mock.pool[i];k=mock.answers[q.id]||'';var ok2=isCorrect(q,k),opts=q.originalOptions||{},ks=Object.keys(opts),cl='mock-review-card '+(ok2?'review-correct':'review-wrong');
  var ca=text(q.correctAnswer||'').trim(),ct=ca&&opts[ca]?opts[ca]:'';
  if(!ca){for(var z=0;z<ks.length;z++)if(isCorrect(q,ks[z])){ca=ks[z];ct=opts[ks[z]];break;}}
  h+='<div class="'+cl+'"><div class="review-q-head"><b>Question '+(i+1)+'</b><span>'+(ok2?'✅ Correct':'❌ Incorrect')+'</span></div><div class="review-question">'+esc(q.originalQuestion)+'</div><div class="review-answer"><b>Correct:</b> '+esc(ca)+(ct?' — '+esc(ct):'')+'</div><div class="review-answer"><b>Your answer:</b> '+esc(k||'Not answered')+(k&&opts[k]?' — '+esc(opts[k]):'')+'</div>';
  if(q.explanation)h+='<div class="review-explanation"><b>📖 Explanation</b><br>'+esc(q.explanation)+'</div>';
  if(q.whyA)h+='<div class="review-line"><b>Why A?</b> '+esc(q.whyA)+'</div>';
  if(q.whyNotB)h+='<div class="review-line"><b>Why not B?</b> '+esc(q.whyNotB)+'</div>';
  if(q.whyNotC)h+='<div class="review-line"><b>Why not C?</b> '+esc(q.whyNotC)+'</div>';
  if(q.whyNotD)h+='<div class="review-line"><b>Why not D?</b> '+esc(q.whyNotD)+'</div>';
  if(q.whyNotE)h+='<div class="review-line"><b>Why not E?</b> '+esc(q.whyNotE)+'</div>';
  h+='</div>';
 }
 $('mockRun').innerHTML=h;
 $('againMock').onclick=function(){mock=null;renderMockSetup();};
 $('goIntel').onclick=function(){mock=null;show('intel');};
 mock=null;renderHome();
}
'''
s=s[:start]+new+s[end:]
p.write_text(s)
