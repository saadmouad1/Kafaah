from pathlib import Path
p=Path('/mnt/data/v119work/app.js')
s=p.read_text()
needle=" var sig={},rep=[];\n"
insert=r''' var sig={},rep=[];
 // Smart analytics layer: readiness, trend, coverage, consistency and study priorities.
 var uniqueCount=Object.keys(uniqueAttempted).length;
 var coverage=arr.length?pct(uniqueCount,arr.length):0;
 var recent=state.examHistory||[], trend=0, consistency=0;
 if(recent.length>=2){
   var last=recent.slice(-5), vals=[];
   for(i=0;i<last.length;i++) vals.push(Number(last[i].percent!=null?last[i].percent:pct(last[i].score,last[i].total))||0);
   trend=vals[vals.length-1]-vals[0];
   var mean=0;for(i=0;i<vals.length;i++)mean+=vals[i];mean/=vals.length;
   var variance=0;for(i=0;i<vals.length;i++)variance+=Math.pow(vals[i]-mean,2);variance/=vals.length;
   consistency=Math.max(0,Math.round(100-Math.sqrt(variance)*2));
 }else if(scoped.length){
   var recentN=Math.min(10,scoped.length),rc=0;
   for(i=scoped.length-recentN;i<scoped.length;i++)if(scoped[i].correct)rc++;
   trend=pct(rc,recentN)-accuracy; consistency=Math.min(100,Math.round(accuracy));
 }
 var readiness=Math.round((accuracy*0.50)+(Math.min(100,coverage*3)*0.20)+(Math.max(0,Math.min(100,50+trend*2))*0.15)+(consistency*0.15));
 if(!scoped.length)readiness=0;
 var readinessLabel=readiness>=85?'Exam Ready':readiness>=70?'Good Progress':readiness>=50?'Needs Focus':'Build Foundations';
 var priorityTopics=[];
 for(var pk in topicStats)if(topicStats.hasOwnProperty(pk)){
   var ps=topicStats[pk],pa=pct(ps.c,ps.n),freq=ps.n;
   if(freq>=1) priorityTopics.push({topic:ps.topic,subject:ps.subject,p:pa,n:freq,score:(100-pa)*0.7+Math.min(freq,10)*3});
 }
 priorityTopics.sort(function(a,b){return b.score-a.score;});
 var nextAction='Keep practicing to generate enough data for personalized recommendations.';
 if(scoped.length){
   if(weakT.length)nextAction='Focus first on '+weakT[0].topic+' in '+subjectName(weakT[0].subject)+'.';
   else if(trend<0)nextAction='Your recent performance is declining. Review recent mistakes before starting another mock.';
   else if(coverage<25)nextAction='Increase question coverage across more topics before judging readiness.';
   else if(accuracy>=85)nextAction='You are performing strongly. Use timed mocks to test consistency under exam conditions.';
   else nextAction='Continue targeted practice, then retest your weakest topics.';
 }
'''
if needle not in s: raise SystemExit('needle not found')
s=s.replace(needle,insert,1)
needle2=" h+='<div class=\"metric-grid analytics-metrics\">';\n"
insert2=r''' h+='<div class="smart-insight analytics-smart">';
 h+='<div class="smart-head"><div><span class="smart-kicker">🧠 Smart Analytics</span><h2>Study Intelligence</h2><p>Automatically prioritizes what you should study next.</p></div><div class="readiness-ring"><b>'+readiness+'%</b><small>'+readinessLabel+'</small></div></div>';
 h+='<div class="smart-metrics"><div><span>📚 Coverage</span><b>'+coverage+'%</b><small>'+uniqueCount+' of '+arr.length+' questions attempted</small></div><div><span>📈 Trend</span><b class="'+(trend>0?'up':trend<0?'down':'flat')+'">'+(trend>0?'+':'')+trend+'%</b><small>Recent performance change</small></div><div><span>🎯 Consistency</span><b>'+consistency+'%</b><small>Stability of your performance</small></div></div>';
 h+='<div class="smart-next"><span>✨ Next Best Action</span><b>'+esc(nextAction)+'</b></div>';
 h+='</div>';
 h+='<div class="metric-grid analytics-metrics">';
'''
if needle2 not in s: raise SystemExit('needle2 not found')
s=s.replace(needle2,insert2,1)
needle3=" h+='<div class=\"analytics-two-col\">';\n"
insert3=r''' h+='<div class="panel analytics-card priority-panel"><div class="section-head compact"><div><h3>🎯 Smart Study Priorities</h3><p>Ranked by weakness × question frequency</p></div></div>';
 if(!priorityTopics.length)h+='<div class="empty-card">Answer more questions to unlock smart priorities.</div>';
 for(i=0;i<Math.min(5,priorityTopics.length);i++){var pt=priorityTopics[i];h+='<button class="priority-row" data-priority-sub="'+esc(pt.subject)+'" data-priority-topic="'+esc(pt.topic)+'"><span class="priority-rank">'+(i+1)+'</span><span><b>'+esc(pt.topic)+'</b><small>'+esc(subjectName(pt.subject))+' · '+pt.n+' attempt'+(pt.n===1?'':'s')+'</small><span class="priority-track"><i style="width:'+Math.max(4,pt.p)+'%"></i></span></span><strong>'+pt.p+'%</strong><i>›</i></button>';}
 h+='</div>';
 h+='<div class="analytics-two-col">';
'''
if needle3 not in s: raise SystemExit('needle3 not found')
s=s.replace(needle3,insert3,1)
needle4=" var arf=$('analyticsRepeated');if(arf)arf.onclick=function(){show('frequency');};var af=$('analyticsFreq');if(af)af.onclick=function(){show('frequency');};\n"
insert4=r''' var pr=document.querySelectorAll('[data-priority-sub]');for(i=0;i<pr.length;i++)pr[i].onclick=function(){closeIntelDetail();startPracticeByTopic(this.getAttribute('data-priority-sub'),this.getAttribute('data-priority-topic'));};
 var arf=$('analyticsRepeated');if(arf)arf.onclick=function(){show('frequency');};var af=$('analyticsFreq');if(af)af.onclick=function(){show('frequency');};
'''
if needle4 not in s: raise SystemExit('needle4 not found')
s=s.replace(needle4,insert4,1)
p.write_text(s)
