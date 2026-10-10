from pathlib import Path
p=Path('/tmp/v159/app.js')
s=p.read_text()
s=s.replace("var mock=null;\nvar timer=null;", "var mock=null;\nvar privateMockContext=null;\nvar timer=null;")
s=s.replace("if(screen==='mock')renderMockSetup();", "if(screen==='mock'){if(privateMockContext)renderPrivateExamSetup();else renderMockSetup();}")
# insert private setup before mockQuestionScore
marker="function mockQuestionScore(q){"
fn=r'''function renderPrivateExamSetup(){
 var setup=$('mockSetup'),run=$('mockRun'),x=privateMockContext;
 if(!setup||!x)return;
 if(run)run.className='panel hidden';
 setup.className='panel';
 var total=Array.isArray(x.questions)?x.questions.length:0;
 var defaultCount=Math.min(total,parseInt(x.questionsPerAttempt||total,10)||total);
 var savedTime=parseInt(x.time,10)||0;
 var teacher=x.instructor||x.teacherName||'';
 var h='<div class="private-exam-builder">';
 h+='<div class="private-exam-head"><span class="page-kicker">🔐 Private Exam Simulation</span><h2>'+esc(x.title||'Private Exam')+'</h2><p>This simulation belongs only to this created exam. It does not use or modify the main Licensure or Global question banks.</p></div>';
 h+='<div class="private-exam-info-grid">';
 h+='<div><span>📝 Questions</span><b>'+total+'</b></div>';
 h+='<div><span>👨‍🏫 Teacher</span><b>'+esc(teacher||'Not specified')+'</b></div>';
 h+='<div><span>🔐 Access</span><b>Private</b></div>';
 h+='<div><span>📅 Created</span><b>'+esc(x.createdAt?new Date(x.createdAt).toLocaleDateString():'')+'</b></div>';
 h+='</div>';
 h+='<div class="private-section-title"><b>Exam Settings</b><small>Customize this attempt without changing the saved exam.</small></div>';
 h+='<div class="private-config-grid">';
 h+='<label>Questions<input id="privateMockCount" class="select" type="number" min="1" max="'+total+'" value="'+defaultCount+'"></label>';
 h+='<div><span class="mock-label">Time Limit</span><div class="time-mode-grid"><button type="button" class="time-mode '+(savedTime>0?'active':'')+'" data-private-time="timed">⏱️ Timed</button><button type="button" class="time-mode '+(savedTime>0?'':'active')+'" data-private-time="unlimited">♾️ Unlimited</button></div></div>';
 h+='<label id="privateMinutesWrap">Minutes<input id="privateMockMinutes" class="select" type="number" min="1" max="600" value="'+(savedTime||30)+'"></label>';
 h+='</div>';
 h+='<div class="private-exam-note">📚 <b>Private question set:</b> '+total+' question'+(total===1?'':'s')+' saved inside <b>My Created Exams</b>. Your attempt will be recorded as a private exam attempt.</div>';
 h+='<div class="private-pool-summary"><span>Available questions</span><b>'+total+'</b><small>Private Exam</small></div>';
 h+='<div class="private-actions"><button class="btn primary" id="beginPrivateMock">▶ Begin Private Exam</button><button class="btn" id="backPrivateMock">← Back to Created Exams</button></div>';
 h+='</div>';
 setup.innerHTML=h;
 var timeMode=savedTime>0?'timed':'unlimited';
 var times=document.querySelectorAll('[data-private-time]'),i;
 for(i=0;i<times.length;i++)times[i].onclick=function(){var all=document.querySelectorAll('[data-private-time]'),j;for(j=0;j<all.length;j++)all[j].classList.remove('active');this.classList.add('active');timeMode=this.getAttribute('data-private-time')||'timed';var w=$('privateMinutesWrap');if(w)w.style.display=timeMode==='unlimited'?'none':'block';};
 var minutesWrap=$('privateMinutesWrap');if(minutesWrap)minutesWrap.style.display=timeMode==='unlimited'?'none':'block';
 $('backPrivateMock').onclick=function(){privateMockContext=null;show('createExam');};
 $('beginPrivateMock').onclick=function(){
   var count=Math.max(1,Math.min(total,parseInt($('privateMockCount').value,10)||total));
   var mins=timeMode==='unlimited'?-1:Math.max(1,parseInt($('privateMockMinutes').value,10)||30);
   var pool=x.questions.slice(0,count);
   mock={pool:pool,index:0,answers:{},seconds:mins<0?-1:mins*60,mode:'created',timeMode:mins<0?'unlimited':'timed',title:x.title,createdExamId:x.id,teacherName:x.instructor||'',teacherPhone:x.teacherPhone||''};
   setup.className='panel hidden';if(run)run.className='panel';renderMockQuestion();clearInterval(timer);timer=null;
   if(mins>0){timer=setInterval(function(){if(!mock)return;mock.seconds--;if(mock.seconds<=0){mock.seconds=0;renderMockTimer();finishMock();return;}renderMockTimer();},1000);}
 };
}

'''
s=s.replace(marker,fn+marker)
# replace openCreatedExamForPractice function
old_start=s.index('function openCreatedExamForPractice(id){')
old_end=s.index('\nfunction deleteCreatedExam', old_start)
new=r'''function openCreatedExamForPractice(id){
 var x=(state.createdExams||[]).find(function(e){return e.id===id;});
 if(!x||!x.questions||!x.questions.length){toast('This private exam has no questions.');return;}
 privateMockContext=x;
 clearInterval(timer);timer=null;mock=null;
 show('mock');
}
'''
s=s[:old_start]+new+s[old_end:]
# ensure starting created exam from create editor also goes to private setup
old="if(start){mock={pool:qs,index:0,answers:{},seconds:d.time>0?parseInt(d.time,10)*60:-1,mode:'created',timeMode:d.time>0?'timed':'unlimited',title:d.title,createdExamId:d.id,teacherName:d.instructor||'',teacherPhone:d.teacherPhone||''};show('mock');renderMockQuestion();clearInterval(timer);if(d.time>0){timer=setInterval(function(){if(!mock)return;mock.seconds--;if(mock.seconds<=0){mock.seconds=0;renderMockTimer();finishMock();return;}renderMockTimer();},1000);}}}"
new="if(start){privateMockContext=d;clearInterval(timer);timer=null;mock=null;show('mock');}}}"
if old not in s: print('old save start block not found')
s=s.replace(old,new)
# nav mock should leave private mode
needle="var target=this.getAttribute('data-screen');if(this.classList.contains('launch-license'))"
s=s.replace(needle,"var target=this.getAttribute('data-screen');if(target==='mock')privateMockContext=null;if(this.classList.contains('launch-license'))")
p.write_text(s)
