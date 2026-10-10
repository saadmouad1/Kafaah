/* V10.8 Stable Lite - conservative JavaScript for Android WebView/TrebEdit */
(function(){
'use strict';
var DB_KEY='ymlq_v108_db';
var STATE_KEY='ymlq_v108_state';
var db=[];
var bankPage=0;
var bankPageSize=50;
var bankSearchTimer=null;
var bankQueryToken=0;
var globalSearchPage=0;
var globalSearchTimer=null;
var globalSearchToken=0;
var state={saved:[],attempts:[],examHistory:[],createdExams:[]};
var currentScreen='launch';
var selectedDatabaseFileKey=''; var selectedDatabaseLabel=''; var selectedDatabasePool=null;
var practicePool=[];
var practiceIndex=0;
var practiceAnswered=false;
var mock=null;
var privateMockContext=null;
var timer=null;
var soundOn=true;
var mockLiveScoreVisible=true;
var celebrationOn=true;
var audioCtx=null;
var examFilters={profession:'',qualification:'',specialty:'',country:'',year:'',exactDate:'',governorate:''};
var initialLoaded=0;
var appMode=localStorage.getItem('ymlq_app_mode')||'licensure';
var globalBank='';
var searchScope={mode:localStorage.getItem('ymlq_search_scope')||'current',globalBanks:[],licensureExams:[]};
try{searchScope.globalBanks=JSON.parse(localStorage.getItem('ymlq_search_global_banks')||'[]')||[];}catch(e){searchScope.globalBanks=[];}
try{searchScope.licensureExams=JSON.parse(localStorage.getItem('ymlq_search_licensure_exams')||'[]')||[];}catch(e){searchScope.licensureExams=[];}

function $(id){return document.getElementById(id);}
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function text(v){return String(v==null?'':v);}
function normalize(q,i){
  var o=q||{};
  var opts=o.originalOptions||o.options||{};
  if(typeof opts!=='object'||Array.isArray(opts))opts={};
  // Preserve the structured verified answer.  The previous version flattened
  // {letters:['C'],text:'...'} into only the text, which made answerLetters()
  // unable to know that option C was correct when the text did not contain
  // the letter.  This caused correct choices to be scored as wrong.
  var ca=o.correctAnswer, caLetters=[], caText='';
  if(ca&&typeof ca==='object'){
    if(Array.isArray(ca.letters)) caLetters=ca.letters.map(function(x){return text(x).toUpperCase().trim();}).filter(function(x){return /^[A-E]$/.test(x);});
    caText=text(ca.text||'');
  } else {
    caText=text(ca||o.verifiedAnswer||o.originalAnswer||'');
    caLetters=answerLetters(caText);
  }
  if(!caText)caText='';
  if(!caLetters.length)caLetters=answerLetters(caText);
  var oe=o.optionExplanations||{};
  return {
    id:text(o.id||('q-'+i)),questionNumber:o.questionNumber||i+1,
    originalQuestion:text(o.originalQuestion||o.question||''),
    originalOptions:opts,sourceAnswer:o.sourceAnswer||{letters:[],text:'Not provided in the source file.'},
    hasCorrection:!!o.hasCorrection,correctionStatus:text(o.correctionStatus||'Not applicable'),correction:text(o.correction||''),correctedQuestion:text(o.correctedQuestion||''),
    correctAnswer:{letters:caLetters,text:caText},
    explanation:text(o.explanation||''),whyA:text(o.whyA||oe.A||''),whyNotB:text(o.whyNotB||oe.B||''),whyNotC:text(o.whyNotC||oe.C||''),whyNotD:text(o.whyNotD||oe.D||''),whyNotE:text(o.whyNotE||oe.E||''),
    optionExplanations:oe,
    subject:text(o.subject||'Uncategorized'),topic:text(o.topic||''),title:text(o.title||o.lecture||''),tags:Array.isArray(o.tags)?o.tags:[],
    profession:normalizeProfession(o.profession||o.profession||o.medical_profession||o.field||''),
    specialty:text(o.specialty||o.speciality||''),qualification:text(o.qualification||o.credential||''),
    country:text(o.country||o.examCountry||o.countryName||'Yemen'),governorate:text(o.governorate||''),year:text(o.year||o.examYear||''),month:text(o.month||o.examMonth||''),exactDate:text(o.exactDate||o.examDate||o.date||''),exam:text(o.exam||o.examName||''),examTitle:text(o.examTitle||''),language:text(o.language||''),source:text(o.source||''),sourceFile:text(o.sourceFile||''),databaseType:text(o.databaseType||o.bankType||((text(o.examType||o.type||'')+' '+text(o.source||'')).toLowerCase().indexOf('global')>=0?'global':'licensure')),bankName:text(o.bankName||o.bank||o.provider||o.examProvider||'')
  };
}
function normalizeAll(arr){var out=[],i;for(i=0;i<arr.length;i++)out.push(normalize(arr[i],i));return out;}
function signature(q){return text(q.originalQuestion).toLowerCase().replace(/\s+/g,' ').trim();}
function uniqueMerge(base,extra){
 var map={},out=[],i,k,q;
 /* IMPORTANT: repeated exam questions are valid and must NOT be removed by text.
    Only the unique question ID is used for database de-duplication. */
 for(i=0;i<base.length;i++){q=base[i];k=text(q&&q.id);if(!k)k='__row__'+i;if(!map[k]){map[k]=1;out.push(q);}}
 for(i=0;i<extra.length;i++){q=extra[i];k=text(q&&q.id);if(!k)k='__extra__'+i+'__'+signature(q);if(!map[k]){map[k]=1;out.push(q);}}
 return out;
}
function makeExamPrefix(meta,fileName){
 var d=text(meta&&meta.exactDate||'').replace(/[^0-9]/g,'');
 var g=text(meta&&meta.governorate||'').replace(/[^A-Za-z0-9]+/g,'');
 var s=text(meta&&meta.specialty||'').replace(/[^A-Za-z0-9]+/g,'').slice(0,18);
 var f=text(fileName||'').replace(/[^A-Za-z0-9]+/g,'').slice(0,24);
 return (d||'exam')+'-'+(g||'X')+'-'+(s||f||'file');
}
function ensureQuestionIds(arr,meta,fileName){
 var used={},out=[],i,q,id,n;
 for(i=0;i<(arr||[]).length;i++){q=arr[i]||{};id=text(q.id);n=q.questionNumber!=null?q.questionNumber:i+1;
  if(!id||used[id]) id=makeExamPrefix(meta,fileName)+'-'+String(n).padStart(3,'0')+'-'+String(i+1).padStart(3,'0');
  while(used[id]) id=makeExamPrefix(meta,fileName)+'-'+String(n).padStart(3,'0')+'-'+String(i+1).padStart(3,'0')+'-'+Math.random().toString(36).slice(2,7);
  used[id]=1;var copy={};for(var k in q)copy[k]=q[k];copy.id=id;out.push(copy);
 }
 return out;
}
function saveState(){try{localStorage.setItem(STATE_KEY,JSON.stringify(state));}catch(e){}}
function loadState(){try{var s=JSON.parse(localStorage.getItem(STATE_KEY)||'null');if(s&&typeof s==='object')state=s;}catch(e){state={saved:[],attempts:[],examHistory:[]};}}
function saveDb(){try{if(window.MQIStore&&db.length) window.MQIStore.putMany(db);}catch(e){}}
function loadSavedDb(){try{var x=JSON.parse(localStorage.getItem(DB_KEY)||'null');if(Array.isArray(x)&&x.length)return normalizeAll(x.slice(0,window.MQIStore?window.MQIStore.MAX_CACHE:750));}catch(e){}return null;}
function toast(msg){var t=$('toast');if(!t)return;t.textContent=msg;t.className='toast show';clearTimeout(toast.t);toast.t=setTimeout(function(){t.className='toast';},1800);}
function beep(ok){if(!soundOn)return;try{if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();var o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=ok?740:180;g.gain.value=.0001;o.connect(g);g.connect(audioCtx.destination);var now=audioCtx.currentTime;g.gain.exponentialRampToValueAtTime(.08,now+.01);g.gain.exponentialRampToValueAtTime(.0001,now+(ok?.18:.12));o.start(now);o.stop(now+(ok?.2:.14));}catch(e){}}
function celebrationSound(big){if(!soundOn||!celebrationOn)return;try{if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();var now=audioCtx.currentTime,notes=big?[523.25,659.25,783.99,1046.5]:[659.25,783.99],i;for(i=0;i<notes.length;i++){var o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=notes[i];g.gain.value=.0001;o.connect(g);g.connect(audioCtx.destination);var t=now+i*(big?.10:.09);g.gain.exponentialRampToValueAtTime(big?.07:.055,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+(big?.22:.16));o.start(t);o.stop(t+(big?.24:.18));}}catch(e){}}
function celebrate(kind,label){if(!celebrationOn)return;var layer=document.getElementById('celebrationLayer');if(!layer){layer=document.createElement('div');layer.id='celebrationLayer';layer.className='celebration-layer';document.body.appendChild(layer);}var count=kind==='success'?34:14,colors=['#2a9d8f','#1f6193','#ffbb4a','#e63946','#f4a261','#7b61ff'],i,p;for(i=0;i<count;i++){p=document.createElement('i');p.className='confetti-piece';p.textContent=i%3===0?'🎉':(i%3===1?'🎊':'✦');p.style.left=(8+Math.random()*84)+'%';p.style.top=(kind==='success'?12:28)+'%';p.style.animationDelay=(Math.random()*.18)+'s';p.style.animationDuration=(.85+Math.random()*.65)+'s';p.style.transform='rotate('+(Math.random()*360)+'deg)';p.style.color=colors[i%colors.length];layer.appendChild(p);}celebrationSound(kind==='success');if(kind==='success'){var banner=document.createElement('div');banner.className='celebration-banner';banner.innerHTML='<div>🎉🎊</div><b>'+esc(label||'Excellent Performance!')+'</b><small>Keep going — you are doing great.</small>';layer.appendChild(banner);}setTimeout(function(){if(layer&&layer.parentNode)layer.parentNode.removeChild(layer);},kind==='success'?2300:1300);}
function answerLetters(v){
  if(v&&typeof v==='object'){
    if(Array.isArray(v.letters)) return v.letters.map(function(x){return text(x).toUpperCase().trim();}).filter(function(x){return /^[A-E]$/.test(x);});
    v=v.text||'';
  }
  var s=text(v).toUpperCase();
  var m=s.match(/\b[A-E]\b/g)||[];
  return m.filter(function(x,i,a){return a.indexOf(x)===i;});
}
function isCorrect(q,k){
  var a=answerLetters(q&&q.correctAnswer);
  var selected=text(k).toUpperCase().trim();
  return !!selected && a.indexOf(selected)>=0;
}
function pct(a,b){return b?Math.round(a*100/b):0;}
function mockLiveStats(){var correct=0,answered=0,i,q,k;if(!mock||!mock.pool)return {correct:0,wrong:0,answered:0,unanswered:0,total:0};for(i=0;i<mock.pool.length;i++){q=mock.pool[i];k=mock.answers[q.id]||'';if(k){answered++;if(isCorrect(q,k))correct++;}}return {correct:correct,wrong:answered-correct,answered:answered,unanswered:mock.pool.length-answered,total:mock.pool.length};}
function mockLiveScoreHtml(){if(!mockLiveScoreVisible)return '';var s=mockLiveStats();return '<div class="mock-live-score" aria-live="polite"><span class="live-score-correct">✅ Correct <b>'+s.correct+'</b></span><span class="live-score-wrong">❌ Wrong <b>'+s.wrong+'</b></span><span class="live-score-left">⏳ Remaining <b>'+s.unanswered+'</b></span></div>';}

/* V11.3 Exam Library: profession-aware, year/date-aware filtering */
var PROFESSIONS=[
 {id:'human_medicine',label:'Human Medicine (General Medicine & Surgery)',icon:'🔹',qualifications:[],aliases:['human medicine','general medicine','general medicine & surgery','medicine','طب عام','طب بشري','general medicine surgery']},
 {id:'dentistry',label:'Dentistry',icon:'🔺',qualifications:["Bachelor's Degree",'Dental Technician'],aliases:['dentistry','dental','oral medicine','أسنان','طب اسنان','أسنان – بكالوريوس']},
 {id:'pharmacy',label:'Pharmacy',icon:'💊',qualifications:['Diploma',"Bachelor's Degree"],aliases:['pharmacy','pharmacist','صيدلة','صيدلة دبلوم','صيدلة – دبلوم','صيدلة بكالوريوس','صيدلة – بكالوريوس']},
 {id:'clinical_pharmacy',label:'Clinical Pharmacy',icon:'🟡',qualifications:["Bachelor's Degree"],aliases:['clinical pharmacy','صيدلة سريرية']},
 {id:'nursing',label:'Nursing',icon:'👩‍⚕️',qualifications:['Diploma',"Bachelor's Degree",'Emergency Diploma'],aliases:['nursing','nurse','تمريض','تمريض دبلوم','تمريض – دبلوم + طوارئ','تمريض بكالوريوس','تمريض – بكالوريوس','تمريض طوارئ']},
 {id:'midwifery',label:'Midwifery',icon:'🔹',qualifications:['Diploma',"Bachelor's Degree"],aliases:['midwifery','midwife','قبالة','قبالة – دبلوم + بكالوريوس']},
 {id:'physician_assistant',label:'Physician Assistant',icon:'🔵',qualifications:[],aliases:['physician assistant','assistant physician','مساعد طبيب']},
 {id:'dental_assistant',label:'Dental Assistant',icon:'🔺',qualifications:[],aliases:['dental assistant','مساعد طبيب اسنان','مساعد طبيب أسنان']},
 {id:'medical_laboratories',label:'Medical Laboratory Sciences',icon:'🔴',qualifications:['Diploma',"Bachelor's Degree"],aliases:['medical laboratories','laboratories','laboratory','lab','medical lab','مختبرات','مختبرات – دبلوم + بكالوريوس']},
 {id:'radiology',label:'Radiology',icon:'🔹',qualifications:['Diploma',"Bachelor's Degree"],aliases:['radiology','radiologic','radiology diploma','أشعة','أشعة – دبلوم + بكالوريوس']},
 {id:'anesthesia',label:'Anesthesia',icon:'💉',qualifications:['Diploma',"Bachelor's Degree"],aliases:['anesthesia','anaesthesia','تخدير','تخدير – دبلوم + بكالوريوس']},
 {id:'respiratory',label:'Respiratory Therapy',icon:'🫁',qualifications:['Diploma',"Bachelor's Degree"],aliases:['respiratory','respiratory therapy','تنفسية','تنفسية – دبلوم + بكالوريوس','العلاج التنفسي']},
 {id:'operating_technician',label:'Operating Room Technician',icon:'🔸',qualifications:[],aliases:['operating technician','operation technician','فني عمليات']},
 {id:'physiotherapy',label:'Physiotherapy',icon:'🦿',qualifications:[],aliases:['physiotherapy','physical therapy','علاج طبيعي','العلاج الطبيعي']},
 {id:'clinical_nutrition',label:'Clinical Nutrition',icon:'🟣',qualifications:[],aliases:['clinical nutrition','therapeutic nutrition','تغذية علاجية','التغذية العلاجية']}
];
var DEFAULT_COUNTRIES=['Yemen','Saudi Arabia'];
var DEFAULT_GOVERNORATES=['Sana’a','Aden','Taiz','Amran','Ibb','Hajjah'];
var profileLists={countries:DEFAULT_COUNTRIES.slice(),governorates:DEFAULT_GOVERNORATES.slice()};
function normalizeProfession(v){
 var s=text(v).toLowerCase().replace(/\s+/g,' ').trim(),i,j,p;
 if(!s)return 'Human Medicine (General Medicine & Surgery)';
 for(i=0;i<PROFESSIONS.length;i++){p=PROFESSIONS[i];if(p.label.toLowerCase()===s)return p.label;for(j=0;j<p.aliases.length;j++)if(s===p.aliases[j])return p.label;}
 for(i=0;i<PROFESSIONS.length;i++){p=PROFESSIONS[i];for(j=0;j<p.aliases.length;j++)if(s.indexOf(p.aliases[j])>=0)return p.label;}
 return text(v);
}
function professionId(label){var s=text(label).toLowerCase().replace(/\s+/g,' ').trim(),i,j;for(i=0;i<PROFESSIONS.length;i++){if(PROFESSIONS[i].label.toLowerCase()===s)return PROFESSIONS[i].id;for(j=0;j<PROFESSIONS[i].aliases.length;j++)if(s===PROFESSIONS[i].aliases[j])return PROFESSIONS[i].id;}for(i=0;i<PROFESSIONS.length;i++)for(j=0;j<PROFESSIONS[i].aliases.length;j++)if(s.indexOf(PROFESSIONS[i].aliases[j])>=0)return PROFESSIONS[i].id;return 'other';}
function professionById(id){var i;for(i=0;i<PROFESSIONS.length;i++)if(PROFESSIONS[i].id===id)return PROFESSIONS[i];return {id:'other',label:'Other',icon:'📚',qualifications:[],aliases:[]};}
function qualificationForProfession(id){return professionById(id).qualifications||[];}
function inferredQualification(q){
 var explicit=text(q&&q.qualification||q&&q.credential||''); if(explicit)return explicit;
 var raw=text(q&&q.profession||'').toLowerCase();
 if(raw.indexOf('صيدلة – دبلوم')>=0||raw.indexOf('صيدلة دبلوم')>=0)return 'دبلوم';
 if(raw.indexOf('صيدلة بكالوريوس')>=0)return 'بكالوريوس';
 if(raw.indexOf('أسنان – بكالوريوس')>=0)return 'بكالوريوس';
 if(raw.indexOf('تمريض – بكالوريوس')>=0)return 'بكالوريوس';
 if(raw.indexOf('تمريض – دبلوم')>=0)return 'دبلوم';
 if(raw.indexOf('تنفسية')>=0||raw.indexOf('أشعة')>=0||raw.indexOf('مختبرات')>=0||raw.indexOf('تخدير')>=0||raw.indexOf('قبالة')>=0){
   if(raw.indexOf('دبلوم + بكالوريوس')>=0)return '';
 }
 return '';
}
function matchesExamFilters(q,ignore){
 if((appMode==='global') !== (q.databaseType==='global'))return false;
 if(appMode==='global' && globalBank && text(q.bankName)!==globalBank)return false;
 if(ignore!=='profession'&&appMode!=='global'&&examFilters.profession&&professionId(q.profession)!==examFilters.profession)return false;
 if(ignore!=='qualification'&&examFilters.qualification){var qq=inferredQualification(q);if(qq&&qq!==examFilters.qualification)return false;}
 if(ignore!=='specialty'&&examFilters.specialty&&q.specialty!==examFilters.specialty)return false;
 if(ignore!=='country'&&examFilters.country&&text(q.country||'Yemen')!==examFilters.country)return false;
 if(ignore!=='year'&&examFilters.year&&text(q.year)!==examFilters.year)return false;
 if(ignore!=='exactDate'&&examFilters.exactDate&&text(q.exactDate)!==examFilters.exactDate)return false;
 if(ignore!=='governorate'&&examFilters.governorate&&text(q.governorate)!==examFilters.governorate)return false;
 return true;
}
function filteredDb(ignore){var a=[],i;for(i=0;i<db.length;i++)if(matchesExamFilters(db[i],ignore))a.push(db[i]);return a;}
function uniqueValuesFrom(arr,field){var m={},a=[],i,v;for(i=0;i<arr.length;i++){v=text(arr[i][field]);if(v&&!m[v]){m[v]=1;a.push(v);}}a.sort();return a;}
function specialtiesForProfession(id){var a=[],i,p;for(i=0;i<db.length;i++){p=db[i];if(!id||professionId(p.profession)===id){if(p.specialty&&a.indexOf(p.specialty)<0)a.push(p.specialty);}}a.sort();return a;}
function persistExamFilters(){try{localStorage.setItem('ymlq_exam_filters',JSON.stringify(examFilters));}catch(e){}}
function loadExamFilters(){try{var x=JSON.parse(localStorage.getItem('ymlq_exam_filters')||'null');if(x&&typeof x==='object'){examFilters.profession=text(x.profession||'');examFilters.qualification=text(x.qualification||'');examFilters.specialty=text(x.specialty||'');examFilters.country=text(x.country||'');examFilters.year=text(x.year||'');examFilters.exactDate=text(x.exactDate||'');examFilters.governorate=text(x.governorate||'');}}catch(e){}try{var l=JSON.parse(localStorage.getItem('ymlq_profile_lists')||'null');if(l&&Array.isArray(l.countries))profileLists.countries=l.countries;if(l&&Array.isArray(l.governorates))profileLists.governorates=l.governorates;}catch(e){}}
function persistProfileLists(){try{localStorage.setItem('ymlq_profile_lists',JSON.stringify(profileLists));}catch(e){}}
function profileSave(){persistExamFilters();persistProfileLists();}
var DEFAULT_COUNTRIES=['Yemen','Saudi Arabia'];
var DEFAULT_GOVERNORATES=['Sana’a','Aden','Taiz','Amran','Ibb','Hajjah'];
var profileLists={countries:DEFAULT_COUNTRIES.slice(),governorates:DEFAULT_GOVERNORATES.slice()};
function normalizeProfession(v){
 var s=text(v).toLowerCase().replace(/\s+/g,' ').trim(),i,j,p;
 if(!s)return 'Human Medicine';
 for(i=0;i<PROFESSIONS.length;i++){p=PROFESSIONS[i];for(j=0;j<p.aliases.length;j++)if(s===p.aliases[j]||s.indexOf(p.aliases[j])>=0)return p.label;}
 return text(v);
}
function professionId(label){var s=text(label).toLowerCase(),i,j;for(i=0;i<PROFESSIONS.length;i++){if(PROFESSIONS[i].label.toLowerCase()===s)return PROFESSIONS[i].id;for(j=0;j<PROFESSIONS[i].aliases.length;j++)if(s.indexOf(PROFESSIONS[i].aliases[j])>=0)return PROFESSIONS[i].id;}return 'other';}
function professionById(id){var i;for(i=0;i<PROFESSIONS.length;i++)if(PROFESSIONS[i].id===id)return PROFESSIONS[i];return {id:'other',label:'Other',icon:'📚',aliases:[]};}
function matchesExamFilters(q,ignore){
 if((appMode==='global') !== (q.databaseType==='global'))return false;
 if(appMode==='global' && globalBank && text(q.bankName)!==globalBank)return false;
 if(ignore!=='profession'&&appMode!=='global'&&examFilters.profession&&professionId(q.profession)!==examFilters.profession)return false;
 if(ignore!=='specialty'&&examFilters.specialty&&q.specialty!==examFilters.specialty)return false;
 if(ignore!=='country'&&examFilters.country&&text(q.country||'Yemen')!==examFilters.country)return false;
 if(ignore!=='year'&&examFilters.year&&text(q.year)!==examFilters.year)return false;
 if(ignore!=='exactDate'&&examFilters.exactDate&&text(q.exactDate)!==examFilters.exactDate)return false;
 if(ignore!=='governorate'&&examFilters.governorate&&text(q.governorate)!==examFilters.governorate)return false;
 return true;
}
function filteredDb(ignore){var a=[],i;for(i=0;i<db.length;i++)if(matchesExamFilters(db[i],ignore))a.push(db[i]);return a;}
function uniqueValuesFrom(arr,field){var m={},a=[],i,v;for(i=0;i<arr.length;i++){v=text(arr[i][field]);if(v&&!m[v]){m[v]=1;a.push(v);}}a.sort();return a;}
function specialtiesForProfession(id){var a=[],i,p;for(i=0;i<db.length;i++){p=db[i];if(!id||professionId(p.profession)===id){if(p.specialty&&a.indexOf(p.specialty)<0)a.push(p.specialty);}}a.sort();return a;}
function persistExamFilters(){try{localStorage.setItem('ymlq_exam_filters',JSON.stringify(examFilters));}catch(e){}}
function loadExamFilters(){try{var x=JSON.parse(localStorage.getItem('ymlq_exam_filters')||'null');if(x&&typeof x==='object'){examFilters.profession=text(x.profession||'');examFilters.specialty=text(x.specialty||'');examFilters.country=text(x.country||'');examFilters.year=text(x.year||'');examFilters.exactDate=text(x.exactDate||'');examFilters.governorate=text(x.governorate||'');}}catch(e){}try{var l=JSON.parse(localStorage.getItem('ymlq_profile_lists')||'null');if(l&&Array.isArray(l.countries))profileLists.countries=l.countries;if(l&&Array.isArray(l.governorates))profileLists.governorates=l.governorates;}catch(e){}}
function persistProfileLists(){try{localStorage.setItem('ymlq_profile_lists',JSON.stringify(profileLists));}catch(e){}}
function profileSave(){persistExamFilters();persistProfileLists();}
function examSelectorHtml(){
 var h='<div class=\"exam-selector\"><div class=\"selector-title\"><span>🎓</span><div><b>Choose Your Medical Profession</b><small>Filter the entire question bank by profession, specialty, year and exam date.</small></div></div><div class=\"profession-pills\" id=\"professionPills\"><button class=\"profession-pill active\" data-profession=\"\">All Professions</button>';
 var i,p,active=examFilters.profession;
 for(i=0;i<PROFESSIONS.length;i++){p=PROFESSIONS[i];h+='<button class=\"profession-pill'+(active===p.id?' active':'')+'\" data-profession=\"'+p.id+'\">'+p.icon+' '+esc(p.label)+'</button>';}
 h+='</div><div class=\"filter-row exam-filter-row\">'+selectHtml('globalSpecialty','Specialty',specialtiesForProfession(examFilters.profession))+selectHtml('globalCountry','Country',profileLists.countries)+selectHtml('globalYear','Exam Year',uniqueValuesFrom(filteredDb('year'),'year'))+selectHtml('globalDate','Exam Date',uniqueValuesFrom(filteredDb('exactDate'),'exactDate'))+selectHtml('globalGovernorate','Governorate',uniqueValuesFrom(filteredDb('governorate'),'governorate'))+'</div><div id=\"examSummary\" class=\"exam-summary\"></div></div>';
 return h;
}
function updateExamSelector(){
 var pills=document.querySelectorAll('#professionPills .profession-pill'),i;for(i=0;i<pills.length;i++){if(pills[i].getAttribute('data-profession')===examFilters.profession)pills[i].classList.add('active');else pills[i].classList.remove('active');}
 var sp=$('globalSpecialty'),co=$('globalCountry'),ys=$('globalYear'),dt=$('globalDate'),go=$('globalGovernorate'),i,h;
 if(sp){var vals=specialtiesForProfession(examFilters.profession);h='<option value=\"\">All Specialties</option>';for(i=0;i<vals.length;i++)h+='<option value=\"'+esc(vals[i])+'\">'+esc(vals[i])+'</option>';sp.innerHTML=h;sp.value=examFilters.specialty;}
 if(co)co.value=examFilters.country;
 if(ys){var y=uniqueValuesFrom(filteredDb('year'),'year');h='<option value=\"\">All Years</option>';for(i=0;i<y.length;i++)h+='<option value=\"'+esc(y[i])+'\">'+esc(y[i])+'</option>';ys.innerHTML=h;ys.value=examFilters.year;}
 if(dt){var d=uniqueValuesFrom(filteredDb('exactDate'),'exactDate');h='<option value=\"\">All Exam Dates</option>';for(i=0;i<d.length;i++)h+='<option value=\"'+esc(d[i])+'\">'+esc(d[i])+'</option>';dt.innerHTML=h;dt.value=examFilters.exactDate;}
 if(go){var g=uniqueValuesFrom(filteredDb('governorate'),'governorate');h='<option value=\"\">All Governorates</option>';for(i=0;i<g.length;i++)h+='<option value=\"'+esc(g[i])+'\">'+esc(g[i])+'</option>';go.innerHTML=h;go.value=examFilters.governorate;}
 var f=filteredDb('none'),summary=$('examSummary');if(summary)summary.innerHTML='<b>'+f.length+'</b> questions · <b>'+countExams()+'</b> exams matched'+(examFilters.exactDate?' · '+esc(examFilters.exactDate):'');
}
function bindExamSelector(){
 var pills=document.querySelectorAll('#professionPills .profession-pill'),i;for(i=0;i<pills.length;i++)pills[i].onclick=function(){examFilters.profession=this.getAttribute('data-profession')||'';examFilters.specialty='';examFilters.country='';examFilters.year='';examFilters.exactDate='';examFilters.governorate='';persistExamFilters();renderHome();};
 var sp=$('globalSpecialty'),co=$('globalCountry'),ys=$('globalYear'),dt=$('globalDate'),go=$('globalGovernorate');
 if(sp)sp.onchange=function(){examFilters.specialty=this.value;examFilters.country='';examFilters.year='';examFilters.exactDate='';examFilters.governorate='';persistExamFilters();renderHome();};
 if(co)co.onchange=function(){examFilters.country=this.value;examFilters.year='';examFilters.exactDate='';examFilters.governorate='';persistExamFilters();renderHome();};
 if(ys)ys.onchange=function(){examFilters.year=this.value;examFilters.exactDate='';persistExamFilters();renderHome();};
 if(dt)dt.onchange=function(){examFilters.exactDate=this.value;persistExamFilters();renderHome();};
 if(go)go.onchange=function(){examFilters.governorate=this.value;persistExamFilters();renderHome();};
}
/* V11 Section Intelligence: major clinical departments with nested subjects */
var MAJOR_SECTIONS=[
 {id:'medicine',ar:'Internal Medicine',en:'Internal Medicine',icon:'🎯',keys:['Cardiology','Pulmonology','Respiratory','Gastroenterology','Hepatology','Endocrinology','Diabetes','Rheumatology','Neurology','Hematology','Oncology','Nephrology','Infectious Diseases','Immunology','Allergy','Geriatrics','Internal Medicine'],children:['Cardiology','Pulmonology','Gastroenterology','Hepatology','Endocrinology & Diabetes','Rheumatology','Neurology','Hematology','Oncology','Nephrology','Infectious Diseases','Allergy & Immunology','Geriatric Medicine']},
 {id:'surgery',ar:'Surgery',en:'Surgery',icon:'🏥',keys:['Surgery','General Surgery','Orthopedics','Urology','Trauma','Anesthesia','Colorectal','Neurosurgery','Cardiothoracic','Vascular Surgery','Plastic Surgery','Thoracic Surgery','Transplant'],children:['General Surgery','Trauma & Acute Care','Orthopedic Surgery','Urology','Neurosurgery','Cardiothoracic Surgery','Vascular Surgery','Plastic Surgery','Colorectal Surgery','Anesthesia']},
 {id:'women',ar:'Obstetrics & Gynecology',en:'Obstetrics & Gynecology',icon:'🤰',keys:['Obstetrics','Gynecology','OB/Gyn','Maternal Fetal','Reproductive'],children:['Obstetrics','Gynecology','Maternal-Fetal Medicine','Reproductive Medicine']},
 {id:'pediatrics',ar:'Pediatrics',en:'Pediatrics',icon:'👶',keys:['Pediatrics','Neonatology','Pediatric','Child'],children:['General Pediatrics','Neonatology','Pediatric Cardiology','Pediatric Pulmonology','Pediatric Gastroenterology','Pediatric Neurology','Pediatric Infectious Diseases','Pediatric Emergency Medicine']},
 {id:'public',ar:'Community & Public Health',en:'Community & Public Health',icon:'🌍',keys:['Public Health','Community Medicine','Epidemiology','Preventive Medicine','Occupational Medicine','Family Medicine','Primary Care','Biostatistics'],children:['Community Medicine','Public Health','Epidemiology','Preventive Medicine','Occupational Medicine','Family Medicine','Primary Care','Biostatistics']},
 {id:'psychiatry',ar:'Psychiatry & Behavioral Medicine',en:'Psychiatry & Behavioral Medicine',icon:'🧠',keys:['Psychiatry','Psychology','Behavioral'],children:['General Psychiatry','Child & Adolescent Psychiatry','Addiction Medicine','Psychology & Behavioral Medicine']},
 {id:'dermatology',ar:'Dermatology',en:'Dermatology',icon:'🧴',keys:['Dermatology','Dermatopathology'],children:['General Dermatology','Dermatopathology','Pediatric Dermatology']},
 {id:'ophthalmology',ar:'Ophthalmology',en:'Ophthalmology',icon:'👁️',keys:['Ophthalmology','Eye'],children:['General Ophthalmology','Cornea & External Eye','Glaucoma','Retina','Pediatric Ophthalmology']},
 {id:'ent',ar:'ENT',en:'Otorhinolaryngology',icon:'👂',keys:['ENT','Otolaryngology','Ear Nose Throat'],children:['Otology','Rhinology','Laryngology','Head & Neck Surgery']},
 {id:'emergency',ar:'Emergency & Critical Care',en:'Emergency & Critical Care',icon:'🚑',keys:['Emergency','Emergency Medicine','Critical Care','ICU','Shock'],children:['Emergency Medicine','Critical Care','Toxicology','Trauma Resuscitation','Disaster Medicine']},
 {id:'infectious',ar:'Infectious Diseases',en:'Infectious Diseases',icon:'🦠',keys:['Infectious Diseases','Infection','Tropical Medicine'],children:['Bacterial Infections','Viral Infections','Parasitic & Tropical Diseases','HIV & Immunodeficiency','Antimicrobial Stewardship']},
 {id:'pharmacology',ar:'Pharmacology & Therapeutics',en:'Pharmacology & Therapeutics',icon:'💊',keys:['Pharmacology','Clinical Pharmacology','Therapeutics','Toxicology'],children:['General Pharmacology','Clinical Pharmacology','Antimicrobials','Cardiovascular Drugs','CNS Drugs','Endocrine Drugs','Toxicology']},
 {id:'pathology',ar:'Pathology',en:'Pathology & Laboratory Medicine',icon:'🔬',keys:['Pathology','Histopathology','Clinical Pathology'],children:['General Pathology','Hematopathology','Histopathology','Clinical Pathology']},
 {id:'microbiology',ar:'Microbiology',en:'Microbiology & Immunology',icon:'🦠',keys:['Microbiology','Bacteriology','Virology','Parasitology','Mycology'],children:['Bacteriology','Virology','Parasitology','Mycology','Immunology']},
 {id:'radiology',ar:'Radiology & Imaging',en:'Radiology & Diagnostic Imaging',icon:'🩻',keys:['Radiology','Imaging','Ultrasound','CT','MRI'],children:['X-ray','Ultrasound','CT','MRI','Interventional Radiology']},
 {id:'anatomy',ar:'Anatomy & Basic Sciences',en:'Anatomy & Basic Medical Sciences',icon:'🫀',keys:['Anatomy','Embryology','Physiology','Biochemistry','Genetics'],children:['Anatomy','Embryology','Physiology','Biochemistry','Genetics']},
 {id:'forensic',ar:'Forensic Medicine & Ethics',en:'Forensic Medicine, Ethics & Law',icon:'⚖️',keys:['Forensic','Forensic Medicine','Medical Ethics','Ethics','Medical Law','Legal Medicine'],children:['Forensic Medicine','Medical Ethics','Medical Law','Death & Injury Certification']},
 {id:'rehab',ar:'Rehabilitation & Pain Medicine',en:'Rehabilitation & Pain Medicine',icon:'🦿',keys:['Rehabilitation','Physical Medicine','Pain Medicine','Physiotherapy'],children:['Physical Medicine & Rehabilitation','Pain Medicine','Physiotherapy']},
 {id:'nutrition',ar:'Nutrition',en:'Clinical Nutrition',icon:'🥗',keys:['Nutrition','Clinical Nutrition','Dietetics'],children:['Clinical Nutrition','Nutritional Deficiencies','Dietetics']},
 {id:'other',ar:'Other Medical Sciences',en:'Other Medical Sciences',icon:'🔬',keys:[],children:['Medical Genetics','Immunology','Nuclear Medicine','Nursing Sciences','Other']}
];
var SUBJECT_AR={
 'Cardiology':'Cardiology','Pulmonology':'Pulmonology','Respiratory':'Respiratory Medicine','Gastroenterology':'Gastroenterology','Hepatology':'Hepatology','Endocrinology':'Endocrinology','Diabetes':'Endocrinology & Diabetes','Rheumatology':'Rheumatology','Neurology':'Neurology','Hematology':'Hematology','Oncology':'Oncology','Nephrology':'Nephrology','Infectious Diseases':'Infectious Diseases','Immunology':'Immunology','Allergy':'Allergy & Immunology','Geriatrics':'Geriatric Medicine','Internal Medicine':'General Internal Medicine',
 'Surgery':'General Surgery','General Surgery':'General Surgery','Orthopedics':'Orthopedic Surgery','Urology':'Urology','Trauma':'Trauma & Acute Care','Anesthesia':'Anesthesia','Colorectal':'Colorectal Surgery','Neurosurgery':'Neurosurgery','Cardiothoracic':'Cardiothoracic Surgery','Vascular Surgery':'Vascular Surgery','Plastic Surgery':'Plastic Surgery',
 'Obstetrics':'Obstetrics','Gynecology':'Gynecology','OB/Gyn':'Obstetrics & Gynecology','Maternal Fetal':'Maternal-Fetal Medicine','Reproductive':'Reproductive Medicine',
 'Pediatrics':'General Pediatrics','Neonatology':'Neonatology','Community Medicine':'Community Medicine','Public Health':'Public Health','Epidemiology':'Epidemiology','Preventive Medicine':'Preventive Medicine','Occupational Medicine':'Occupational Medicine','Family Medicine':'Family Medicine','Primary Care':'Primary Care','Biostatistics':'Biostatistics',
 'Psychiatry':'General Psychiatry','Psychology':'Psychology & Behavioral Medicine','Dermatology':'General Dermatology','Ophthalmology':'General Ophthalmology','ENT':'ENT','Otolaryngology':'Otolaryngology',
 'Emergency':'Emergency Medicine','Emergency Medicine':'Emergency Medicine','Critical Care':'Critical Care','ICU':'Critical Care','Shock':'Shock & Resuscitation','Toxicology':'Toxicology',
 'Pharmacology':'General Pharmacology','Clinical Pharmacology':'Clinical Pharmacology','Therapeutics':'Therapeutics','Pathology':'General Pathology','Histopathology':'Histopathology','Clinical Pathology':'Clinical Pathology',
 'Microbiology':'Microbiology','Bacteriology':'Bacteriology','Virology':'Virology','Parasitology':'Parasitology','Mycology':'Mycology',
 'Radiology':'Radiology','Imaging':'Diagnostic Imaging','Ultrasound':'Ultrasound','CT':'CT Imaging','MRI':'MRI',
 'Anatomy':'Anatomy','Embryology':'Embryology','Physiology':'Physiology','Biochemistry':'Biochemistry','Genetics':'Genetics',
 'Forensic':'Forensic Medicine','Forensic Medicine':'Forensic Medicine','Medical Ethics':'Medical Ethics','Ethics':'Medical Ethics','Medical Law':'Medical Law','Legal Medicine':'Legal Medicine',
 'Rehabilitation':'Physical Medicine & Rehabilitation','Physical Medicine':'Physical Medicine & Rehabilitation','Pain Medicine':'Pain Medicine','Physiotherapy':'Physiotherapy','Nutrition':'Clinical Nutrition','Clinical Nutrition':'Clinical Nutrition','Dietetics':'Dietetics'
};
function majorOfSubject(subject){
 var s=text(subject).toLowerCase(),i,j,sec;
 /* pediatric/women/eye/ent/derm/psychiatry get priority in mixed subjects */
 var priority=['pediatrics','obstetrics','gynecology','ophthalmology','dermatology','psychiatry','ent','pharmacology','infectious','emergency'];
 for(i=0;i<priority.length;i++){
  sec=majorById(priority[i]);
  for(j=0;j<sec.keys.length;j++) if(s.indexOf(sec.keys[j].toLowerCase())>=0) return sec.id;
 }
 for(i=0;i<MAJOR_SECTIONS.length;i++){
  sec=MAJOR_SECTIONS[i];
  for(j=0;j<sec.keys.length;j++) if(s.indexOf(sec.keys[j].toLowerCase())>=0) return sec.id;
 }
 return 'other';
}
function majorById(id){var i;for(i=0;i<MAJOR_SECTIONS.length;i++)if(MAJOR_SECTIONS[i].id===id)return MAJOR_SECTIONS[i];return MAJOR_SECTIONS[MAJOR_SECTIONS.length-1];}
function subjectName(subject){var s=text(subject),parts=s.split('/'),i,out=[];for(i=0;i<parts.length;i++){var k=parts[i].trim(),a=SUBJECT_AR[k]||k;out.push(a);}return out.join(' / ');}
function subjectsForMajor(id){var m={},a=[],i,s,arr=filteredDb('none');if(id==='')return uniqueValuesFrom(arr,'subject');for(i=0;i<arr.length;i++){s=arr[i].subject||'Uncategorized';if(majorOfSubject(s)===id&&!m[s]){m[s]=1;a.push(s);}}a.sort();return a;}
function countMajor(id){var n=0,i,arr=filteredDb('none');for(i=0;i<arr.length;i++)if(majorOfSubject(arr[i].subject||'')===id)n++;return n;}
function childMatchesSubject(subject,child){var s=text(subject).toLowerCase(),c=text(child).toLowerCase();if(s===c)return true;var aliases={
 'endocrinology & diabetes':['endocrinology','diabetes'], 'orthopedic surgery':['orthopedics','orthopaedics'], 'trauma & acute care':['trauma'], 'general pediatrics':['pediatrics','pediatric medicine'], 'pediatric cardiology':['pediatric cardiology'], 'pediatric pulmonology':['pediatric pulmonology'], 'pediatric gastroenterology':['pediatric gastroenterology'], 'pediatric neurology':['pediatric neurology'], 'pediatric infectious diseases':['pediatric infectious'], 'community medicine':['community medicine'], 'general psychiatry':['psychiatry'], 'general dermatology':['dermatology'], 'general ophthalmology':['ophthalmology'], 'emergency medicine':['emergency medicine','emergency'], 'shock & resuscitation':['shock'], 'general pharmacology':['pharmacology'], 'general pathology':['pathology'], 'bacteriology':['bacteriology'], 'virology':['virology'], 'parasitology':['parasitology'], 'radiology':['radiology'], 'diagnostic imaging':['imaging'], 'general surgery':['surgery'], 'medical genetics':['genetics'], 'immunology':['immunology']};var a=aliases[c]||[];for(var i=0;i<a.length;i++)if(s.indexOf(a[i])>=0)return true;return false;}
function countChild(child,majorId){var n=0,arr=filteredDb('none'),i;if(child==='Other')return 0;for(i=0;i<arr.length;i++)if(majorOfSubject(arr[i].subject||'')===majorId&&childMatchesSubject(arr[i].subject,child))n++;return n;}
function majorSectionsHtml(){var h='',i,j,m,subs,count,sc;for(i=0;i<MAJOR_SECTIONS.length;i++){m=MAJOR_SECTIONS[i];count=countMajor(m.id);subs=m.children||[];h+='<section class="major-card" data-major="'+esc(m.id)+'"><div class="major-head"><div class="major-icon">'+m.icon+'</div><div class="major-title"><b>'+esc(m.en)+'</b><small>'+esc(m.en)+'</small></div><span class="major-count">'+count+' Q</span></div><div class="sub-grid">';for(j=0;j<subs.length;j++){sc=countChild(subs[j],m.id);h+='<button class="sub-card'+(sc?'':' empty-sub')+'" data-subject="'+esc(subs[j])+'" data-count="'+sc+'"><span class="sub-emoji">'+iconFor(subs[j])+'</span><span><b>'+esc(subs[j])+'</b><small>'+sc+' question'+(sc===1?'':'s')+'</small></span><i>›</i></button>';}h+='</div></section>';}return h;}
function bindSectionCards(){var cards=document.querySelectorAll('.sub-card'),i;for(i=0;i<cards.length;i++)cards[i].onclick=function(){var n=parseInt(this.getAttribute('data-count')||'0',10);if(!n){toast('No questions in this area yet. Add an exam JSON to populate it.');return;}show('practice');setPracticeSubject(this.getAttribute('data-subject'));};}

function iconFor(subject){var s=text(subject).toLowerCase();if(s.indexOf('cardio')>=0)return '❤️';if(s.indexOf('resp')>=0||s.indexOf('pulm')>=0)return '🫁';if(s.indexOf('neuro')>=0)return '🧠';if(s.indexOf('pedi')>=0)return '👶';if(s.indexOf('obst')>=0||s.indexOf('gyn')>=0)return '🤰';if(s.indexOf('pharm')>=0)return '💊';if(s.indexOf('micro')>=0)return '🦠';if(s.indexOf('path')>=0)return '🔬';if(s.indexOf('hem')>=0)return '🩸';return '🎯';}
function show(screen){var list=document.querySelectorAll('.screen'),i;for(i=0;i<list.length;i++)list[i].classList.remove('active');var el=$(screen);if(el)el.classList.add('active');currentScreen=screen;var nav=document.querySelectorAll('.bottom-nav button[data-screen]'),j;for(j=0;j<nav.length;j++){if(nav[j].getAttribute('data-screen')===screen)nav[j].classList.add('active');else nav[j].classList.remove('active');}closeNavDrawer();if(screen==='dashboard')renderHome();if(screen==='createExam')renderCreateExam();if(screen==='practice')renderPracticeSetup();if(screen==='mock'){if(privateMockContext)renderPrivateExamSetup();else renderMockSetup();}if(screen==='bank')renderBank();if(screen==='intel')renderIntel();if(screen==='analytics')renderAnalytics();if(screen==='database')renderDatabase();if(screen==='mistakes')renderMistakes();if(screen==='saved')renderSaved();if(screen==='frequency')renderFrequency();if(screen==='globalSearch')renderGlobalSearch();if(screen==='crossIntelligence')renderCrossIntelligence();if(screen==='settings')renderSettings();window.scrollTo(0,0);}
function closeNavDrawer(){var d=$('navDrawer'),o=$('navOverlay');if(d)d.classList.remove('open');if(o)o.classList.remove('show');}
function openNavDrawer(){var d=$('navDrawer'),o=$('navOverlay');if(d)d.classList.add('open');if(o)o.classList.add('show');}
function renderListQuestion(q,mode){var last='';if(!q)return '';var attempts=state.attempts||[],i,c=0,n=0;for(i=0;i<attempts.length;i++)if(attempts[i].questionId===q.id){n++;if(attempts[i].correct)c++;}last=n?' · '+c+'/'+n+' correct':'';return '<button class="library-item" data-qid="'+esc(q.id)+'"><div><b>'+esc(q.originalQuestion||'Untitled question')+'</b><small>'+esc(majorById(majorOfSubject(q.subject||'')).ar)+' · '+esc(subjectName(q.subject||'Uncategorized'))+' · '+esc(q.topic||'Uncategorized')+last+'</small></div><span>›</span></button>';}
function openQuestionById(id){
 if(window.MQIStore&&window.MQIStore.get){window.MQIStore.get(id).then(function(q){if(!q){toast('Question not found');return;}showQuestionDetail(q);}).catch(function(){toast('Could not load question');});return;}
 var q=findById(id);if(!q){toast('Question not found');return;}showQuestionDetail(q);
}
function practiceQuestionById(id){
 if(!window.MQIStore||!window.MQIStore.get){var q=findById(id);if(q){practicePool=[q];practiceIndex=0;practiceAnswered=false;show('practice');renderPracticeQuestion();}else toast('Question not found');return;}
 window.MQIStore.get(id).then(function(q){if(!q){toast('Question not found');return;}practicePool=[q];practiceIndex=0;practiceAnswered=false;show('practice');renderPracticeQuestion();}).catch(function(){toast('Could not load question');});
}
function showQuestionDetail(q){
 var modal=document.getElementById('questionViewModal');
 if(!modal){modal=document.createElement('div');modal.id='questionViewModal';modal.className='detail-modal';document.body.appendChild(modal);}
 var opts=q.originalOptions||{},keys=Object.keys(opts),h='',i,k,source=(q.sourceAnswer&&q.sourceAnswer.text)||'',correct=(q.correctAnswer&&q.correctAnswer.text)||'';
 h+='<div class="detail-backdrop" id="questionViewBackdrop"></div><div class="detail-sheet question-view-sheet"><button class="detail-close" id="questionViewClose">×</button>';
 h+='<div class="detail-hero"><span class="detail-icon">❓</span><div><span class="detail-kicker">Question Viewer</span><h2>Question '+esc(q.questionNumber||'')+'</h2><p>'+esc(repeatMeta(q))+'</p></div></div>';
 h+='<div class="question-view-meta"><span>'+((q.databaseType==='global')?'🌍 Global Question Bank':'🪪 Professional Licensure')+'</span><span>'+esc(q.subject||'Uncategorized')+'</span><span>'+esc(q.topic||'Uncategorized')+'</span></div>';
 h+='<div class="question-view-text">'+esc(q.originalQuestion||'Untitled question')+'</div>';
 h+='<div class="question-view-options">';
 for(i=0;i<keys.length;i++){k=keys[i];if(!text(opts[k]).trim())continue;h+='<div class="question-view-option"><b>'+esc(k)+'</b><span>'+esc(opts[k])+'</span></div>';}
 h+='</div>';
 if(source)h+='<div class="question-view-block"><b>Source Answer</b><p>'+esc(source)+'</p></div>';
 if(correct)h+='<div class="question-view-block correct-block"><b>Medically Verified Answer</b><p>'+esc(correct)+'</p></div>';
 if(q.explanation)h+='<div class="question-view-block"><b>Explanation</b><p>'+esc(q.explanation)+'</p></div>';
 h+='<div class="detail-actions question-view-actions"><button class="btn primary" id="questionViewPractice">📝 Practice This Question</button></div></div>';
 modal.innerHTML=h;modal.className='detail-modal open';
 document.getElementById('questionViewClose').onclick=closeQuestionDetail;document.getElementById('questionViewBackdrop').onclick=closeQuestionDetail;document.getElementById('questionViewPractice').onclick=function(){closeQuestionDetail();practiceQuestionById(q.id);};
}
function closeQuestionDetail(){var m=document.getElementById('questionViewModal');if(m)m.className='detail-modal';}
function renderMistakes(){
 var ids={},attempts=state.attempts||[],i,promptTitle=appMode==='global'?'Global Question Bank JSON Prompt':'Professional Licensure JSON Prompt',promptText=appMode==='global'?globalImportPrompt():licensureImportPrompt(),wrongCount=0;
 for(i=0;i<attempts.length;i++){if(!attempts[i].correct){ids[attempts[i].questionId]=1;wrongCount++;}}
 var keys=Object.keys(ids),h='<div class="panel database-mode-panel"><div class="create-block-title">Review Scope</div><p class="settings-note">Mistakes are collected across <b>all questions and both databases</b>. The current Home/Database mode does not hide mistakes from the other database.</p><div class="action-grid"><button class="wide-btn" id="mistakeAllDb">🌐 All Databases</button><button class="wide-btn" id="mistakeLic">🪪 Licensure Only</button></div></div>';
 h+='<div class="summary-strip"><div><b>'+keys.length.toLocaleString()+'</b><small>Unique mistakes · All databases</small></div><div><b>'+wrongCount.toLocaleString()+'</b><small>Wrong attempts</small></div><button class="btn primary" id="practiceMistakes">📝 Practice Mistakes</button></div><div id="mistakesList" class="library-list"><div class="empty-card">Loading your mistakes from all databases…</div></div>';
 $('mistakesContent').innerHTML=h;
 function renderRows(rows){var list='',j,q;for(j=0;j<rows.length;j++){q=rows[j];if(q)list+=renderListQuestion(q,'mistake');}if(!list)list='<div class="empty-card">🎉 No mistakes found across the question databases.</div>';if(rows.length<keys.length)list+='<div class="empty-card">Showing '+rows.length.toLocaleString()+' of '+keys.length.toLocaleString()+' unique mistakes. All mistake IDs remain stored.</div>';$('mistakesList').innerHTML=list;bindLibraryItems();}
 if(window.MQIStore){window.MQIStore.getMany(keys.slice(0,500)).then(function(rows){renderRows(rows);}).catch(function(){renderRows([]);});}else{var rows=[];for(i=0;i<Math.min(100,keys.length);i++){var q=findById(keys[i]);if(q)rows.push(q);}renderRows(rows);}
 $('mistakeAllDb').onclick=function(){toast('Mistakes are already scoped to all databases.');};
 $('mistakeLic').onclick=function(){var licKeys=[];if(!window.MQIStore){toast('IndexedDB is unavailable.');return;}window.MQIStore.getMany(keys.slice(0,500)).then(function(rows){for(var z=0;z<rows.length;z++)if((rows[z].databaseType||'licensure')==='licensure')licKeys.push(rows[z]);renderRows(licKeys);});};
 $('practiceMistakes').onclick=function(){if(!window.MQIStore){toast('IndexedDB is unavailable.');return;}window.MQIStore.getMany(keys.slice(0,200)).then(function(rows){if(!rows.length){toast('No mistakes to practice yet');return;}practicePool=rows;practiceIndex=0;practiceAnswered=false;show('practice');renderPracticeQuestion();});};
}

function renderSaved(){var ids=(state.saved||[]).slice(),active=filteredDb('none'),allowed={},ai;for(ai=0;ai<active.length;ai++)allowed[active[ai].id]=1;ids=ids.filter(function(id){return !!allowed[id];});var h='<div class="summary-strip"><div><b>'+ids.length+'</b><small>Saved questions</small></div><div><b>'+active.length+'</b><small>Profile questions</small></div></div><div class="library-list">',i,q;for(i=0;i<ids.length;i++){q=findById(ids[i]);if(q)h+=renderListQuestion(q,'saved');}if(!ids.length)h+='<div class="empty-card">⭐ No saved questions yet. Tap Save while practicing.</div>';h+='</div>';$('savedContent').innerHTML=h;bindLibraryItems();}
function bindLibraryItems(){var a=document.querySelectorAll('.library-item'),i;for(i=0;i<a.length;i++)a[i].onclick=function(){openQuestionById(this.getAttribute('data-qid'));};}
function renderGlobalSearch(){
 var input=$('globalSearchInput'),mode=$('globalSearchMode'),size=$('globalSearchPageSize'),status=$('globalSearchStatus'),results=$('globalSearchResults'),pager=$('globalSearchPagination');
 if(!input||!status||!results)return;
 input.value=globalSearchLastQuery||''; mode.value=globalSearchLastMode||'all'; size.value=String(globalSearchPageSize||50);
 function run(){
   var term=text(input.value).trim(), m=mode.value||'all', ps=Math.max(25,Math.min(100,Number(size.value)||50));
   globalSearchLastQuery=term;globalSearchLastMode=m;globalSearchPageSize=ps;globalSearchPage=0;
   performGlobalSearch(term,m,ps);
 }
 input.oninput=function(){clearTimeout(globalSearchTimer);globalSearchTimer=setTimeout(run,260);};
 mode.onchange=run; size.onchange=run;
 var clear=$('globalSearchClear');if(clear)clear.onclick=function(){input.value='';globalSearchLastQuery='';globalSearchPage=0;status.textContent='Enter a word or phrase to search the complete question library.';results.innerHTML='';pager.innerHTML='';input.focus();};
 if(globalSearchLastQuery)performGlobalSearch(globalSearchLastQuery,globalSearchLastMode||'all',globalSearchPageSize||50);
 else {results.innerHTML='<div class="empty-card">🔎 Search every question, option, explanation, exam, bank, subject, topic, title, tag and metadata across all databases.</div>';pager.innerHTML='';}
}
var globalSearchLastQuery='',globalSearchLastMode='all',globalSearchPageSize=50;
function performGlobalSearch(term,mode,pageSize){
 var status=$('globalSearchStatus'),results=$('globalSearchResults'),pager=$('globalSearchPagination'),token=++globalSearchToken;
 if(!term){status.textContent='Enter a word or phrase to search the complete question library.';results.innerHTML='<div class="empty-card">🔎 Search every question, option, explanation, exam, bank, subject, topic, title, tag and metadata across all databases.</div>';pager.innerHTML='';return;}
 status.innerHTML='⏳ Searching <b>all matching records</b> across '+(mode==='all'?'all databases':(mode==='licensure'?'Professional Licensure':'Global Question Banks'))+'…';results.innerHTML='<div class="empty-card">Searching questions, options, explanations, subjects, topics, exams and databases…</div>';pager.innerHTML='';
 if(!window.MQIStore||!window.MQIStore.query){status.textContent='Search engine unavailable.';return;}
 window.MQIStore.query({}, {search:term,limit:pageSize,offset:globalSearchPage*pageSize,mode:mode==='all'?'':mode,searchAll:true}).then(function(out){
   if(token!==globalSearchToken)return;var total=out.total||0,pages=Math.max(1,Math.ceil(total/pageSize));
   status.innerHTML='<b>'+total.toLocaleString()+'</b> result'+(total===1?'':'s')+' found · Searching all content · Page '+(Math.min(globalSearchPage+1,pages))+' of '+pages;
   if(!out.rows.length){results.innerHTML='<div class="empty-card">No results found for <b>'+esc(term)+'</b>.</div>';pager.innerHTML='';return;}
   var h='',i,q;for(i=0;i<out.rows.length;i++){q=out.rows[i];h+=renderGlobalSearchResult(q,term);}results.innerHTML=h;
   bindGlobalSearchResults();
   var ph='';if(globalSearchPage>0)ph+='<button class="small-btn" id="globalPrev">← Previous</button>';if(globalSearchPage<pages-1)ph+='<button class="small-btn primary-mini" id="globalNext">Next →</button>';pager.innerHTML=ph;
   var prev=$('globalPrev'),next=$('globalNext');if(prev)prev.onclick=function(){globalSearchPage--;performGlobalSearch(term,mode,pageSize);window.scrollTo(0,0);};if(next)next.onclick=function(){globalSearchPage++;performGlobalSearch(term,mode,pageSize);window.scrollTo(0,0);};
 }).catch(function(err){if(token!==globalSearchToken)return;status.textContent='Search failed';results.innerHTML='<div class="empty-card">Could not search the database: '+esc(err&&err.message||'Unknown error')+'</div>';});
}
function highlightTerm(v,term){var s=esc(v||'');if(!term)return s;var parts=text(v||'').split(new RegExp('('+term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig'));var h='',i;for(i=0;i<parts.length;i++){if(parts[i].toLowerCase()===term.toLowerCase())h+='<mark>'+esc(parts[i])+'</mark>';else h+=esc(parts[i]);}return h;}
function searchOptionPreview(q,term){var o=q&&q.originalOptions||{},keys=Object.keys(o),a=[],i;for(i=0;i<keys.length;i++){var val=text(o[keys[i]]);if(val.toLowerCase().indexOf(term.toLowerCase())>=0)a.push('<b>'+esc(keys[i])+':</b> '+highlightTerm(val,term));}return a.slice(0,3).join(' · ');}
function renderGlobalSearchResult(q,term){
 var meta=[];if(q.databaseType)meta.push(q.databaseType==='licensure'?'🪪 Professional Licensure':'🌍 Global Question Bank');if(q.questionBank||q.bankName)meta.push('Bank: '+esc(q.questionBank||q.bankName));if(q.examTitle)meta.push('Exam: '+esc(q.examTitle));if(q.specialty)meta.push(esc(q.specialty));if(q.subject)meta.push(esc(q.subject));if(q.topic)meta.push(esc(q.topic));if(q.year)meta.push(String(q.year));
 var op=searchOptionPreview(q,term);var explanation=text(q.explanation||'');var optionHit=op?'<small class="search-hit"><b>Option match:</b> '+op+'</small>':'';var explHit=explanation.toLowerCase().indexOf(term.toLowerCase())>=0?'<small class="search-hit"><b>Explanation match:</b> '+highlightTerm(explanation.slice(0,260),term)+'</small>':'';
 return '<button class="library-item global-search-result" data-qid="'+esc(q.id)+'"><div><b>'+highlightTerm(q.originalQuestion||q.title||'Untitled question',term)+'</b><small>'+meta.join(' · ')+'</small>'+optionHit+explHit+'</div><span>›</span></button>';
}
function bindGlobalSearchResults(){var a=document.querySelectorAll('.global-search-result'),i;for(i=0;i<a.length;i++)a[i].onclick=function(){openQuestionById(this.getAttribute('data-qid'));};}

var progressJobs={};
function progressMarkup(id,title){
 return '<div class="analysis-progress panel" id="'+id+'"><div class="analysis-progress-head"><b>'+title+'</b><strong class="analysis-progress-percent">0%</strong></div><div class="analysis-progress-track"><div class="analysis-progress-fill" style="width:0%"></div></div><div class="analysis-progress-meta"><span class="analysis-progress-stage">Preparing database scan…</span><span class="analysis-progress-remaining">Estimating time…</span></div><small class="analysis-progress-note">Progress is an estimate while the database engine is working; it reaches 100% when the analysis finishes.</small></div>';
}
function startAnalysisProgress(id,stageNames){
 stopAnalysisProgress(id);var el=$(id);if(!el)return;
 var started=Date.now(),percent=2;
 function paint(){
  var node=$(id);if(!node)return;
  var p=node.querySelector('.analysis-progress-percent'),fill=node.querySelector('.analysis-progress-fill'),stage=node.querySelector('.analysis-progress-stage'),remain=node.querySelector('.analysis-progress-remaining');
  var elapsed=(Date.now()-started)/1000;
  /* Smooth estimated progress: deliberately never claims completion before the promise resolves. */
  percent=Math.min(94,Math.max(percent,2+(1-Math.exp(-elapsed/28))*91));
  var idx=Math.min(stageNames.length-1,Math.floor(percent/95*stageNames.length));
  if(p)p.textContent=Math.floor(percent)+'%';
  if(fill)fill.style.width=percent+'%';
  if(stage)stage.textContent=stageNames[idx]||'Analyzing…';
  if(remain){if(elapsed<8)remain.textContent='Calculating…';else if(percent>=90)remain.textContent='Finalizing…';else remain.textContent='Estimated time remaining: '+Math.max(1,Math.ceil((elapsed/Math.max(percent,1))*(95-percent)))+' sec';}
 }
 paint();progressJobs[id]=setInterval(paint,350);
}
function finishAnalysisProgress(id,success,summary){
 if(progressJobs[id]){clearInterval(progressJobs[id]);delete progressJobs[id];}
 var el=$(id);if(!el)return;
 var p=el.querySelector('.analysis-progress-percent'),fill=el.querySelector('.analysis-progress-fill'),stage=el.querySelector('.analysis-progress-stage'),remain=el.querySelector('.analysis-progress-remaining');
 if(p)p.textContent=success?'100%':'Stopped';
 if(fill){fill.style.width=success?'100%':'0%';if(!success)fill.classList.add('progress-error');}
 if(stage)stage.textContent=summary||(success?'Analysis completed':'Analysis failed');
 if(remain)remain.textContent=success?'Complete':'Check database and retry';
}
function stopAnalysisProgress(id){if(progressJobs[id]){clearInterval(progressJobs[id]);delete progressJobs[id];}}
var crossIntelLastQuery='',crossIntelDirection='licensure-to-global',crossIntelLimit='all';
function renderCrossIntelligence(){
 var input=$('crossIntelInput'),dir=$('crossIntelDirection'),lim=$('crossIntelLimit'),run=$('crossIntelRun');
 if(!input)return; input.value=crossIntelLastQuery;dir.value=crossIntelDirection;lim.value=String(crossIntelLimit);
 if(run)run.onclick=function(){crossIntelLastQuery=input.value.trim();crossIntelDirection=dir.value;crossIntelLimit=lim.value==='all'?'all':(Number(lim.value)||30);runCrossIntelligence();};
 var rebuild=$('crossIntelRebuild');
 if(rebuild)rebuild.onclick=function(){rebuild.disabled=true;rebuild.textContent='⏳ Rebuilding…';if(window.MQIStore&&window.MQIStore.rebuildIntelligenceIndex){window.MQIStore.rebuildIntelligenceIndex().then(function(n){toast('Rebuilt intelligence index for '+Number(n||0).toLocaleString()+' questions.');return runCrossIntelligence();}).catch(function(e){toast('Rebuild failed: '+(e&&e.message||'Unknown error'));}).then(function(){rebuild.disabled=false;rebuild.textContent='♻️ Rebuild Intelligence Index';});}else{toast('Rebuild tool unavailable');rebuild.disabled=false;rebuild.textContent='♻️ Rebuild Intelligence Index';}};
 // Automatic full comparison: Licensure first, then Global Banks. No search term is required.
 runCrossIntelligence();
}

function renderCrossIntelQuestionCard(m,side){var q=side==='source'?m.source:m.match;if(!q)return '';var label=q.databaseType==='licensure'?'🪪 Professional Licensure':'🌍 Global Question Bank';return '<div class="cross-intel-question"><div class="cross-intel-qhead"><span class="source-pill '+(q.databaseType==='licensure'?'lic':'global')+'">'+label+'</span><small>'+esc(repeatMeta(q))+'</small></div><b class="cross-intel-qtext">'+esc(q.originalQuestion||'')+'</b><div class="cross-intel-options">'+renderMiniOptions(q)+'</div><div class="repeat-location-actions"><button type="button" class="small-btn" data-view-qid="'+esc(q.id)+'">👁 View '+(q.databaseType==='licensure'?'Licensure':'Global')+'</button><button type="button" class="small-btn primary-mini" data-practice-qid="'+esc(q.id)+'">📝 Practice</button></div></div>';}
function renderMiniOptions(q){var o=q.originalOptions||q.options||{},ks=Object.keys(o),h='';for(var i=0;i<Math.min(5,ks.length);i++){var k=ks[i];h+='<div><b>'+esc(k)+'.</b> '+esc(String(o[k]||''))+'</div>';}return h;}
function runCrossIntelligence(){
 var status=$('crossIntelStatus'),host=$('crossIntelResults'),dir=crossIntelDirection,limit=crossIntelLimit;
 if(!status||!host)return;
 if(!window.MQIStore||!window.MQIStore.autoCrossDatabasePairs){host.innerHTML='<div class="empty-card">Cross-Database Intelligence engine is unavailable.</div>';return;}
 status.innerHTML='⏳ Automatically comparing Professional Licensure questions against all Global Question Banks…';
 host.innerHTML=progressMarkup('crossIntelProgress','Cross-database analysis')+'<div class="empty-card">🧠 Comparing question wording, answer choices, subject, topic and title.</div>';
 startAnalysisProgress('crossIntelProgress',['Opening database…','Scanning licensure questions…','Comparing global question banks…','Ranking matches…','Preparing results…']);
 window.MQIStore.autoCrossDatabasePairs(limit).then(function(out){
   finishAnalysisProgress('crossIntelProgress',true,'Analysis completed');
   var matches=out.pairs||[];
   status.innerHTML='<b>'+Number(out.sourcesAnalyzed||0).toLocaleString()+'</b> Professional Licensure questions analyzed · <b>'+matches.length+'</b> strongest cross-database matches';
   if(!matches.length){host.innerHTML='<div class="empty-card">No strong Licensure ↔ Global matches found. The database was scanned automatically. If you have both banks imported, use Database → Rebuild Intelligence Index once, then return here.</div>';return;}
   var h='<div class="cross-intel-summary panel"><b>🧠 Automatic Cross-Database Intelligence</b><small>Priority: Professional Licensure → Global Question Banks. Results are ranked using question wording, answer options, subject, topic, title and tags.</small></div>';
   for(var i=0;i<matches.length;i++){
     var m=matches[i],s=m.licensure,g=m.global;
     h+='<div class="panel cross-intel-pair"><div class="cross-intel-score"><strong>'+Math.round(m.score*100)+'%</strong><small>'+esc(m.matchLevel||'Similarity')+'</small><div><span>Question '+Math.round(m.questionSimilarity*100)+'%</span><span>Options '+Math.round(m.optionSimilarity*100)+'%</span><span>Topic '+Math.round(m.topicSimilarity*100)+'%</span></div></div><div class="cross-intel-pair-body">'+renderCrossIntelQuestionCard({source:s,match:g},'source')+'<div class="cross-arrow">↕</div>'+renderCrossIntelQuestionCard({source:s,match:g},'match')+'<div class="cross-intel-reasons"><b>Why these are related</b><span>'+(m.sameTopic?'✓ Same topic':'• Related topic')+'</span><span>'+(m.sameSubject?'✓ Same subject':'• Related subject')+'</span><span>✓ Option similarity '+Math.round(m.optionSimilarity*100)+'%</span></div><div class="repeat-location-actions"><button type="button" class="small-btn" data-view-qid="'+esc(s.id)+'">👁 View Licensure</button><button type="button" class="small-btn" data-view-qid="'+esc(g.id)+'">👁 View Global</button><button type="button" class="small-btn primary-mini" data-practice-pair="'+esc(s.id)+'|'+esc(g.id)+'">📝 Practice Both</button></div></div></div>';
   }
   host.innerHTML=h;
   var vb=host.querySelectorAll('[data-view-qid]'),pb=host.querySelectorAll('[data-practice-pair]'),i;
   for(i=0;i<vb.length;i++)vb[i].onclick=function(){openQuestionById(this.getAttribute('data-view-qid'));};
   for(i=0;i<pb.length;i++)pb[i].onclick=function(){var ids=(this.getAttribute('data-practice-pair')||'').split('|');Promise.all([window.MQIStore.get(ids[0]),window.MQIStore.get(ids[1])]).then(function(qs){practicePool=qs.filter(Boolean);practiceIndex=0;practiceAnswered=false;show('practice');renderPracticeQuestion();});};
 }).catch(function(err){finishAnalysisProgress('crossIntelProgress',false,'Analysis failed');status.innerHTML='❌ Cross-database analysis failed';host.innerHTML=progressMarkup('crossIntelProgress','Cross-database analysis')+'<div class="empty-card">'+esc(err&&err.message||'Unknown error')+'</div>';});
}

function renderFrequency(){
 var el=$('frequencyContent');if(!el)return;el.innerHTML=progressMarkup('frequencyProgress','Question frequency analysis')+'<div class="empty-card">🔎 Scanning IndexedDB without loading the full database into memory.</div>';
 if(!window.MQIStore||!window.MQIStore.frequencyAnalysis){el.innerHTML='<div class="empty-card">Frequency analysis engine is unavailable.</div>';return;}
 startAnalysisProgress('frequencyProgress',['Opening question database…','Counting all questions…','Finding exact repeats…','Grouping similar questions…','Calculating subject and topic frequency…','Preparing report…']);
 window.MQIStore.frequencyAnalysis({}).then(function(a){
   finishAnalysisProgress('frequencyProgress',true,'All questions analyzed');
   var h='<div class="summary-strip"><div><b>'+a.total.toLocaleString()+'</b><small>All questions analyzed</small></div><div><b>'+a.licensureTotal.toLocaleString()+'</b><small>Professional Licensure</small></div><div><b>'+a.globalTotal.toLocaleString()+'</b><small>Global Banks</small></div></div>';
   h+='<div class="panel"><h3>🔁 Exact Repeated Questions</h3><p class="settings-note">Level 1: the question text is effectively identical. <b>Tap any question to see exactly where it was repeated.</b></p>';
   if(!a.exact.length)h+='<div class="empty-card">No exact repetitions detected.</div>';
   for(var i=0;i<Math.min(20,a.exact.length);i++)h+='<button type="button" class="rank-row repeat-row" data-repeat-index="questionSignature" data-repeat-key="'+encodeURIComponent(a.exact[i].key)+'"><span>#'+(i+1)+'</span><div><b>'+esc(a.exact[i].key)+'</b><small>'+a.exact[i].count+' occurrences across all databases · Tap to see locations</small></div><strong>'+a.exact[i].count+'×</strong></button>';
   h+='<div id="repeatLocations"></div></div>';
   h+='<div class="panel"><h3>🌐🔁 Cross-Database Similar Questions</h3><p class="settings-note"><b>Priority intelligence:</b> questions from Professional Licensure that test the same concept and have similar wording in Global Question Banks, even when the wording is not identical. This is the level that catches cases such as <i>“Earliest appearance of clubbing is seen in”</i> vs <i>“Clubbing occurs earliest with”</i>.</p>';var cs=a.crossSimilar||[];if(!cs.length)h+='<div class="empty-card">No cross-database similar question pairs detected yet.</div>';for(i=0;i<Math.min(30,cs.length);i++){var pair=cs[i],lq=pair.licensure||{},gq=pair.global||{};h+='<div class="cross-similar-card"><div class="cross-similar-score"><b>'+Math.round(pair.score*100)+'%</b><small>similarity</small></div><div class="cross-similar-body"><div><span class="source-pill lic">🪪 Licensure</span> <b>'+esc(lq.originalQuestion||'')+'</b><small>'+esc(repeatMeta(lq))+'</small></div><div class="cross-arrow">↕</div><div><span class="source-pill global">🌍 Global</span> <b>'+esc(gq.originalQuestion||'')+'</b><small>'+esc(repeatMeta(gq))+'</small></div><div class="repeat-location-actions"><button type="button" class="small-btn" data-view-qid="'+esc(lq.id)+'">👁 View Licensure</button><button type="button" class="small-btn" data-view-qid="'+esc(gq.id)+'">👁 View Global</button><button type="button" class="small-btn primary-mini" data-practice-pair="'+esc(lq.id)+'|'+esc(gq.id)+'">📝 Practice Both</button></div></div></div>';}h+='</div>';   h+='<div class="panel"><h3>🧩 Similar Question Patterns</h3><p class="settings-note">Level 2: similar wording pattern + same subject/topic. <b>Tap a pattern to see where the related questions occur.</b></p>';if(!a.patterns.length)h+='<div class="empty-card">No repeated patterns detected.</div>';for(i=0;i<Math.min(20,a.patterns.length);i++)h+='<button type="button" class="rank-row repeat-row" data-repeat-index="patternKey" data-repeat-key="'+encodeURIComponent(a.patterns[i].key)+'"><span>#'+(i+1)+'</span><div><b>'+esc(a.patterns[i].key)+'</b><small>'+a.patterns[i].count+' related occurrences · Tap to see locations</small></div><strong>'+a.patterns[i].count+'×</strong></button>';h+='<div id="patternLocations"></div></div>';
   h+='<div class="analytics-grid"><div class="panel"><h3>🪪 Licensure — Most Tested Subjects</h3>';for(i=0;i<Math.min(15,a.licensureSubjects.length);i++)h+='<div class="rank-row"><span>'+iconFor(a.licensureSubjects[i].key)+'</span><div><b>'+esc(subjectName(a.licensureSubjects[i].key))+'</b></div><strong>'+a.licensureSubjects[i].count+'</strong></div>';h+='</div><div class="panel"><h3>🪪 Licensure — Most Repeated Topics</h3>';for(i=0;i<Math.min(15,a.licensureTopics.length);i++)h+='<div class="rank-row"><span>🏷️</span><div><b>'+esc(a.licensureTopics[i].key)+'</b></div><strong>'+a.licensureTopics[i].count+'</strong></div>';h+='</div></div>';
   h+='<div class="panel"><h3>🌐 Licensure ↔ Global Topic Overlap</h3><p class="settings-note">Topics appearing in both Professional Licensure and Global Question Banks are prioritized here. This does not mean the questions are identical.</p>';var overlap=a.crossTopics.filter(function(x){return x.licensure>0&&x.global>0;});if(!overlap.length)h+='<div class="empty-card">No cross-database topic overlap detected yet.</div>';for(i=0;i<Math.min(25,overlap.length);i++)h+='<div class="rank-row"><span>🔗</span><div><b>'+esc(overlap[i].key)+'</b><small>Licensure: '+overlap[i].licensure+' · Global: '+overlap[i].global+'</small></div><strong>'+overlap[i].total+'</strong></div>';h+='</div>';
   h+='<div class="panel"><h3>📊 Overall Question Frequency</h3><p class="settings-note">Top subjects and topics across the complete database, not only the current app mode.</p>';for(i=0;i<Math.min(12,a.subjects.length);i++)h+='<div class="rank-row"><span>🎯</span><div><b>'+esc(subjectName(a.subjects[i].key))+'</b></div><strong>'+a.subjects[i].count+'</strong></div>';h+='</div>';
   el.innerHTML=h;
   bindRepeatLocationRows();
   var csBtns=el.querySelectorAll('[data-practice-pair]'),vBtns=el.querySelectorAll('.cross-similar-card [data-view-qid]'),ci;
   for(ci=0;ci<vBtns.length;ci++)vBtns[ci].onclick=function(){openQuestionById(this.getAttribute('data-view-qid'));};
   for(ci=0;ci<csBtns.length;ci++)csBtns[ci].onclick=function(){var ids=(this.getAttribute('data-practice-pair')||'').split('|');if(ids.length!==2)return;Promise.all([window.MQIStore.get(ids[0]),window.MQIStore.get(ids[1])]).then(function(qs){var arr=qs.filter(Boolean);if(!arr.length){toast('Questions not found');return;}practicePool=arr;practiceIndex=0;practiceAnswered=false;show('practice');renderPracticeQuestion();});};
 }).catch(function(err){finishAnalysisProgress('frequencyProgress',false,'Analysis failed');el.innerHTML=progressMarkup('frequencyProgress','Question frequency analysis')+'<div class="empty-card">Frequency analysis failed: '+esc(err&&err.message||'Unknown error')+'</div>';});
}
function repeatMeta(o){var parts=[];if(o.databaseType)parts.push(o.databaseType==='licensure'?'🪪 Professional Licensure':'🌍 Global Question Bank');if(o.questionBank)parts.push('Bank: '+o.questionBank);if(o.examTitle)parts.push('Exam: '+o.examTitle);if(o.examProvider)parts.push('Provider: '+o.examProvider);if(o.specialty)parts.push('Specialty: '+o.specialty);if(o.subject)parts.push('Subject: '+o.subject);if(o.topic)parts.push('Topic: '+o.topic);if(o.country)parts.push('Country: '+o.country);if(o.city||o.governorate)parts.push('Location: '+(o.city||o.governorate));if(o.year)parts.push('Year: '+o.year);if(o.exactDate)parts.push('Date: '+o.exactDate);if(o.questionNumber)parts.push('Question #'+o.questionNumber);return parts.join(' · ');}
function bindRepeatLocationRows(){var rows=document.querySelectorAll('.repeat-row'),i;for(i=0;i<rows.length;i++)rows[i].onclick=function(){var indexName=this.getAttribute('data-repeat-index'),key=decodeURIComponent(this.getAttribute('data-repeat-key')||''),target=indexName==='questionSignature'?'repeatLocations':'patternLocations';var host=$(target);if(!host||!window.MQIStore||!window.MQIStore.groupOccurrences){toast('Repeated-question location data is unavailable.');return;}host.innerHTML='<div class="repeat-locations panel"><b>🔎 Loading where this question occurs…</b></div>';window.MQIStore.groupOccurrences(indexName,key,'',50).then(function(rows){var h='<div class="repeat-locations panel"><div class="section-head compact"><div><h3>📍 Where this '+(indexName==='questionSignature'?'question':'pattern')+' occurs</h3><p>'+rows.length+' occurrence'+(rows.length===1?'':'s')+' found across all databases.</p></div><button type="button" class="small-btn" id="closeRepeatLocations">Close</button></div>';if(!rows.length)h+='<div class="empty-card">No occurrence details found.</div>';if(rows.length>1)h+='<div class="repeat-practice-bar"><button type="button" class="wide-btn" id="practiceRepeatedGroup">📝 Practice '+(indexName==='questionSignature'?'Both / All Repeated Questions':'These Similar Questions')+' ('+rows.length+')</button></div>';for(var j=0;j<rows.length;j++){var o=rows[j];h+='<div class="repeat-location-card"><div class="repeat-location-info"><b>'+(o.databaseType==='licensure'?'🪪 Licensure':'🌍 Global')+' · '+esc(o.questionBank||o.examProvider||o.examTitle||'Database')+'</b><small>'+esc(repeatMeta(o))+'</small></div><div class="repeat-location-actions"><button type="button" class="small-btn" data-view-qid="'+esc(o.id)+'">👁 View Question</button><button type="button" class="small-btn primary-mini" data-practice-qid="'+esc(o.id)+'">📝 Practice</button></div></div>';}h+='</div>';host.innerHTML=h;var close=$('closeRepeatLocations');if(close)close.onclick=function(){host.innerHTML='';};var viewBtns=host.querySelectorAll('[data-view-qid]'),practiceBtns=host.querySelectorAll('[data-practice-qid]'),k;for(k=0;k<viewBtns.length;k++)viewBtns[k].onclick=function(){openQuestionById(this.getAttribute('data-view-qid'));};for(k=0;k<practiceBtns.length;k++)practiceBtns[k].onclick=function(){practiceQuestionById(this.getAttribute('data-practice-qid'));};var groupBtn=$('practiceRepeatedGroup');if(groupBtn)groupBtn.onclick=function(){var ids=[];for(var gi=0;gi<rows.length;gi++)if(rows[gi]&&rows[gi].id)ids.push(rows[gi].id);if(!ids.length){toast('No questions available to practice');return;}groupBtn.disabled=true;groupBtn.textContent='⏳ Loading questions…';window.MQIStore.getMany(ids).then(function(qs){if(!qs.length){toast('No questions available to practice');groupBtn.disabled=false;groupBtn.textContent='📝 Practice Repeated Questions';return;}practicePool=qs;practiceIndex=0;practiceAnswered=false;show('practice');renderPracticeQuestion();}).catch(function(){groupBtn.disabled=false;groupBtn.textContent='📝 Practice Repeated Questions';toast('Could not load repeated questions');});};host.scrollIntoView({behavior:'smooth',block:'nearest'});}).catch(function(err){host.innerHTML='<div class="empty-card">Could not load repeated locations: '+esc(err&&err.message||'Unknown error')+'</div>';});};}

function renderAllDatabaseAnalytics(){
 if(!window.MQIStore||!window.MQIStore.frequencyAnalysis)return;
 var host=$('analyticsContent');if(!host)return;
 var old=document.getElementById('allDbAnalyticsPanel');if(old)old.remove();
 window.MQIStore.frequencyAnalysis({}).then(function(freq){
   var attempts=state.attempts||[],ids=[],seen={};for(var i=0;i<attempts.length;i++){if(!seen[attempts[i].questionId]){seen[attempts[i].questionId]=1;ids.push(attempts[i].questionId);}}
   return window.MQIStore.getMany(ids.slice(0,5000)).then(function(qs){
     var map={},j;for(j=0;j<qs.length;j++)map[qs[j].id]=qs[j];var licStats={},licWrong={},licAttempts=0,licCorrect=0;
     for(j=0;j<attempts.length;j++){var q=map[attempts[j].questionId];if(!q||((q.databaseType||'licensure')!=='licensure'))continue;licAttempts++;if(attempts[j].correct)licCorrect++;var su=q.subject||'Uncategorized';if(!licStats[su])licStats[su]={c:0,n:0};licStats[su].n++;if(attempts[j].correct)licStats[su].c++;}
     var weak=[],strong=[],k;for(k in licStats){var pp=pct(licStats[k].c,licStats[k].n),row={key:k,p:pp,n:licStats[k].n,c:licStats[k].c};if(pp<60)weak.push(row);if(pp>=80)strong.push(row);}weak.sort(function(a,b){return a.p-b.p;});strong.sort(function(a,b){return b.p-a.p;});
     var overlap=freq.crossTopics.filter(function(x){return x.licensure>0&&x.global>0;}).slice(0,10);
     var panel=document.createElement('div');panel.id='allDbAnalyticsPanel';panel.className='panel';var h='<div class="section-head compact"><div><h3>🧠 Complete Question Intelligence</h3><p>Performance + Professional Licensure analysis + all-database frequency</p></div></div>';
     h+='<div class="metric-grid"><div class="metric"><div>🗃️ Total Questions</div><b>'+freq.total.toLocaleString()+'</b><small>All databases</small></div><div class="metric"><div>🪪 Licensure</div><b>'+freq.licensureTotal.toLocaleString()+'</b><small>Licensure database</small></div><div class="metric"><div>🌍 Global</div><b>'+freq.globalTotal.toLocaleString()+'</b><small>Global databases</small></div><div class="metric"><div>🎯 Licensure Accuracy</div><b>'+pct(licCorrect,licAttempts)+'%</b><small>'+licAttempts.toLocaleString()+' attempts</small></div></div>';
     h+='<div class="analytics-two-col"><div><h3>🪪 Licensure Weak Subjects</h3>';if(!weak.length)h+='<div class="empty-card">No licensure weak subjects yet.</div>';for(j=0;j<Math.min(8,weak.length);j++)h+='<div class="rank-row"><span>⚠️</span><div><b>'+esc(subjectName(weak[j].key))+'</b><small>'+weak[j].c+'/'+weak[j].n+' correct</small></div><strong>'+weak[j].p+'%</strong></div>';h+='</div><div><h3>🪪 Licensure Strong Subjects</h3>';if(!strong.length)h+='<div class="empty-card">Answer more licensure questions to build this list.</div>';for(j=0;j<Math.min(8,strong.length);j++)h+='<div class="rank-row"><span>✅</span><div><b>'+esc(subjectName(strong[j].key))+'</b><small>'+strong[j].c+'/'+strong[j].n+' correct</small></div><strong>'+strong[j].p+'%</strong></div>';h+='</div></div>';
     h+='<div><h3>🔗 Licensure Topics Reappearing in Other Banks</h3>';if(!overlap.length)h+='<div class="empty-card">No overlapping topics detected yet.</div>';for(j=0;j<overlap.length;j++)h+='<div class="rank-row"><span>🔗</span><div><b>'+esc(overlap[j].key)+'</b><small>Licensure '+overlap[j].licensure+' · Global '+overlap[j].global+'</small></div><strong>'+overlap[j].total+'</strong></div>';h+='</div>';
     h+='<div class="settings-note">Cross-database analysis uses exact repetition first, then pattern/topic similarity. It does not replace medical verification and does not assume that similar questions have the same answer.</div>';panel.innerHTML=h;host.appendChild(panel);
   });
 }).catch(function(){});
}
function renderAnalytics(){
 var attempts=state.attempts||[],arr=filteredDb('none'),allowed={},i,q;
 for(i=0;i<arr.length;i++)allowed[arr[i].id]=1;
 var scoped=[],correct=0;
 for(i=0;i<attempts.length;i++){if(!allowed[attempts[i].questionId])continue;scoped.push(attempts[i]);if(attempts[i].correct)correct++;}
 var accuracy=pct(correct,scoped.length);
 var uniqueAttempted={},weakSubjects=[],subjectStats={},topicStats={},majors={};
 for(i=0;i<scoped.length;i++){
   q=findById(scoped[i].questionId);if(!q)continue;
   uniqueAttempted[q.id]=1;
   var subject=q.subject||'Uncategorized',topic=q.topic||'Uncategorized',mid=majorOfSubject(subject||'other');
   if(!subjectStats[subject])subjectStats[subject]={c:0,n:0,major:mid};
   subjectStats[subject].n++;if(scoped[i].correct)subjectStats[subject].c++;
   var tk=subject+'|||'+topic;
   if(!topicStats[tk])topicStats[tk]={c:0,n:0,subject:subject,topic:topic,major:mid};
   topicStats[tk].n++;if(scoped[i].correct)topicStats[tk].c++;
   if(!majors[mid])majors[mid]={c:0,n:0};majors[mid].n++;if(scoped[i].correct)majors[mid].c++;
 }
 var weakS=[];
 for(var sk in subjectStats)if(subjectStats.hasOwnProperty(sk)){var sp=pct(subjectStats[sk].c,subjectStats[sk].n);if(sp<60)weakS.push({id:sk,c:subjectStats[sk].c,n:subjectStats[sk].n,p:sp});}
 weakS.sort(function(a,b){return a.p-b.p;});
 var weakT=[];
 for(var tk2 in topicStats)if(topicStats.hasOwnProperty(tk2)){var tp=pct(topicStats[tk2].c,topicStats[tk2].n);if(tp<60)weakT.push({id:tk2,c:topicStats[tk2].c,n:topicStats[tk2].n,p:tp,subject:topicStats[tk2].subject,topic:topicStats[tk2].topic});}
 weakT.sort(function(a,b){return a.p-b.p;});
 var sig={},rep=[];
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
 for(i=0;i<arr.length;i++){var sg=signature(arr[i]);if(sg)sig[sg]=(sig[sg]||0)+1;}
 for(var rk in sig)if(sig.hasOwnProperty(rk)&&sig[rk]>1)rep.push({q:rk,n:sig[rk]});
 rep.sort(function(a,b){return b.n-a.n;});
 var h='';
 h+='<div class="smart-insight analytics-smart">';
 h+='<div class="smart-head"><div><span class="smart-kicker">🧠 Smart Analytics</span><h2>Study Intelligence</h2><p>Automatically prioritizes what you should study next.</p></div><div class="readiness-ring"><b>'+readiness+'%</b><small>'+readinessLabel+'</small></div></div>';
 h+='<div class="smart-metrics"><div><span>📚 Coverage</span><b>'+coverage+'%</b><small>'+uniqueCount+' of '+arr.length+' questions attempted</small></div><div><span>📈 Trend</span><b class="'+(trend>0?'up':trend<0?'down':'flat')+'">'+(trend>0?'+':'')+trend+'%</b><small>Recent performance change</small></div><div><span>🎯 Consistency</span><b>'+consistency+'%</b><small>Stability of your performance</small></div></div>';
 h+='<div class="smart-next"><span>✨ Next Best Action</span><b>'+esc(nextAction)+'</b></div>';
 h+='</div>';
 h+='<div class="metric-grid analytics-metrics">';
 h+='<div class="metric"><div>🎯 Accuracy</div><b>'+accuracy+'%</b><div class="bar"><i style="width:'+accuracy+'%"></i></div><small>Across '+scoped.length+' answered questions</small></div>';
 h+='<div class="metric"><div>📝 Attempts</div><b>'+scoped.length+'</b><small>Practice + mock attempts</small></div>';
 h+='<button class="metric metric-click" id="analyticsWeak"><div>⚠️ Weak Areas</div><b>'+weakS.length+'</b><small>Tap to review weak areas</small></button>';
 h+='<button class="metric metric-click" id="analyticsRepeated"><div>🔁 Repeated</div><b>'+rep.length+'</b><small>Repeated question groups</small></button>';
 h+='</div>';
 h+='<div class="section-head analytics-section-head"><div><h2>Performance by Section</h2><p>Major section → sub-specialty</p></div><span class="pill">'+Object.keys(majors).length+' sections</span></div>';
 var hasMajor=false;
 for(i=0;i<MAJOR_SECTIONS.length;i++){
   var m=MAJOR_SECTIONS[i],ms=majors[m.id];if(!ms)continue;hasMajor=true;var mp=pct(ms.c,ms.n);
   h+='<button class="analytics-major-card" data-analytics-major="'+esc(m.id)+'"><span class="analytics-major-icon">'+m.icon+'</span><span class="analytics-major-main"><b>'+esc(m.en)+'</b><small>'+ms.c+'/'+ms.n+' correct · '+mp+'%</small><span class="bar"><i style="width:'+mp+'%"></i></span></span><strong>'+mp+'%</strong><i>›</i></button>';
 }
 if(!hasMajor)h+='<div class="empty-card">Solve some questions to generate section analytics.</div>';
 h+='<div class="panel analytics-card priority-panel"><div class="section-head compact"><div><h3>🎯 Smart Study Priorities</h3><p>Ranked by weakness × question frequency</p></div></div>';
 if(!priorityTopics.length)h+='<div class="empty-card">Answer more questions to unlock smart priorities.</div>';
 for(i=0;i<Math.min(5,priorityTopics.length);i++){var pt=priorityTopics[i];h+='<button class="priority-row" data-priority-sub="'+esc(pt.subject)+'" data-priority-topic="'+esc(pt.topic)+'"><span class="priority-rank">'+(i+1)+'</span><span><b>'+esc(pt.topic)+'</b><small>'+esc(subjectName(pt.subject))+' · '+pt.n+' attempt'+(pt.n===1?'':'s')+'</small><span class="priority-track"><i style="width:'+Math.max(4,pt.p)+'%"></i></span></span><strong>'+pt.p+'%</strong><i>›</i></button>';}
 h+='</div>';
 h+='<div class="analytics-two-col">';
 h+='<div class="panel analytics-card"><div class="section-head compact"><div><h3>⚠️ Weak Areas</h3><p>Lowest accuracy first</p></div><button class="small-btn" id="analyticsWeakAll">View all →</button></div>';
 if(!weakS.length)h+='<div class="weak-good">🎉 No weak specialties yet.</div>';
 for(i=0;i<Math.min(5,weakS.length);i++){var ws=weakS[i];h+='<button class="analytics-list-row" data-analytics-weak="'+esc(ws.id)+'"><span>'+iconFor(ws.id)+'</span><div><b>'+esc(subjectName(ws.id))+'</b><small>'+ws.c+'/'+ws.n+' correct</small><span class="weak-bar"><i style="width:'+ws.p+'%"></i></span></div><strong>'+ws.p+'%</strong><i>›</i></button>';}
 h+='</div>';
 h+='<div class="panel analytics-card"><div class="section-head compact"><div><h3>🔁 Question Frequency</h3><p>Most repeated content</p></div><button class="small-btn" id="analyticsFreq">Open →</button></div>';
 if(!rep.length)h+='<div class="empty-card">No repeated questions detected yet.</div>';
 for(i=0;i<Math.min(5,rep.length);i++)h+='<div class="analytics-list-row static"><span>🔁</span><div><b>'+esc(rep[i].q.substring(0,70))+(rep[i].q.length>70?'…':'')+'</b><small>'+rep[i].n+' occurrences</small></div><strong>'+rep[i].n+'×</strong></div>';
 h+='</div></div>';
 h+='<div class="panel analytics-history"><div class="section-head compact"><div><h3>📈 Mock Exam History</h3><p>Recent timed exam performance</p></div></div>';
 if(!state.examHistory||!state.examHistory.length)h+='<div class="empty-card">No mock exams completed yet.</div>';
 else {var hist=state.examHistory.slice(-6).reverse();for(i=0;i<hist.length;i++){var hp=hist[i].percent||pct(hist[i].score,hist[i].total);h+='<div class="history-row"><span>⏱️</span><div><b>'+esc(new Date(hist[i].date).toLocaleDateString())+'</b><small>'+hist[i].score+'/'+hist[i].total+' correct</small></div><strong>'+hp+'%</strong><span class="history-bar"><i style="width:'+hp+'%"></i></span></div>';}}
 h+='</div>';
 $('analyticsContent').innerHTML=h;
 renderAllDatabaseAnalytics();
 var ri=document.querySelector('.readiness-ring');if(ri)ri.style.setProperty('--readiness',readiness);
 var rows=document.querySelectorAll('[data-analytics-major]');for(i=0;i<rows.length;i++)rows[i].onclick=function(){showIntelDetail('major',this.getAttribute('data-analytics-major'));};
 var wr=document.querySelectorAll('[data-analytics-weak]');for(i=0;i<wr.length;i++)wr[i].onclick=function(){showIntelDetail('subject',this.getAttribute('data-analytics-weak'));};
 var aw=$('analyticsWeak');if(aw)aw.onclick=showWeakAreasDetail;var awa=$('analyticsWeakAll');if(awa)awa.onclick=showWeakAreasDetail;
 var pr=document.querySelectorAll('[data-priority-sub]');for(i=0;i<pr.length;i++)pr[i].onclick=function(){closeIntelDetail();startPracticeByTopic(this.getAttribute('data-priority-sub'),this.getAttribute('data-priority-topic'));};
 var arf=$('analyticsRepeated');if(arf)arf.onclick=function(){show('frequency');};var af=$('analyticsFreq');if(af)af.onclick=function(){show('frequency');};
}
function downloadTextFile(textValue,name){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([textValue],{type:'text/plain;charset=utf-8'}));a.download=name;document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(function(){URL.revokeObjectURL(a.href);},1000);}
function licensureImportPrompt(){return `You are a Medical Licensing Examination Question Bank Analyst and JSON Converter. Extract every question from the uploaded licensure examination exactly as it appears. Preserve original question, original options, question number, source answer and repetitions. Do not silently correct the source. Analyze each question medically and add Subject, Topic, Title, Correct Answer, Correction Status, Corrected Question, Explanation, option-by-option explanations and Tags. Extract medical profession, specialty, qualification, country, governorate/city, year, month, exact date, language, source, exam title and number of questions. Return ONLY valid JSON compatible with the Medical Licensure Question Intelligence application. Add databaseType: "licensure" to exam metadata/questions. If information is unavailable use "Not provided in source." Do not invent questions or options.`;}
function globalImportPrompt(){return `You are an International Medical Question Bank Analyst and JSON Converter. Extract every question from the uploaded global examination/question-bank file exactly as it appears. Preserve the original question, original options, source answer and repeated questions. Do not silently correct source content. Analyze every question medically and add Subject, Topic, Title, medically verified Correct Answer, Correction Status, Corrected Question, Explanation, option-by-option explanations and Tags. Extract bankName, exam/provider, medical profession, specialty, qualification when available, country, city/region when available, year, month, exact date, language, source, exam title and number of questions. Return ONLY valid JSON compatible with the application. Add databaseType: "global" to exam metadata/questions and use the bankName field for the international question bank/provider (for example USMLE, PLAB, MRCP, Prometric, NBME, or another bank). If information is unavailable use "Not provided in source." Do not invent questions or options.`;}
function databaseFileKey(file){return text(file||'').split('/').pop().replace(/\\.json$/i,'').replace(/[^A-Za-z0-9_-]/g,'_');}
function questionBelongsToSelectedDatabase(q){
 if(!selectedDatabaseFileKey)return true;
 q=q||{};var key=selectedDatabaseFileKey.toLowerCase();
 var vals=[q.sourceFile,q.source,q.questionBank,q.bankName,q.examTitle,q.exam,text(q.id||'').split('::')[0]];
 for(var i=0;i<vals.length;i++){
  var v=text(vals[i]).toLowerCase();if(!v)continue;
  var base=v.split('/').pop().replace(/\\.json$/i,'').replace(/[^a-z0-9_-]/g,'_');
  if(base===key||v.indexOf(key)>=0||key.indexOf(base)>=0)return true;
 }
 return false;
}
function loadSelectedDatabase(file,label,callback){
 var files=(window._manifest&&window._manifest.files)||[];
 var entry=null;for(var i=0;i<files.length;i++)if(String(files[i].file||'')===String(file||'')){entry=files[i];break;}
 if(!entry)entry={file:file,label:label};
 toast('Loading questions from '+(label||file)+'…');
 loadAndNormalizeExamFile(entry).then(function(rows){
  if(!rows||!rows.length){toast('This file contains no recognized questions. Check its JSON structure.');return;}
  selectedDatabaseFileKey=databaseFileKey(file);selectedDatabaseLabel=label||file;selectedDatabasePool=rows;
  if(typeof callback==='function')callback(rows);
 }).catch(function(e){toast('Could not load this database file. Check that data/'+file+' is available.');});
}
function openDatabaseForPractice(file,label){
 loadSelectedDatabase(file,label,function(pool){
  practicePool=pool.slice();practiceIndex=0;practiceAnswered=false;privateMockContext=null;mock=null;clearInterval(timer);timer=null;
  show('practice');renderPracticeQuestion();
 });
}
function openDatabaseForMock(file,label){
 loadSelectedDatabase(file,label,function(pool){
  privateMockContext={id:'db-'+databaseFileKey(file),title:label||file,questions:pool,pool:pool};
  clearInterval(timer);timer=null;mock=null;show('mock');
  var count=$('mockCount');if(count)count.value=Math.min(100,pool.length);
  var summary=$('mockPoolSummary');if(summary)summary.textContent=pool.length+' questions available from '+(label||file);
 });
}
function renderDatabase(){
 var m=window._manifest,files=m&&m.files?m.files:[],promptTitle=appMode==='global'?'Global Question Bank JSON Prompt':'Professional Licensure JSON Prompt',promptText=appMode==='global'?globalImportPrompt():licensureImportPrompt();
 var h='<div class="panel database-mode-panel"><div class="create-block-title">Database Mode</div><div class="mode-switch"><button class="small-btn '+(appMode==='licensure'?'active':'')+'" id="dbLicensureMode">🪪 Professional Licensure</button><button class="small-btn '+(appMode==='global'?'active':'')+'" id="dbGlobalMode">🌍 Global Question Banks</button></div><p class="settings-note">'+esc(promptTitle)+'. Questions imported in this mode remain separated from the other database.</p><textarea id="databasePrompt" class="select prompt-box" rows="8">'+esc(promptText)+'</textarea><div class="action-grid"><button class="wide-btn" id="copyDatabasePrompt">📋 Copy Prompt</button><button class="wide-btn" id="downloadDatabasePrompt">⬇️ Download Prompt</button></div></div>';
 h+='<div class="summary-strip"><div><b>'+filteredDb('none').length+'</b><small>Active Questions</small></div><div><b>'+countExams()+'</b><small>Exams</small></div><div><b>'+files.length+'</b><small>Database files</small></div></div><div class="database-actions panel"><h3>🗃️ Database Manager</h3><p class="settings-note">Import JSON, merge it into the selected database, download the template, export the active database, or sync detected files.</p><div class="action-grid"><button class="wide-btn" id="dbImport">📥 Import Exam JSON</button><button class="wide-btn" id="dbTemplate">🧩 Download JSON Template</button><button class="wide-btn" id="dbExport">📤 Export Active Database</button><button class="wide-btn" id="dbSync">🔄 Auto-Detect Exam Files</button></div></div><div class="panel"><h3>📁 Loaded Exam Files</h3><div class="db-files">';
 for(var j=0;j<files.length;j++){var f=files[j],ff=String(f.file||''),fl=String(f.label||f.file||'');h+='<div class="db-file"><div class="db-icon">📄</div><div class="db-file-main"><b>'+esc(fl)+'</b><span>'+esc(ff)+'</span><div class="db-file-actions"><button type="button" class="small-btn db-practice" data-file="'+esc(ff)+'" data-label="'+esc(fl)+'">📝 Practice</button><button type="button" class="small-btn db-mock" data-file="'+esc(ff)+'" data-label="'+esc(fl)+'">⏱️ Mock Exam</button></div></div></div>'; }
 if(!files.length)h+='<div class="empty-card">No manifest files detected. You can still import JSON manually.</div>';
 h+='</div></div><input id="databaseFileInput" type="file" accept="application/json,.json" multiple hidden>';
 $('databaseContent').innerHTML=h;
 Array.prototype.forEach.call(document.querySelectorAll('.db-practice'),function(btn){btn.onclick=function(){openDatabaseForPractice(this.getAttribute('data-file'),this.getAttribute('data-label'));};});
 Array.prototype.forEach.call(document.querySelectorAll('.db-mock'),function(btn){btn.onclick=function(){openDatabaseForMock(this.getAttribute('data-file'),this.getAttribute('data-label'));};});
 if(window.MQIStore){window.MQIStore.countWhere(activeStoreFilters(),appMode).then(function(n){var el=document.querySelector('#databaseContent .summary-strip div:first-child b');if(el)el.textContent=n.toLocaleString();}).catch(function(){});}
 $('dbLicensureMode').onclick=function(){setAppMode('licensure');renderDatabase();renderAll();};
 $('dbGlobalMode').onclick=function(){setAppMode('global');renderDatabase();renderAll();};
 $('copyDatabasePrompt').onclick=function(){var t=$('databasePrompt').value;if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){toast('Prompt copied.');}).catch(function(){toast('Copy unavailable; select the prompt text.');});}else toast('Copy unavailable; select the prompt text.');};
 $('downloadDatabasePrompt').onclick=function(){downloadTextFile(promptText,appMode==='global'?'global_question_bank_prompt.txt':'professional_licensure_prompt.txt');};
 $('dbImport').onclick=function(){$('databaseFileInput').click();};
 $('databaseFileInput').onchange=function(){var fs=this.files||[],idx=0,self=this;function next(){if(idx>=fs.length){self.value='';return;}importJsonFile(fs[idx++]);setTimeout(next,50);}next();};
 $('dbTemplate').onclick=downloadExamTemplate;$('dbExport').onclick=exportJson;$('dbSync').onclick=syncFiles;
}
function setAppMode(mode){
 appMode=mode==='global'?'global':'licensure';
 globalBank='';
 try{localStorage.setItem('ymlq_app_mode',appMode);}catch(e){}
 /* Switching database modes must refresh the in-memory page cache from IndexedDB.
    Otherwise Dashboard/Practice still contain the previous mode's questions. */
 if(appMode==='global'){examFilters.profession='';examFilters.qualification='';}
 persistExamFilters();
 if(window.MQIStore){
   loadScalableCache(function(){
     bankPage=0;
     if(typeof renderAll==='function')renderAll();
   });
 }else{
   db=[];
   if(typeof renderAll==='function')renderAll();
 }
}
function appModeLabel(){return appMode==='global'?'Global Question Banks':'Professional Licensure';}
function renderHome(){
  var ov=document.getElementById('dashboardOverviewTitle'),os=document.getElementById('dashboardOverviewSubtitle'),ms=document.getElementById('medicalSectionsTitle'),mss=document.getElementById('medicalSectionsSubtitle');if(ov)ov.textContent='Overview';if(os)os.textContent='Your question bank at a glance';if(ms)ms.textContent='Medical Sections';if(mss)mss.textContent='Choose a major section, then explore its sub-specialties';
  var allowed={},arr=filteredDb('none'),ai;for(ai=0;ai<arr.length;ai++)allowed[arr[ai].id]=1;var attempts=state.attempts||[],correct=0,matchedAttempts=0,i;for(i=0;i<attempts.length;i++)if(allowed[attempts[i].questionId]){matchedAttempts++;if(attempts[i].correct)correct;}
  var acc=pct(correct,matchedAttempts),majorCount=0;
  for(i=0;i<MAJOR_SECTIONS.length;i++)if(countMajor(MAJOR_SECTIONS[i].id)>0)majorCount++;
  var activeDb=filteredDb('none');
  $('stats').innerHTML='<div class="stat"><div class="emoji">📋</div><b>'+countExams()+'</b><small>Total Exams</small></div><div class="stat"><div class="emoji">❓</div><b>'+activeDb.length+'</b><small>Questions</small></div><div class="stat"><div class="emoji">🗂️</div><b>'+majorCount+'</b><small>Sections</small></div><div class="stat"><div class="emoji">🎯</div><b>'+acc+'%</b><small>Your Accuracy</small></div>';
  $('dbStatus').textContent=activeDb.length+' questions matched';
  var selector=document.getElementById('examSelector');if(selector){selector.innerHTML=examSelectorHtml();bindExamSelector();updateExamSelector();}
  $('subjectGrid').innerHTML=majorSectionsHtml();
  bindSectionCards();
  /* Global Dashboard uses the full IndexedDB, not the 750-question RAM cache. */
  if(appMode==='global' && window.MQIStore && window.MQIStore.dashboardAggregate){
    $('dbStatus').textContent='Loading all Global Question Banks…';
    window.MQIStore.dashboardAggregate('global').then(function(a){
      renderGlobalDashboardFromAggregate(a);
    }).catch(function(){toast('Could not load Global Dashboard data');});
  }
}
function countMapKeys(m){return m?Object.keys(m).length:0;}
function sortedCountRows(m){var a=[],k;for(k in (m||{}))a.push({key:k,count:m[k]});a.sort(function(x,y){return y.count-x.count||x.key.localeCompare(y.key);});return a;}
function globalMajorCountFromAggregate(a,id){var n=0,rows=sortedCountRows(a.subjects),i;for(i=0;i<rows.length;i++)if(majorOfSubject(rows[i].key)===id)n+=rows[i].count;return n;}
function globalChildCountFromAggregate(a,child,majorId){var n=0,rows=sortedCountRows(a.subjects),i;
 for(i=0;i<rows.length;i++)if(majorOfSubject(rows[i].key)===majorId&&childMatchesSubject(rows[i].key,child))n+=rows[i].count;
 /* Global banks often store "Internal Medicine" as Subject and the subspecialty in Topic. */
 if(majorId==='medicine'){
  var subjectMatch=0;
  for(i=0;i<rows.length;i++)if(majorOfSubject(rows[i].key)===majorId&&childMatchesSubject(rows[i].key,child))subjectMatch+=rows[i].count;
  if(subjectMatch===0){var tr=sortedCountRows(a.topics);for(i=0;i<tr.length;i++)if(childMatchesSubject(tr[i].key,child))n+=tr[i].count;}
 }
 return n;
}
function globalSectionsHtmlFromAggregate(a){var h='',i,j,m,sc;
 for(i=0;i<MAJOR_SECTIONS.length;i++){
  m=MAJOR_SECTIONS[i];var count=globalMajorCountFromAggregate(a,m.id);if(!count)continue;
  h+='<section class="major-card" data-major="'+esc(m.id)+'"><div class="major-head"><div class="major-icon">'+m.icon+'</div><div class="major-title"><b>'+esc(m.en)+'</b><small>Global Question Banks</small></div><span class="major-count">'+count.toLocaleString()+' Q</span></div><div class="sub-grid">';
  for(j=0;j<m.children.length;j++){sc=globalChildCountFromAggregate(a,m.children[j],m.id);h+='<button class="sub-card'+(sc?'':' empty-sub')+'" data-subject="'+esc(m.children[j])+'" data-count="'+sc+'"><span class="sub-emoji">'+iconFor(m.children[j])+'</span><span><b>'+esc(m.children[j])+'</b><small>'+sc.toLocaleString()+' questions</small></span><i>›</i></button>';}
  h+='</div></section>';
 }
 if(!h)h='<div class="empty-card">No categorized Global Question Bank data found yet. Import a Global Question Bank JSON to populate the Dashboard.</div>';
 return h;
}
function renderGlobalDashboardFromAggregate(a){
 var total=a.total||0,sections=0,i;
 var heroTitle=document.querySelector('.hero h1'),heroText=document.querySelector('.hero-copy p'),heroEyebrow=document.querySelector('.hero-copy .eyebrow');
 if(heroTitle)heroTitle.innerHTML='Explore global banks.<br>Practice smarter.';
 if(heroText)heroText.textContent='Explore international question banks, discover high-yield specialties, and train across every imported global exam.';
 if(heroEyebrow)heroEyebrow.textContent='🌍 Global Question Bank Intelligence';
 for(i=0;i<MAJOR_SECTIONS.length;i++)if(globalMajorCountFromAggregate(a,MAJOR_SECTIONS[i].id)>0)sections++;
 var banks=countMapKeys(a.banks),exams=countMapKeys(a.exams),attempts=state.attempts||[],correct=0,matched=0;
 /* Accuracy is intentionally calculated from attempts whose question IDs belong to Global DB. */
 var subjectIds={};for(var sk in a.subjects)subjectIds[sk]=1;
 /* Do not count every attempt by cache here; only attempts can be mapped precisely after fetching IDs. Keep legacy accuracy if available. */
 var acc=0;
 if(window.MQIStore && window.MQIStore.query){window.MQIStore.query({}, {limit:0,offset:0,mode:'global'}).then(function(){ /* count is represented by total; detailed accuracy remains in Analytics */ }).catch(function(){});}
 var ov=document.getElementById('dashboardOverviewTitle'),os=document.getElementById('dashboardOverviewSubtitle'),ms=document.getElementById('medicalSectionsTitle'),mss=document.getElementById('medicalSectionsSubtitle');
 if(ov)ov.textContent='Global Question Banks Overview';if(os)os.textContent='All imported global banks, exams and questions at a glance';if(ms)ms.textContent='Global Medical Sections';if(mss)mss.textContent='Explore every specialty represented across your global question banks';
 $('stats').innerHTML='<div class="stat"><div class="emoji">📚</div><b>'+banks.toLocaleString()+'</b><small>Question Banks</small></div><div class="stat"><div class="emoji">❓</div><b>'+total.toLocaleString()+'</b><small>Questions</small></div><div class="stat"><div class="emoji">🗂️</div><b>'+sections+'</b><small>Medical Sections</small></div><div class="stat"><div class="emoji">📝</div><b>'+exams.toLocaleString()+'</b><small>Exams / Models</small></div>';
 $('dbStatus').textContent=total.toLocaleString()+' questions across '+banks.toLocaleString()+' Global Question Banks';
 var selector=document.getElementById('examSelector');if(selector){selector.innerHTML=examSelectorHtml();bindExamSelector();updateExamSelector();}
 $('subjectGrid').innerHTML=globalSectionsHtmlFromAggregate(a);bindSectionCards();
}

function countExams(){var map={},i,k,arr=filteredDb('none');for(i=0;i<arr.length;i++){k=(arr[i].exactDate||arr[i].exam||arr[i].year||'Unknown')+'|'+(arr[i].governorate||'')+'|'+(arr[i].profession||'')+'|'+(arr[i].exam||'');map[k]=1;}return Object.keys(map).length;}
function repeatedCount(){var seen={},n=0,i,k,arr=filteredDb('none');for(i=0;i<arr.length;i++){k=signature(arr[i]);if(k){if(seen[k])n++;else seen[k]=1;}}return n;}
function selectHtml(id,label,values){var h='<label>'+esc(label)+'<select class="select" id="'+id+'"><option value="">All</option>';var i;for(i=0;i<values.length;i++)h+='<option value="'+esc(values[i])+'">'+esc(values[i])+'</option>';return h+'</select></label>';}
function uniqueValues(field){return uniqueValuesFrom(filteredDb('none'),field);}
function practiceIsBroadSubject(q){
 var s=text(q&&q.subject).trim().toLowerCase(),sp=text(q&&q.specialty).trim().toLowerCase();
 if(!s)return true;
 if(sp&&s===sp)return true;
 return /^(general |internal medicine$|general internal medicine$|general medicine$|general medicine & surgery$|general surgery$|general pediatrics$|general psychiatry$|general dermatology$|general ophthalmology$)/i.test(s);
}
function practiceTopicOf(q){
 var s=text(q&&q.subject).trim(),t=text(q&&q.topic).trim();
 return (t&&practiceIsBroadSubject(q))?t:(s||t||'Uncategorized');
}
function practiceSubjectOf(q){
 var s=text(q&&q.subject).trim(),t=text(q&&q.topic).trim(),tags=Array.isArray(q&&q.tags)?q.tags:[];
 if(t&&practiceIsBroadSubject(q)){
  for(var i=0;i<tags.length;i++){
   var tag=text(tags[i]).trim();
   if(!tag||tag.toLowerCase()===t.toLowerCase()||tag.toLowerCase()===s.toLowerCase())continue;
   if(text(q.specialty).trim().toLowerCase()===tag.toLowerCase())continue;
   return tag;
  }
 }
 return t||'Uncategorized';
}
function practiceTopicValues(rows){var m={},a=[],i,v;for(i=0;i<rows.length;i++){v=practiceTopicOf(rows[i]);if(v&&!m[v]){m[v]=1;a.push(v);}}a.sort();return a;}
function practiceSubjectValues(rows,topic){var m={},a=[],i,v;for(i=0;i<rows.length;i++){if(topic&&practiceTopicOf(rows[i])!==topic)continue;v=practiceSubjectOf(rows[i]);if(v&&!m[v]){m[v]=1;a.push(v);}}a.sort();return a;}
function practiceRowsForMajor(major){
 var base=filteredDb('none'),out=[],i,q;
 for(i=0;i<base.length;i++){q=base[i];if(major&&majorOfSubject(q.subject||'')!==major)continue;out.push(q);}
 return out;
}
function practiceUnique(rows,field){return uniqueValuesFrom(rows,field);}
function renderPracticeSetup(){
  var majors=[],i,m;
  for(i=0;i<MAJOR_SECTIONS.length;i++)if(countMajor(MAJOR_SECTIONS[i].id)>0)majors.push(MAJOR_SECTIONS[i]);
  var h='<div class="section-picker"><div class="section-picker-title">🗂️ Choose a Major Section</div><div class="major-pills" id="majorPills">';
  h+='<button class="major-pill active" data-major="">All Sections</button>';
  for(i=0;i<majors.length;i++){m=majors[i];h+='<button class="major-pill" data-major="'+m.id+'">'+m.icon+' '+esc(m.en)+'</button>';}
  h+='</div></div><div class="filter-row"'
    +selectHtml('pfSpecialty','Sub-specialty',[])
    +selectHtml('pfTopic','Topic',[])
    +selectHtml('pfSubject','Subject',[])
    +selectHtml('pfGov','Governorate',uniqueValues('governorate'))
    +selectHtml('pfYear','Exam Year',uniqueValues('year'))
    +selectHtml('pfDate','Exam Date',uniqueValues('exactDate'))
    +'</div><div class="actions"><button class="btn primary" id="startPractice">▶ Start Practice</button></div>';
  $('practiceFilters').innerHTML=h;$('practiceCard').innerHTML='<div class="empty">Choose a major section, sub-specialty, topic and/or subject, then start practice.</div>';
  var pills=document.querySelectorAll('.major-pill'),j;
  for(j=0;j<pills.length;j++)pills[j].onclick=function(){var all=document.querySelectorAll('.major-pill'),k;for(k=0;k<all.length;k++)all[k].classList.remove('active');this.classList.add('active');updatePracticeSpecialties(this.getAttribute('data-major')||'');};
  $('pfSpecialty').onchange=function(){updatePracticeTopics();};
  $('pfTopic').onchange=function(){updatePracticeSubjects();};
  $('startPractice').onclick=function(){startPractice();};
  updatePracticeSpecialties('');
}
function updatePracticeSpecialties(major){
 var rows=practiceRowsForMajor(major||''),sel=$('pfSpecialty'),vals=practiceUnique(rows,'specialty'),h='<option value="">All sub-specialties</option>',i;
 for(i=0;i<vals.length;i++)h+='<option value="'+esc(vals[i])+'">'+esc(vals[i])+'</option>';
 sel.innerHTML=h;sel.value='';updatePracticeTopics();
}
function updatePracticeTopics(){
 var active=document.querySelector('.major-pill.active'),major=active?active.getAttribute('data-major'):'',specialty=$('pfSpecialty').value,rows=practiceRowsForMajor(major),out=[],i,q;
 for(i=0;i<rows.length;i++){q=rows[i];if(specialty&&text(q.specialty)!==text(specialty))continue;out.push(q);}
 var sel=$('pfTopic'),vals=practiceTopicValues(out),h='<option value="">All topics</option>';
 for(i=0;i<vals.length;i++)h+='<option value="'+esc(vals[i])+'">'+esc(vals[i])+'</option>';
 sel.innerHTML=h;sel.value='';updatePracticeSubjects();
}
function updatePracticeSubjects(){
 var active=document.querySelector('.major-pill.active'),major=active?active.getAttribute('data-major'):'',specialty=$('pfSpecialty').value,topic=$('pfTopic').value,rows=practiceRowsForMajor(major),out=[],i,q;
 for(i=0;i<rows.length;i++){q=rows[i];if(specialty&&text(q.specialty)!==text(specialty))continue;if(topic&&practiceTopicOf(q)!==topic)continue;out.push(q);}
 var sel=$('pfSubject'),vals=practiceSubjectValues(out,topic),h='<option value="">All subjects</option>';
 for(i=0;i<vals.length;i++)h+='<option value="'+esc(vals[i])+'">'+esc(vals[i])+'</option>';
 sel.innerHTML=h;sel.value='';
}
function setPracticeSubject(s){
 renderPracticeSetup();var major=majorOfSubject(s),pills=document.querySelectorAll('.major-pill'),i;
 for(i=0;i<pills.length;i++){if(pills[i].getAttribute('data-major')===major)pills[i].classList.add('active');else pills[i].classList.remove('active');}
 updatePracticeSpecialties(major);
 if($('pfTopic')){$('pfTopic').value=text(s);updatePracticeSubjects();}
 startPractice();
}
function startPractice(){
 var specialty=$('pfSpecialty').value,subject=$('pfSubject').value,topic=$('pfTopic').value,gov=$('pfGov').value,yr=$('pfYear').value,dt=$('pfDate').value,active=document.querySelector('.major-pill.active'),major=active?active.getAttribute('data-major'):'',i,q;
 practicePool=[];var base=filteredDb('none');
 for(i=0;i<base.length;i++){
  q=base[i];
  if(!questionBelongsToSelectedDatabase(q))continue;
  if(major&&majorOfSubject(q.subject||'')!==major)continue;
  if(specialty&&text(q.specialty)!==text(specialty))continue;
  if(topic&&practiceTopicOf(q)!==topic)continue;
  if(subject&&practiceSubjectOf(q)!==subject)continue;
  if(gov&&text(q.governorate)!==gov)continue;
  if(yr&&text(q.year)!==yr)continue;
  if(dt&&text(q.exactDate)!==dt)continue;
  practicePool.push(q);
 }
 practiceIndex=0;practiceAnswered=false;if(!practicePool.length){toast('No questions match the selected filters');return;}renderPracticeQuestion();
}
function renderPracticeQuestion(){var q=practicePool[practiceIndex],opts=q.originalOptions||{},keys=Object.keys(opts),h='<div class="q-top"><span>Question '+(practiceIndex+1)+' / '+practicePool.length+'</span><button class="save" id="saveQ">'+(state.saved.indexOf(q.id)>=0?'★ Saved':'☆ Save')+'</button></div><div class="q-text">'+esc(q.originalQuestion)+'</div><div id="options">';var i;for(i=0;i<keys.length;i++){var k=keys[i],v=opts[k];if(!text(v).trim())continue;h+='<button class="option" data-key="'+esc(k)+'"><span class="letter">'+esc(k)+'</span><span>'+esc(v)+'</span></button>';}h+='</div><div id="feedback"></div><div class="actions"><button class="btn" id="prevQ">← Previous</button><button class="btn primary" id="nextQ">Next Question →</button></div>';$('practiceCard').innerHTML=h;$('saveQ').onclick=function(){toggleSave(q.id);};var os=document.querySelectorAll('#options .option'),j;for(j=0;j<os.length;j++)os[j].onclick=function(){choosePractice(q,this.getAttribute('data-key'),this);};$('prevQ').onclick=function(){if(practiceIndex>0){practiceIndex--;practiceAnswered=false;renderPracticeQuestion();}};$('nextQ').onclick=function(){if(practiceIndex<practicePool.length-1){practiceIndex++;practiceAnswered=false;renderPracticeQuestion();}else{toast('Practice set complete');}};}
function choosePractice(q,key,btn){if(practiceAnswered)return;practiceAnswered=true;var ok=isCorrect(q,key),opts=document.querySelectorAll('#options .option'),i;for(i=0;i<opts.length;i++){opts[i].classList.add('disabled');var k=opts[i].getAttribute('data-key');if(isCorrect(q,k))opts[i].classList.add('correct');if(k===key&&!ok)opts[i].classList.add('wrong');}state.attempts.push({questionId:q.id,selected:key,correct:ok,time:new Date().toISOString(),mode:'practice'});saveState();beep(ok);if(ok)celebrate('correct','Correct Answer!');var f='<div class="explanation"><b>'+(ok?'✅ Correct':'❌ Incorrect')+'</b>';if(q.explanation)f+='<br>'+esc(q.explanation);if(q.whyNotB)f+='<br><b>Why not B?</b> '+esc(q.whyNotB);if(q.whyNotC)f+='<br><b>Why not C?</b> '+esc(q.whyNotC);if(q.whyNotD)f+='<br><b>Why not D?</b> '+esc(q.whyNotD);f+='</div>';$('feedback').innerHTML=f;renderHome();var fb0=$('feedback');if(fb0&&window.MQIStore&&window.MQIStore.crossMatches){var mb=document.createElement('button');mb.className='wide-btn';mb.textContent='🌐 Find Exact & Similar Questions Across All Databases';mb.style.marginTop='10px';mb.onclick=function(){mb.disabled=true;mb.textContent='🔎 Searching all databases…';window.MQIStore.crossMatches(q.id,8).then(function(m){var box=document.createElement('div');box.className='explanation cross-db-match';var hh='<b>🌐 Cross-Database Question Intelligence</b>';hh+='<p><b>Exact matches:</b> '+m.exact.length+'</p>';if(m.exact.length){hh+='<div class="cross-match-list">';for(var ci=0;ci<m.exact.length;ci++){hh+='<div><small>EXACT · '+esc(m.exact[ci].databaseType==='global'?'Global':'Licensure')+'</small><br>'+esc(m.exact[ci].originalQuestion)+'</div>';}hh+='</div>';}hh+='<p><b>Similar question/topic matches:</b> '+m.similar.length+'</p>';if(m.similar.length){hh+='<div class="cross-match-list">';for(var si=0;si<m.similar.length;si++){hh+='<div><small>SIMILAR · '+Math.round(m.similar[si].score*100)+'% · '+esc(m.similar[si].q.databaseType==='global'?'Global':'Licensure')+'</small><br>'+esc(m.similar[si].q.originalQuestion)+'</div>';}hh+='</div>';}hh+='<small>Level 1 = exact repetition. Level 2 = similar wording/topic. Medical correctness is not inferred from similarity.</small>';box.innerHTML=hh;fb0.appendChild(box);mb.remove();}).catch(function(){mb.disabled=false;mb.textContent='🌐 Retry Cross-Database Search';});};fb0.appendChild(mb);} }
function toggleSave(id){var i=state.saved.indexOf(id);if(i>=0)state.saved.splice(i,1);else state.saved.push(id);saveState();renderPracticeQuestion();}
function mockUnique(field){
 var a=[],m={},i,v,source=filteredDb('none');
 for(i=0;i<source.length;i++){v=text(source[i][field]||'').trim();if(v&&!m[v]){m[v]=1;a.push(v);}}
 a.sort();return a;
}
function mockSelect(id,label,values,allLabel){
 var h='<label>'+esc(label)+'<select id="'+id+'" class="select"><option value="">'+esc(allLabel||'All')+'</option>',i;
 for(i=0;i<values.length;i++)h+='<option value="'+esc(values[i])+'">'+esc(values[i])+'</option>';
 return h+'</select></label>';
}
function renderMockSetup(){
 var setup=$('mockSetup'),run=$('mockRun');
 if(!setup)return;
 if(run)run.className='panel hidden';
 setup.className='panel';
 var h='';
 h+='<div class="mock-builder">';
 h+='<div class="mock-mode-head"><div><span class="page-kicker">⏱️ Exam Simulation</span><h2>Build Your Mock Exam</h2><p>Choose an intelligent adaptive exam or build a focused exam yourself.</p></div></div>';
 h+='<div class="mock-mode-grid">';
 h+='<button type="button" class="mock-mode active" data-mode="adaptive"><span>🧠</span><b>Smart Adaptive Exam</b><small>Prioritizes weak areas, repeated questions and unseen topics.</small></button>';
 h+='<button type="button" class="mock-mode" data-mode="custom"><span>🎯</span><b>Custom Exam</b><small>Choose sub-specialty, topic, governorate, year and date.</small></button>';
 h+='</div>';
 h+='<div class="mock-filters-title"><b>Exam Filters</b><small>All is selected by default</small></div>';
 h+='<div class="filter-row mock-filter-row">';
 h+=mockSelect('mockSubject','Sub-specialty',mockUnique('subject'),'All Sub-specialties');
 h+=mockSelect('mockTopic','Topic',mockUnique('topic'),'All Topics');
 h+=mockSelect('mockGov','Governorate',mockUnique('governorate'),'All Governorates');
 h+=mockSelect('mockYear','Exam Year',mockUnique('year'),'All Years');
 h+=mockSelect('mockDate','Exam Date',mockUnique('exactDate'),'All Exam Dates');
 h+='</div>';
 h+='<div class="mock-config-grid">';
 h+='<label>Questions<input id="mockCount" class="select" type="number" min="1" max="100" value="20"></label>';
 h+='<div><span class="mock-label">Time Limit</span><div class="time-mode-grid"><button type="button" class="time-mode active" data-time="timed">⏱️ Timed</button><button type="button" class="time-mode" data-time="unlimited">♾️ Unlimited</button></div></div>';
 h+='<label id="mockMinutesWrap">Minutes<input id="mockMinutes" class="select" type="number" min="1" max="180" value="30"></label>';
 h+='</div>';
 h+='<div id="mockSmartNote" class="smart-mock-note">🧠 <b>Smart mode:</b> the exam will prioritize questions from your weak areas while preserving coverage of other sections.</div>';
 h+='<div id="mockPoolSummary" class="mock-pool-summary"></div>';
 h+='<div class="actions"><button type="button" class="btn primary" id="beginMock">▶ Begin Mock Exam</button><button type="button" class="btn" id="resetMockFilters">↺ Reset</button></div>';
 h+='</div>';
 setup.innerHTML=h;
 var mode='adaptive',timeMode='timed';
 function refreshPoolSummary(){
   var sub=$('mockSubject').value,top=$('mockTopic').value,gov=$('mockGov').value,yr=$('mockYear').value,dt=$('mockDate').value;
   var n=0,i,q;
   var source=(privateMockContext&&Array.isArray(privateMockContext.questions))?privateMockContext.questions:filteredDb('none');for(i=0;i<source.length;i++){q=source[i];if(!(privateMockContext&&Array.isArray(privateMockContext.questions))&&!questionBelongsToSelectedDatabase(q))continue;if(sub&&q.subject!==sub)continue;if(top&&q.topic!==top)continue;if(gov&&text(q.governorate)!==gov)continue;if(yr&&text(q.year)!==yr)continue;if(dt&&text(q.exactDate)!==dt)continue;n++;}
   var el=$('mockPoolSummary');if(el)el.innerHTML='<span>📚 Available questions</span><b>'+n+'</b>'+(mode==='adaptive'?' <small>Smart ranking enabled</small>':'');
 }
 var modes=document.querySelectorAll('.mock-mode'),i;
 for(i=0;i<modes.length;i++)modes[i].onclick=function(){var all=document.querySelectorAll('.mock-mode'),j;for(j=0;j<all.length;j++)all[j].classList.remove('active');this.classList.add('active');mode=this.getAttribute('data-mode')||'adaptive';var note=$('mockSmartNote');if(note)note.style.display=mode==='adaptive'?'block':'none';refreshPoolSummary();};
 var times=document.querySelectorAll('.time-mode');
 for(i=0;i<times.length;i++)times[i].onclick=function(){var all=document.querySelectorAll('.time-mode'),j;for(j=0;j<all.length;j++)all[j].classList.remove('active');this.classList.add('active');timeMode=this.getAttribute('data-time')||'timed';var w=$('mockMinutesWrap');if(w)w.style.display=timeMode==='unlimited'?'none':'block';};
 var sels=document.querySelectorAll('#mockSetup select'),j;for(j=0;j<sels.length;j++)sels[j].onchange=refreshPoolSummary;
 $('beginMock').onclick=function(){startMock(mode,timeMode);};
 $('resetMockFilters').onclick=function(){var ids=['mockSubject','mockTopic','mockGov','mockYear','mockDate'];for(var z=0;z<ids.length;z++)if($(ids[z]))$(ids[z]).value='';if($('mockCount'))$('mockCount').value=20;if($('mockMinutes'))$('mockMinutes').value=30;refreshPoolSummary();};
 refreshPoolSummary();
}
function renderPrivateExamSetup(){
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

function mockQuestionScore(q){
 var at=state.attempts||[],total=0,wrong=0,i;
 for(i=0;i<at.length;i++)if(at[i].questionId===q.id){total++;if(!at[i].correct)wrong++;}
 var weak=total?wrong/total:0.35;
 var freq=Math.min(total/5,1)*0.20;
 var unseen=total?0:0.18;
 return weak*0.62+freq+unseen+Math.random()*0.08;
}
function startMock(mode,timeMode){
 var countEl=$('mockCount'),minEl=$('mockMinutes');
 var n=Math.max(1,Math.min(100,parseInt(countEl&&countEl.value,10)||20));
 var m=Math.max(1,Math.min(180,parseInt(minEl&&minEl.value,10)||30));
 var sub=($('mockSubject')&&$('mockSubject').value)||'',top=($('mockTopic')&&$('mockTopic').value)||'',gov=($('mockGov')&&$('mockGov').value)||'',yr=($('mockYear')&&$('mockYear').value)||'',dt=($('mockDate')&&$('mockDate').value)||'';
 var pool=[],i,q;
 var source=filteredDb('none');for(i=0;i<source.length;i++){q=source[i];if(sub&&q.subject!==sub)continue;if(top&&q.topic!==top)continue;if(gov&&text(q.governorate)!==gov)continue;if(yr&&text(q.year)!==yr)continue;if(dt&&text(q.exactDate)!==dt)continue;pool.push(q);}
 if(!pool.length){toast('No questions match the selected filters. Choose All or add an exam JSON.');return;}
 if(mode==='adaptive')pool.sort(function(a,b){return mockQuestionScore(b)-mockQuestionScore(a);});
 else {for(i=pool.length-1;i>0;i--){var r=Math.floor(Math.random()*(i+1)),tmp=pool[i];pool[i]=pool[r];pool[r]=tmp;}}
 pool=pool.slice(0,Math.min(n,pool.length));
 mock={pool:pool,index:0,answers:{},seconds:timeMode==='unlimited'?-1:m*60,mode:mode,timeMode:timeMode};
 if($('mockSetup'))$('mockSetup').className='panel hidden';if($('mockRun'))$('mockRun').className='panel';
 renderMockQuestion();clearInterval(timer);timer=null;if(timeMode!=='unlimited'){timer=setInterval(function(){if(!mock)return;mock.seconds--;if(mock.seconds<=0){mock.seconds=0;renderMockTimer();finishMock();return;}renderMockTimer();},1000);}
}
function renderMockTimer(){
 var el=$('mockTimer');if(!el||!mock)return;
 if(mock.seconds<0){el.textContent='♾️ Unlimited';el.className='timer unlimited';return;}
 var sec=Math.max(0,parseInt(mock.seconds,10)||0),min=Math.floor(sec/60),s=sec%60;
 el.textContent='⏱️ '+(min<10?'0':'')+min+':'+(s<10?'0':'')+s;
 el.className='timer '+(sec<=60?'danger':sec<=300?'warning':'');
}
function renderMockQuestion(){
 var q=mock.pool[mock.index],opts=q.originalOptions||{},keys=Object.keys(opts),selected=mock.answers[q.id]||'',answered=!!selected;
 var h='<div class="q-top"><span>Question '+(mock.index+1)+' / '+mock.pool.length+'</span><span class="timer" id="mockTimer"></span></div>';
 h+=mockLiveScoreHtml();
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
 var ok=isCorrect(q,key),opts=q.originalOptions||{},correctLetters=answerLetters(q.correctAnswer),correctLetter=correctLetters[0]||'';
 var correctText='';
 if(correctLetter&&opts[correctLetter])correctText=opts[correctLetter];
 else if(q.correctAnswer&&typeof q.correctAnswer==='object')correctText=text(q.correctAnswer.text||'');
 else correctText=text(q.correctAnswer||'');
 if(!correctLetter){var ks=Object.keys(opts),i;for(i=0;i<ks.length;i++)if(isCorrect(q,ks[i])){correctLetter=ks[i];correctText=opts[ks[i]];break;}}
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
 if(ok)celebrate('correct','Correct Answer!');
 try{if(navigator.vibrate)navigator.vibrate(ok?[35,25,35]:[70]);}catch(e){}
 document.body.classList.remove('answer-correct-pulse','answer-wrong-shake');
 void document.body.offsetWidth;
 document.body.classList.add(ok?'answer-correct-pulse':'answer-wrong-shake');
 setTimeout(function(){document.body.classList.remove('answer-correct-pulse','answer-wrong-shake');},450);
 renderMockQuestion();
}
function finishMock(){
 if(!mock)return;
 var createdContext=mock.mode==='created'?{title:mock.title||'Private Exam',teacherName:mock.teacherName||'',teacherPhone:mock.teacherPhone||'',createdExamId:mock.createdExamId||'',pool:mock.pool}:null;
 var createdAnswers=mock.answers||{};
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
 var wrongCount=0,unansweredCount=0,wc,wk;
 for(wc=0;wc<mock.pool.length;wc++){wk=mock.answers[mock.pool[wc].id]||'';if(!wk)unansweredCount++;else if(!isCorrect(mock.pool[wc],wk))wrongCount++;}
 h+='<div class="mock-result-hero"><div class="result-trophy">🏆</div><span class="page-kicker">Mock Exam Result</span><div class="score-over-100">'+p+'<small>/100</small></div><h2>'+score+' / '+mock.pool.length+'</h2><p>Accuracy: <b>'+p+'%</b></p><div class="bar"><i style="width:'+p+'%"></i></div><div class="result-count-grid"><div><span>✅</span><b>'+score+'</b><small>Correct</small></div><div><span>❌</span><b>'+wrongCount+'</b><small>Wrong</small></div><div><span>📚</span><b>'+mock.pool.length+'</b><small>Total</small></div>'+(unansweredCount?'<div><span>⏳</span><b>'+unansweredCount+'</b><small>Unanswered</small></div>':'')+'</div><div class="result-status">'+(p>=85?'🎉 Excellent performance':p>=70?'👍 Good progress':p>=60?'📚 Keep reviewing your weak areas':'⚠️ Focus on mistakes and high-priority topics')+'</div></div>';
 h+='<div class="mock-result-actions"><button class="btn primary" id="againMock">New Mock Exam</button><button class="btn" id="goIntel">🧠 Intelligence</button>'+(createdContext?'<button class="btn whatsapp-result-btn" id="sendCreatedWhatsApp">📱 Send Answers to Teacher WhatsApp</button>':'')+'</div>';
 h+='<div class="mock-review-head"><h3>📝 Question-by-Question Review</h3><p>Correct answer, your answer, and full correction.</p></div>';
 for(i=0;i<mock.pool.length;i++){
  q=mock.pool[i];k=mock.answers[q.id]||'';var ok2=isCorrect(q,k),opts=q.originalOptions||{},ks=Object.keys(opts),cl='mock-review-card '+(ok2?'review-correct':'review-wrong');
  var caLetters=answerLetters(q.correctAnswer),ca=caLetters[0]||'',ct=ca&&opts[ca]?opts[ca]:'';
  if(!ct&&q.correctAnswer&&typeof q.correctAnswer==='object')ct=text(q.correctAnswer.text||'');
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
 var waBtn=$('sendCreatedWhatsApp');if(waBtn)waBtn.onclick=function(){sendCreatedResultWhatsApp(createdContext,score,createdContext&&createdContext.pool?createdContext.pool.length:0,p,createdAnswers);};
 if(p>=60)celebrate('success',p>=85?'🎉 Outstanding — Exam Ready!':p>=70?'🎊 Great Job — Keep Going!':'🎉 Passed — Keep Building!');
 mock=null;renderHome();
}
function activeStoreFilters(){
 var f={};
 if(appMode==='global' && globalBank)f.bankName=globalBank;
 if(appMode==='global' && examFilters.specialty)f.specialty=examFilters.specialty;
 if(appMode!=='global' && examFilters.profession){
   var pp=professionById(examFilters.profession),aliases=[pp.label].concat(pp.aliases||[]);
   f.profession=aliases;
 }
 if(appMode!=='global' && examFilters.qualification)f.qualification=examFilters.qualification;
 if(examFilters.country)f.country=examFilters.country;
 if(examFilters.year)f.year=examFilters.year;
 if(examFilters.exactDate)f.exactDate=examFilters.exactDate;
 if(examFilters.governorate)f.governorate=examFilters.governorate;
 return f;
}
function saveSearchScope(){try{localStorage.setItem('ymlq_search_scope',searchScope.mode);localStorage.setItem('ymlq_search_global_banks',JSON.stringify(searchScope.globalBanks||[]));localStorage.setItem('ymlq_search_licensure_exams',JSON.stringify(searchScope.licensureExams||[]));}catch(e){}}
function searchScopeLabel(){var m=searchScope.mode;if(m==='all')return 'All Databases';if(m==='licensure')return 'Professional Licensure';if(m==='global')return 'Global Question Banks';if(m==='custom')return 'Selected Sources';return 'Current Selection';}
function bankSearchPlan(){
 var base={filters:{},mode:''};
 if(searchScope.mode==='current'){base.mode=appMode;base.filters=activeStoreFilters();return base;}
 if(searchScope.mode==='licensure'){base.mode='licensure';return base;}
 if(searchScope.mode==='global'){base.mode='global';return base;}
 if(searchScope.mode==='all'){base.mode='';return base;}
 /* Custom source selection: OR across selected global banks and licensure exams. */
 base.mode='';base.sourceScope={globalBanks:(searchScope.globalBanks||[]).slice(),licensureExams:(searchScope.licensureExams||[]).slice()};return base;
}
function bindMultiSelect(id,key){var el=$(id);if(!el)return;el.onchange=function(){var vals=[];for(var i=0;i<el.options.length;i++)if(el.options[i].selected)vals.push(el.options[i].value);searchScope[key]=vals;saveSearchScope();};}
function renderSearchScopeSettings(){
 var host=$('searchScopeSettings');if(!host||!window.MQIStore)return;
 host.innerHTML='<div class="panel"><h3>🔎 Search & Analysis Scope</h3><p class="settings-note">Choose whether Question Bank search and related question discovery use only your current selection or expand across Professional Licensure and Global Question Banks.</p><label class="profile-field"><span>Search scope</span><select id="searchScopeMode" class="select"><option value="current">Current Selection</option><option value="all">All Databases</option><option value="licensure">Professional Licensure</option><option value="global">Global Question Banks</option><option value="custom">Selected Sources</option></select></label><div id="customSearchSources"></div><div class="profile-summary"><span>🔎 '+esc(searchScopeLabel())+'</span></div></div>';
 var mode=$('searchScopeMode');if(mode){mode.value=searchScope.mode;mode.onchange=function(){searchScope.mode=this.value;saveSearchScope();renderSearchScopeSettings();if(currentScreen==='bank')renderBank();};}
 if(searchScope.mode==='custom'){
   Promise.all([window.MQIStore.distinct('bankName',{},'global'),window.MQIStore.distinct('questionBank',{},'global'),window.MQIStore.distinct('examTitle',{},'licensure')]).then(function(v){
    var banks=[],seen={};(v[0]||[]).concat(v[1]||[]).forEach(function(x){x=text(x).trim();if(x&&!seen[x]){seen[x]=1;banks.push(x);}});banks.sort();var exams=(v[2]||[]).filter(function(x){return text(x).trim();});
    var h='<div class="profile-fields"><label class="profile-field"><span>Global Question Banks</span><select id="scopeGlobalBanks" class="select" multiple size="6">';for(var i=0;i<banks.length;i++)h+='<option value="'+esc(banks[i])+'"'+(searchScope.globalBanks.indexOf(banks[i])>=0?' selected':'')+'>'+esc(banks[i])+'</option>';h+='</select></label><label class="profile-field"><span>Professional Licensure Exams</span><select id="scopeLicensureExams" class="select" multiple size="6">';for(i=0;i<exams.length;i++)h+='<option value="'+esc(exams[i])+'"'+(searchScope.licensureExams.indexOf(exams[i])>=0?' selected':'')+'>'+esc(exams[i])+'</option>';h+='</select></label></div><p class="settings-note">Hold/select multiple items. If both lists are selected, search includes both groups.</p>';
    $('customSearchSources').innerHTML=h;bindMultiSelect('scopeGlobalBanks','globalBanks');bindMultiSelect('scopeLicensureExams','licensureExams');
   }).catch(function(){$('customSearchSources').innerHTML='<div class="empty-card">Could not load available banks and licensure exams.</div>';});
 }
}
function renderBank(){
 var token=++bankQueryToken,search=text($('bankSearch')&&$('bankSearch').value).trim(),head=$('bankModeFilters'),plan=bankSearchPlan();
 if(head){head.innerHTML='<div class="mode-banner">🔎 Search Scope: <b>'+esc(searchScopeLabel())+'</b> · Loading filters…</div>';
  if(window.MQIStore){
   var mode=plan.mode||'';
   Promise.all([window.MQIStore.distinct('bankName',{},mode),window.MQIStore.distinct('country',{},mode),window.MQIStore.distinct('specialty',{},mode),window.MQIStore.distinct('year',{},mode)]).then(function(vals){
    if(token!==bankQueryToken)return;var banks=vals[0],countries=vals[1],specs=vals[2],years=vals[3],html='<div class="filter-row">';
    if(mode===''||mode==='global')html+=selectHtml('globalBankSelect','Question Bank',banks);
    html+=selectHtml('globalCountrySelect','Country',countries)+selectHtml('globalSpecialtySelect','Specialty',specs)+selectHtml('globalYearSelect','Year',years)+'</div>';
    head.innerHTML=html;
    var bs=$('globalBankSelect');if(bs){bs.value=(searchScope.mode==='current'&&appMode==='global'?globalBank:'');bs.onchange=function(){globalBank=this.value;bankPage=0;renderBank();};}
    var gc=$('globalCountrySelect');if(gc){gc.value=(searchScope.mode==='current'?examFilters.country:'');gc.onchange=function(){examFilters.country=this.value;persistExamFilters();bankPage=0;renderBank();};}
    var gs=$('globalSpecialtySelect');if(gs){gs.value=(searchScope.mode==='current'?examFilters.specialty:'');gs.onchange=function(){examFilters.specialty=this.value;persistExamFilters();bankPage=0;renderBank();};}
    var gy=$('globalYearSelect');if(gy){gy.value=(searchScope.mode==='current'?examFilters.year:'');gy.onchange=function(){examFilters.year=this.value;persistExamFilters();bankPage=0;renderBank();};}
   }).catch(function(){head.innerHTML='<div class="mode-banner">Database filters unavailable.</div>';});
  }
 }
 if(!window.MQIStore){$('bankList').innerHTML='<div class="empty">IndexedDB is unavailable.</div>';return;}
 var filters=plan.filters||{};
 window.MQIStore.query(filters,{mode:plan.mode,sourceScope:plan.sourceScope,search:search,offset:bankPage*bankPageSize,limit:bankPageSize}).then(function(result){
  if(token!==bankQueryToken)return;var rows=result.rows||[],total=result.total||0,h='',i,s;
  for(i=0;i<rows.length;i++){s=rows[i];h+='<button class="bank-item" data-id="'+esc(s.id)+'"><b>'+esc(s.originalQuestion)+'</b><small>'+esc(s.databaseType==='global'?'🌍 Global':'🪪 Licensure')+' · '+esc(s.questionBank||s.bankName||s.examTitle||'')+' · '+esc(subjectName(s.subject))+' • '+esc(s.topic||'')+' • '+esc(s.year||'')+'</small></button>';}
  var pages=Math.max(1,Math.ceil(total/bankPageSize));$('bankCount').textContent=total.toLocaleString()+' questions matched · '+searchScopeLabel()+' · Page '+(Math.min(bankPage+1,pages))+' of '+pages;
  h+='<div class="bank-pagination"><button class="small-btn" id="bankPrev" '+(bankPage<=0?'disabled':'')+'>← Previous</button><span>Showing '+(total?((bankPage*bankPageSize)+1):0)+'–'+Math.min((bankPage+1)*bankPageSize,total)+' of '+total.toLocaleString()+'</span><button class="small-btn" id="bankNext" '+((bankPage+1>=pages)?'disabled':'')+'>Next →</button></div>';
  $('bankList').innerHTML=h||'<div class="empty">No matching questions.</div>';
  var prev=$('bankPrev'),next=$('bankNext');if(prev)prev.onclick=function(){if(bankPage>0){bankPage--;renderBank();}};if(next)next.onclick=function(){if((bankPage+1)<pages){bankPage++;renderBank();}};
  var items=document.querySelectorAll('.bank-item'),j;for(j=0;j<items.length;j++)items[j].onclick=function(){var id=this.getAttribute('data-id');window.MQIStore.get(id).then(function(q){if(!q){toast('Question not found');return;}practicePool=[q];practiceIndex=0;practiceAnswered=false;show('practice');renderPracticeQuestion();});};
 }).catch(function(e){$('bankList').innerHTML='<div class="empty">Database query failed: '+esc(e.message||e)+'</div>';});
}
function showIntelDetail(type,id){
 var modal=document.getElementById('intelDetailModal');
 if(!modal){modal=document.createElement('div');modal.id='intelDetailModal';modal.className='detail-modal';document.body.appendChild(modal);}
 var arr=filteredDb('none'), attempts=state.attempts||[], title='',icon='📊', questions=[], stats={}, total=0,correct=0,i,j,q,k,st,topic;
 if(type==='major'){
  var m=majorById(id); title=m.ar; icon=m.icon;
  for(i=0;i<arr.length;i++) if(majorOfSubject(arr[i].subject||'')===id) questions.push(arr[i]);
 }else{
  title=subjectName(id); icon=iconFor(id);
  for(i=0;i<arr.length;i++) if((arr[i].subject||'')===id) questions.push(arr[i]);
 }
 var ids={}; for(i=0;i<questions.length;i++) ids[questions[i].id]=1;
 var subjectAttempts={}, topicStats={};
 for(i=0;i<attempts.length;i++){
  if(!ids[attempts[i].questionId]) continue;
  total++; if(attempts[i].correct) correct++;
  q=findById(attempts[i].questionId); if(!q) continue;
  k=q.subject||'Uncategorized';
  if(!subjectAttempts[k]) subjectAttempts[k]={c:0,n:0}; subjectAttempts[k].n++; if(attempts[i].correct)subjectAttempts[k].c++;
  topic=q.topic||'Uncategorized'; if(!topicStats[topic])topicStats[topic]={c:0,n:0}; topicStats[topic].n++; if(attempts[i].correct)topicStats[topic].c++;
 }
 var accuracy=pct(correct,total), uniqueTopics=Object.keys(topicStats), h='';
 h+='<div class="detail-backdrop" id="detailBackdrop"></div><div class="detail-sheet"><button class="detail-close" id="detailClose">×</button>';
 h+='<div class="detail-hero"><span class="detail-icon">'+icon+'</span><div><span class="detail-kicker">Performance Details</span><h2>'+esc(title)+'</h2><p>'+questions.length+' questions in your current exam filter</p></div></div>';
 h+='<div class="detail-metrics"><div><span>🎯</span><b>'+accuracy+'%</b><small>Accuracy</small></div><div><span>📝</span><b>'+total+'</b><small>Attempts</small></div><div><span>❓</span><b>'+questions.length+'</b><small>Questions</small></div><div><span>🏷️</span><b>'+uniqueTopics.length+'</b><small>Topics</small></div></div>';
 if(type==='major'){
  var subs=Object.keys(subjectAttempts);subs.sort();
  h+='<div class="detail-section"><div class="detail-section-title"><h3>Sub-specialties</h3><small>Tap a specialty to open its detailed analytics</small></div>';
  for(i=0;i<subs.length;i++){st=subjectAttempts[subs[i]];var a=pct(st.c,st.n);h+='<button class="detail-row" data-detail-sub="'+esc(subs[i])+'"><span class="detail-row-icon">'+iconFor(subs[i])+'</span><span><b>'+esc(subjectName(subs[i]))+'</b><small>'+st.c+'/'+st.n+' correct</small></span><strong>'+a+'%</strong><i>›</i></button>';}
  h+='</div>';
 }
 h+='<div class="detail-section"><div class="detail-section-title"><h3>Topic Performance</h3><small>Identify what to revise next</small></div>';
 if(uniqueTopics.length){uniqueTopics.sort(function(a,b){return pct(topicStats[a].c,topicStats[a].n)-pct(topicStats[b].c,topicStats[b].n);});for(i=0;i<uniqueTopics.length;i++){topic=uniqueTopics[i];st=topicStats[topic];var ta=pct(st.c,st.n);h+='<div class="topic-row"><div><b>'+esc(topic)+'</b><small>'+st.c+'/'+st.n+' correct</small></div><span>'+ta+'%</span><div class="bar"><i style="width:'+ta+'%"></i></div></div>';}}
 else h+='<div class="empty">Solve questions in this area to unlock topic analytics.</div>';
 h+='</div><div class="detail-actions"><button class="btn" id="detailPractice">📝 Practice This Area</button></div></div>';
 modal.innerHTML=h;modal.className='detail-modal open';
 document.getElementById('detailClose').onclick=closeIntelDetail;document.getElementById('detailBackdrop').onclick=closeIntelDetail;
 var rows=document.querySelectorAll('[data-detail-sub]');for(i=0;i<rows.length;i++)rows[i].onclick=function(){showIntelDetail('subject',this.getAttribute('data-detail-sub'));};
 document.getElementById('detailPractice').onclick=function(){closeIntelDetail();if(type==='subject')setPracticeSubject(id);else show('practice');};
}
function closeIntelDetail(){var m=document.getElementById('intelDetailModal');if(m)m.className='detail-modal';}
function showWeakAreasDetail(){
 var modal=document.getElementById('intelDetailModal');
 if(!modal){modal=document.createElement('div');modal.id='intelDetailModal';modal.className='detail-modal';document.body.appendChild(modal);}
 var attempts=state.attempts||[], allowed={},i,q,st={},topicStats={},arr=filteredDb('none');
 for(i=0;i<arr.length;i++)allowed[arr[i].id]=1;
 for(i=0;i<attempts.length;i++){
  if(!allowed[attempts[i].questionId])continue;
  q=findById(attempts[i].questionId);if(!q)continue;
  var subject=q.subject||'Uncategorized',topic=q.topic||'Uncategorized';
  if(!st[subject])st[subject]={c:0,n:0,major:majorOfSubject(subject)};
  st[subject].n++;if(attempts[i].correct)st[subject].c++;
  var tk=subject+'|||'+topic;
  if(!topicStats[tk])topicStats[tk]={subject:subject,topic:topic,c:0,n:0,major:majorOfSubject(subject)};
  topicStats[tk].n++;if(attempts[i].correct)topicStats[tk].c++;
 }
 var weakSubjects=[],weakTopics=[],k,a;
 for(k in st)if(st.hasOwnProperty(k)){a=pct(st[k].c,st[k].n);if(a<60)weakSubjects.push({id:k,c:st[k].c,n:st[k].n,p:a,major:st[k].major});}
 for(k in topicStats)if(topicStats.hasOwnProperty(k)){a=pct(topicStats[k].c,topicStats[k].n);if(a<60)weakTopics.push({id:k,c:topicStats[k].c,n:topicStats[k].n,p:a,subject:topicStats[k].subject,topic:topicStats[k].topic,major:topicStats[k].major});}
 weakSubjects.sort(function(x,y){return x.p-y.p;});weakTopics.sort(function(x,y){return x.p-y.p;});
 var h='<div class="detail-backdrop" id="detailBackdrop"></div><div class="detail-sheet weak-sheet"><button class="detail-close" id="detailClose">×</button><div class="detail-hero"><div class="detail-icon">⚠️</div><div><span class="detail-kicker">Learning Focus</span><h2>Weak Areas</h2><p>Prioritize the areas where your accuracy is below 60%.</p></div></div>';
 h+='<div class="weak-summary"><div><b>'+weakSubjects.length+'</b><small>Weak specialties</small></div><div><b>'+weakTopics.length+'</b><small>Weak topics</small></div><div><b>'+attempts.length+'</b><small>Total attempts</small></div></div>';
 if(!weakSubjects.length && !weakTopics.length){h+='<div class="weak-empty"><span>🎉</span><h3>No weak areas yet</h3><p>Keep practicing. Weak areas will appear automatically when your accuracy drops below 60%.</p></div>';}else{
  h+='<div class="detail-section"><div class="detail-section-title"><h3>Weak Specialties</h3><small>Tap to practice</small></div>';
  for(i=0;i<weakSubjects.length;i++){var ws=weakSubjects[i],label=subjectName(ws.id);h+='<button class="weak-item" data-weak-sub="'+esc(ws.id)+'"><span class="weak-item-icon">'+iconFor(ws.id)+'</span><span><b>'+esc(label)+'</b><small>'+esc(ws.id)+' · '+ws.c+'/'+ws.n+' correct</small><span class="weak-bar"><i style="width:'+ws.p+'%"></i></span></span><strong>'+ws.p+'%</strong><i>›</i></button>';}
  h+='</div><div class="detail-section"><div class="detail-section-title"><h3>Weak Topics</h3><small>Lowest accuracy first</small></div>';
  for(i=0;i<weakTopics.length;i++){var wt=weakTopics[i];h+='<button class="weak-item" data-weak-topic="'+esc(wt.subject)+'" data-weak-topic-name="'+esc(wt.topic)+'"><span class="weak-item-icon">📚</span><span><b>'+esc(wt.topic)+'</b><small>'+esc(subjectName(wt.subject))+' · '+wt.c+'/'+wt.n+' correct</small><span class="weak-bar"><i style="width:'+wt.p+'%"></i></span></span><strong>'+wt.p+'%</strong><i>›</i></button>';}
  h+='</div>';
 }
 h+='<div class="detail-actions"><button class="btn primary" id="weakPractice">📝 Practice Weak Areas</button></div></div>';
 modal.innerHTML=h;modal.className='detail-modal open';
 document.getElementById('detailClose').onclick=closeIntelDetail;document.getElementById('detailBackdrop').onclick=closeIntelDetail;
 var rows=document.querySelectorAll('[data-weak-sub]');for(i=0;i<rows.length;i++)rows[i].onclick=function(){closeIntelDetail();setPracticeSubject(this.getAttribute('data-weak-sub'));};
 var topics=document.querySelectorAll('[data-weak-topic]');for(i=0;i<topics.length;i++)topics[i].onclick=function(){closeIntelDetail();startPracticeByTopic(this.getAttribute('data-weak-topic'),this.getAttribute('data-weak-topic-name'));};
 document.getElementById('weakPractice').onclick=function(){closeIntelDetail();startWeakPractice();};
}
function startPracticeByTopic(subject,topic){renderPracticeSetup();var major=majorOfSubject(subject),pills=document.querySelectorAll('.major-pill'),i;for(i=0;i<pills.length;i++){if(pills[i].getAttribute('data-major')===major)pills[i].classList.add('active');else pills[i].classList.remove('active');}updatePracticeSpecialties(major);$('pfTopic').value=subject;updatePracticeSubjects();$('pfSubject').value=topic;startPractice();}
function startWeakPractice(){var attempts=state.attempts||[],allowed={},i,q,stats={},arr=filteredDb('none');for(i=0;i<arr.length;i++)allowed[arr[i].id]=1;for(i=0;i<attempts.length;i++){if(!allowed[attempts[i].questionId])continue;q=findById(attempts[i].questionId);if(!q)continue;var key=q.subject||'Uncategorized';if(!stats[key])stats[key]={c:0,n:0};stats[key].n++;if(attempts[i].correct)stats[key].c++;}var weak={};for(var k in stats)if(stats.hasOwnProperty(k)&&pct(stats[k].c,stats[k].n)<60)weak[k]=1;practicePool=[];for(i=0;i<arr.length;i++)if(weak[arr[i].subject||'Uncategorized'])practicePool.push(arr[i]);practiceIndex=0;practiceAnswered=false;if(!practicePool.length){toast('No weak-area questions available yet');return;}show('practice');renderPracticeQuestion();}

function bindIntelCards(){
 var majors=document.querySelectorAll('.intel-section[data-major-detail]'),i;
 for(i=0;i<majors.length;i++) majors[i].onclick=function(e){if(e.target.closest&&e.target.closest('[data-detail-sub]'))return;showIntelDetail('major',this.getAttribute('data-major-detail'));};
 var subs=document.querySelectorAll('.intel-sub[data-sub-detail]');
 for(i=0;i<subs.length;i++) subs[i].onclick=function(){showIntelDetail('subject',this.getAttribute('data-sub-detail'));};
}

function renderIntel(){var attempts=state.attempts||[],correct=0,i,allowed={},arr=filteredDb('none');for(i=0;i<arr.length;i++)allowed[arr[i].id]=1;for(i=0;i<attempts.length;i++)if(allowed[attempts[i].questionId]&&attempts[i].correct)correct++;var matchedAttempts=0;for(i=0;i<attempts.length;i++)if(allowed[attempts[i].questionId])matchedAttempts++;var accuracy=pct(correct,matchedAttempts);var subjectStats={},majorStats={};for(i=0;i<attempts.length;i++){if(!allowed[attempts[i].questionId])continue;var q=findById(attempts[i].questionId);if(!q)continue;var k=q.subject||'Uncategorized',mid=majorOfSubject(k);if(!subjectStats[k])subjectStats[k]={c:0,n:0,major:mid};subjectStats[k].n++;if(attempts[i].correct)subjectStats[k].c++;if(!majorStats[mid])majorStats[mid]={c:0,n:0};majorStats[mid].n++;if(attempts[i].correct)majorStats[mid].c++;}
 var h='<div class="metric-grid"><div class="metric"><div>🎯 Accuracy</div><b>'+accuracy+'%</b><div class="bar"><i style="width:'+accuracy+'%"></i></div></div><div class="metric"><div>📝 Attempts</div><b>'+attempts.length+'</b></div><button class="metric metric-click" id="weakMetric"><div>⚠️ Weak Areas</div><b>'+weakCount(subjectStats)+'</b><small>Tap to review</small></button><div class="metric"><div>🔁 Repeated</div><b>'+repeatedCount()+'</b></div></div><div class="section-head"><div><h2>Performance by Section</h2><p>Major section → subspecialty</p></div></div>';
 var mi,si,keys=Object.keys(subjectStats);for(mi=0;mi<MAJOR_SECTIONS.length;mi++){var m=MAJOR_SECTIONS[mi], mids=majorStats[m.id];if(!mids)continue;var map=[];for(si=0;si<keys.length;si++)if(subjectStats[keys[si]].major===m.id)map.push(keys[si]);var ma=pct(mids.c,mids.n);h+='<div class="intel-section" data-major-detail="'+esc(m.id)+'"><div class="intel-section-head"><span class="major-icon">'+m.icon+'</span><div><b>'+esc(m.en)+'</b><small>'+mids.c+'/'+mids.n+' correct · '+ma+'%</small></div></div><div class="bar"><i style="width:'+ma+'%"></i></div>';map.sort();for(si=0;si<map.length;si++){var st=subjectStats[map[si]],ap=pct(st.c,st.n);h+='<button class="intel-sub" data-sub-detail="'+esc(map[si])+'"><div><b>'+iconFor(map[si])+' '+esc(subjectName(map[si]))+'</b><small>'+esc(map[si])+' · '+st.c+'/'+st.n+'</small></div><span>'+ap+'%</span></div><div class="bar"><i style="width:'+ap+'%"></i></div>';}h+='</div>';}
 if(!keys.length)h+='<div class="empty">Solve some questions to build your analytics.</div>';if(keys.length){h+='<div class="weak-preview"><div class="section-head"><div><h2>⚠️ Weak Areas</h2><p>Topics and specialties below 60% accuracy</p></div><button class="small-btn" id="openWeakAreas">View all →</button></div><div class="weak-preview-list">';var wk=[];for(var wi=0;wi<keys.length;wi++){var wst=subjectStats[keys[wi]],wp=pct(wst.c,wst.n);if(wp<60)wk.push({id:keys[wi],p:wp,c:wst.c,n:wst.n});}wk.sort(function(a,b){return a.p-b.p;});for(var wj=0;wj<Math.min(3,wk.length);wj++){var wx=wk[wj];h+='<button class="weak-preview-item" data-weak-preview="'+esc(wx.id)+'"><span>'+iconFor(wx.id)+'</span><span><b>'+esc(subjectName(wx.id))+'</b><small>'+wx.c+'/'+wx.n+' correct</small></span><strong>'+wx.p+'%</strong></button>';}if(!wk.length)h+='<div class="weak-good">🎉 No weak specialties yet.</div>';h+='</div></div>';}$('intelContent').innerHTML=h;bindIntelCards();var wm=document.getElementById('weakMetric');if(wm)wm.onclick=showWeakAreasDetail;var ow=document.getElementById('openWeakAreas');if(ow)ow.onclick=showWeakAreasDetail;var wpv=document.querySelectorAll('[data-weak-preview]');for(var wi2=0;wi2<wpv.length;wi2++)wpv[wi2].onclick=function(){showIntelDetail('subject',this.getAttribute('data-weak-preview'));};}
function weakCount(stats){var n=0,k;for(k in stats)if(stats.hasOwnProperty(k)&&pct(stats[k].c,stats[k].n)<60)n++;return n;}
function findById(id){var i;for(i=0;i<db.length;i++)if(db[i].id===id)return db[i];return null;}
function renderProfileSettings(){
 var el=$('profileSettings');if(!el)return;
 var years=uniqueValuesFrom(filteredDb('year'),'year'),dates=uniqueValuesFrom(filteredDb('exactDate'),'exactDate'),selected=professionById(examFilters.profession),quals=qualificationForProfession(examFilters.profession);
 var h='<div class="profile-card"><div class="profile-title"><span>👤</span><div><b>My Profile</b><small>Select تخصصك ومؤهلك ثم دولة اختبار مزاولة المهنة والمحافظة وYear وDate. سيتم تطبيق الملف تلقائيًا على التدريب والاختبارات وبنك الأسئلة والتحليلات.</small></div></div>';
 h+='<div class="profile-section-label">Step 1: Choose your profession</div><div class="profile-professions">';
 for(var i=0;i<PROFESSIONS.length;i++){var p=PROFESSIONS[i];h+='<button type="button" class="profile-profession'+(examFilters.profession===p.id?' active':'')+'" data-profile-profession="'+p.id+'"><span>'+p.icon+'</span><b>'+esc(p.label)+'</b></button>';}
 h+='</div>';
 if(examFilters.profession&&quals.length){
   h+='<div class="profile-section-label">Step 2: Qualification / pathway</div><div class="profile-fields profile-qualification-only">'+profileSelectHtml('profileQualification','Qualification / Pathway',quals,examFilters.qualification,'Select qualification')+'</div>';
 }
 h+='<div class="profile-section-label">'+(quals.length?'Step 3':'Step 2')+': Professional Licensure Details</div><div class="profile-fields">';
 h+=profileSelectHtml('profileCountry','Country',profileLists.countries,examFilters.country,'Select Country');
 h+=profileSelectHtml('profileGovernorate','City / Region',profileLists.governorates,examFilters.governorate,'Select city or region');
 h+=profileSelectHtml('profileYear','Year',years,examFilters.year,'Select Year');
 h+=profileSelectHtml('profileDate','Date',dates,examFilters.exactDate,'Select Date');
 h+='</div><div class="profile-add-grid"><input id="newCountry" class="select" placeholder="Add a new country"><button class="wide-btn" id="addCountry">＋ Add Country</button><input id="newGovernorate" class="select" placeholder="Add a new city / region"><button class="wide-btn" id="addGovernorate">＋ Add City / Region</button></div>';
 h+='<div class="profile-summary"><span>👤 '+esc(selected.label||'No profession selected')+'</span>'+(examFilters.qualification?'<span>🎓 '+esc(examFilters.qualification)+'</span>':'')+'<span>🌍 '+esc(examFilters.country||'All countries')+'</span><span>📍 '+esc(examFilters.governorate||'All cities / regions')+'</span><span>📅 '+esc(examFilters.year||'All years')+'</span><span>🗓️ '+esc(examFilters.exactDate||'All dates')+'</span></div><button class="wide-btn profile-clear" id="clearProfile">↺ Clear Profile</button></div>';
 el.innerHTML=h;
 var pq=$('profileQualification');if(pq)pq.onchange=function(){examFilters.qualification=this.value;examFilters.year='';examFilters.exactDate='';profileSave();renderAll();};
 var ps=document.querySelectorAll('[data-profile-profession]');for(i=0;i<ps.length;i++)ps[i].onclick=function(){examFilters.profession=this.getAttribute('data-profile-profession')||'';examFilters.qualification='';examFilters.specialty='';var p=professionById(examFilters.profession);if(examFilters.profession==='human_medicine'){var spVals=specialtiesForProfession(examFilters.profession);if(spVals.indexOf('General Medicine & Surgery')>=0)examFilters.specialty='General Medicine & Surgery';}examFilters.year='';examFilters.exactDate='';profileSave();renderAll();toast('Profession updated');};
 var ids=['profileCountry','profileGovernorate','profileYear','profileDate'];for(i=0;i<ids.length;i++){(function(id){var x=$(id);if(x)x.onchange=function(){if(id==='profileCountry')examFilters.country=this.value;if(id==='profileGovernorate')examFilters.governorate=this.value;if(id==='profileYear')examFilters.year=this.value;if(id==='profileDate')examFilters.exactDate=this.value;profileSave();renderAll();};})(ids[i]);}
 var ac=$('addCountry');if(ac)ac.onclick=function(){var x=text($('newCountry').value).trim();if(x&&profileLists.countries.indexOf(x)<0){profileLists.countries.push(x);profileSave();renderSettings();toast('Country added');}};
 var ag=$('addGovernorate');if(ag)ag.onclick=function(){var x=text($('newGovernorate').value).trim();if(x&&profileLists.governorates.indexOf(x)<0){profileLists.governorates.push(x);profileSave();renderSettings();toast('City / region added');}};
 var cp=$('clearProfile');if(cp)cp.onclick=function(){examFilters.profession='';examFilters.qualification='';examFilters.specialty='';examFilters.country='';examFilters.governorate='';examFilters.year='';examFilters.exactDate='';profileSave();renderAll();toast('Profile cleared');};
}
function profileSelectHtml(id,label,values,current,placeholder){var h='<label class="profile-field"><span>'+esc(label)+'</span><select id="'+id+'" class="select"><option value="">'+esc(placeholder||'Select')+'</option>';for(var i=0;i<values.length;i++)h+='<option value="'+esc(values[i])+'"'+(values[i]===current?' selected':'')+'>'+esc(values[i])+'</option>';return h+'</select></label>';}
function renderSettings(){renderProfileSettings();renderSearchScopeSettings();var h='<div class="db-file"><div class="db-icon">JSON</div><div><b>Built-in database</b><span>'+db.length+' normalized questions · '+countExams()+' matched exams</span></div></div>';var m=window._manifest;if(m&&m.files){var i;for(i=0;i<m.files.length;i++)h+='<div class="db-file"><div class="db-icon">📄</div><div><b>'+esc(m.files[i].label||m.files[i].file)+'</b><span>'+esc(m.files[i].file)+'</span></div></div>';}$('dbFiles').innerHTML=h;$('soundToggle').textContent=soundOn?'🔊 Sound ON':'🔇 Sound OFF';var ce=$('celebrationToggle');if(ce)ce.textContent=celebrationOn?'🎉 Celebration Effects: ON':'🔕 Celebration Effects: OFF';var ml=$('mockLiveScoreToggle');if(ml)ml.textContent=mockLiveScoreVisible?'📊 Live Mock Score: ON':'📊 Live Mock Score: OFF';}
function validateExamJSON(x){
 var errors=[],warnings=[],qs=[];
 if(!x||typeof x!=='object')return {valid:false,errors:['Root JSON must be an object.'],warnings:[]};
 if(!x.examMetadata||typeof x.examMetadata!=='object')warnings.push('examMetadata is missing; question-level metadata will be used where available.');
 qs=Array.isArray(x.questions)?x.questions:[];
 if(!qs.length)errors.push('questions must be a non-empty array.');
 var ids={};
 for(var i=0;i<qs.length;i++){
  var q=qs[i]||{}, n=i+1;
  if(!q.id)warnings.push('Question '+n+': missing id; the application will generate one.');
  else if(ids[q.id])errors.push('Duplicate question id: '+q.id); else ids[q.id]=1;
  if(q.questionNumber==null)warnings.push('Question '+n+': missing questionNumber.');
  if(!q.originalQuestion&&!q.question)errors.push('Question '+n+': originalQuestion is missing.');
  if(!q.originalOptions&&!q.options)errors.push('Question '+n+': originalOptions are missing.');
  var oe=q.optionExplanations;if(oe&&typeof oe==='object'){var oo=q.originalOptions||q.options||{};for(var k in oe)if(!Object.prototype.hasOwnProperty.call(oo,k))warnings.push('Question '+n+': optionExplanations.'+k+' has no matching original option.');}
  if(q.correctAnswer&&typeof q.correctAnswer==='object'&&!Array.isArray(q.correctAnswer.letters))warnings.push('Question '+n+': correctAnswer.letters should be an array.');
  if(q.sourceAnswer&&typeof q.sourceAnswer==='object'&&!Array.isArray(q.sourceAnswer.letters))warnings.push('Question '+n+': sourceAnswer.letters should be an array.');
  if(!q.subject||!q.topic||!q.title)warnings.push('Question '+n+': Subject/Topic/Title incomplete; analytics may be less precise.');
  if(!q.explanation)warnings.push('Question '+n+': explanation is missing.');
 }
 return {valid:errors.length===0,errors:errors,warnings:warnings};
}
function parseJsonObjectAt(text,start){var i=start,depth=0,inStr=false,escp=false;for(;i<text.length;i++){var c=text[i];if(inStr){if(escp)escp=false;else if(c==='\\')escp=true;else if(c==='"')inStr=false;continue;}if(c==='"'){inStr=true;continue;}if(c==='{')depth++;else if(c==='}'){depth--;if(depth===0)return {end:i+1,value:text.slice(start,i+1)};}}return null;}
function streamLargeExam(file,onQuestion,onMeta,onDone,onError){
 if(!file.stream){onError(new Error('Streaming is not supported by this browser.'));return;}
 var reader=file.stream().pipeThrough(new TextDecoderStream()).getReader(),buf='',started=false,scan=0,idx=0,done=false;
 function fail(e){try{reader.cancel();}catch(_){}onError(e);}
 function process(){
  while(true){
   if(!started){var qm=buf.search(/"questions"\s*:\s*\[/);if(qm<0){if(buf.length>2000000){buf=buf.slice(-200000);};return false;}var qpos=buf.indexOf('[',qm);var metaText=buf.slice(0,qm);var mm=metaText.indexOf('"examMetadata"');if(mm>=0){var brace=metaText.indexOf('{',mm);if(brace>=0){var po=parseJsonObjectAt(metaText,brace);if(po){try{onMeta(JSON.parse(po.value));}catch(_){} }}}buf=buf.slice(qpos+1);started=true;scan=0;}
   while(scan<buf.length){var c=buf[scan];if(c==='"'){var j=scan+1,escp=false;for(;j<buf.length;j++){var cc=buf[j];if(escp)escp=false;else if(cc==='\\')escp=true;else if(cc==='"')break;}if(j>=buf.length)return false;scan=j+1;continue;}if(c==='{'){var po=parseJsonObjectAt(buf,scan);if(!po)return false;try{onQuestion(JSON.parse(po.value),idx++);}catch(e){fail(e);return true;}buf=buf.slice(po.end);scan=0;continue;}if(c===']'){done=true;onDone(idx);return true;}scan++;}
   return false;
  }
 }
 function pump(){reader.read().then(function(x){if(x.done){if(!done){process();if(!done)fail(new Error('Incomplete questions array.'));}return;}buf+=x.value;try{if(!process())setTimeout(pump,0);else if(!done)setTimeout(pump,0);}catch(e){fail(e);}}).catch(fail);}
 pump();
}
function importJsonFile(file){
 var LARGE=5*1024*1024;
 if(file.size>LARGE){
  var meta={},batch=[],total=0,mode=appMode,started=Date.now(),writeChain=Promise.resolve(),writeFailed=null,lastProgress=0;
  toast('Large file detected. Streaming import started…');
  function queueBatch(rows){writeChain=writeChain.then(function(){return persistImportedRows(rows);}).catch(function(e){writeFailed=e;});}
  streamLargeExam(file,function(raw,i){
   var copy=raw||{};if(meta.profession&&!copy.profession)copy.profession=meta.profession;if(meta.specialty&&!copy.specialty)copy.specialty=meta.specialty;if(meta.qualification&&!copy.qualification)copy.qualification=meta.qualification;if(meta.country&&!copy.country)copy.country=meta.country;if(!copy.country)copy.country='Yemen';if(meta.city&&!copy.city)copy.city=meta.city;if(meta.governorate&&!copy.governorate)copy.governorate=meta.governorate;if(meta.year&&!copy.year)copy.year=meta.year;if(meta.month&&!copy.month)copy.month=meta.month;if(meta.exactDate&&!copy.exactDate)copy.exactDate=meta.exactDate;if(meta.language&&!copy.language)copy.language=meta.language;if(meta.source&&!copy.source)copy.source=meta.source;if(meta.examTitle&&!copy.examTitle)copy.examTitle=meta.examTitle;if(meta.exam&&!copy.exam)copy.exam=meta.exam;if(meta.bankName&&!copy.bankName)copy.bankName=meta.bankName;if(meta.questionBank&&!copy.questionBank)copy.questionBank=meta.questionBank;if(meta.examProvider&&!copy.examProvider)copy.examProvider=meta.examProvider;copy.databaseType=text(copy.databaseType||meta.databaseType||mode);batch.push(normalize(copy,i));total++;
   if(batch.length>=500){var send=batch;batch=[];queueBatch(send);var cap=window.MQIStore?window.MQIStore.MAX_CACHE:1500;if(db.length<cap)db=uniqueMerge(db,send.slice(0,cap-db.length));}
   if(total-lastProgress>=5000){lastProgress=total;toast('Importing questions… '+total.toLocaleString()+' parsed; saving in batches');}
  },function(m){meta=m||{};mode=text(meta.databaseType||mode)==='global'?'global':'licensure';},function(n){
   if(batch.length){queueBatch(batch);batch=[];}
   writeChain.then(function(){if(writeFailed){toast('Import stopped: database write failed — '+(writeFailed.message||writeFailed));return;}renderAll();toast('Streaming import complete: '+total.toLocaleString()+' questions · saved to IndexedDB in batches.');});
  },function(e){toast('Streaming import failed: '+e.message);});
  return;
 }
 var r=new FileReader();r.onload=function(){try{var x=JSON.parse(r.result),v=validateExamJSON(x);if(!v.valid)throw new Error(v.errors.join(' | '));var meta=x.examMetadata||{},arr=x.questions||[],enriched=[],i,q,copy,k,dbType=text(meta.databaseType||((text(meta.examType||'')+' '+text(meta.source||'')).toLowerCase().indexOf('global')>=0?'global':appMode));for(i=0;i<arr.length;i++){q=arr[i]||{};copy={};for(k in q)copy[k]=q[k];if(meta.profession&&!copy.profession)copy.profession=meta.profession;if(meta.specialty&&!copy.specialty)copy.specialty=meta.specialty;if(meta.qualification&&!copy.qualification)copy.qualification=meta.qualification;if(meta.country&&!copy.country)copy.country=meta.country;if(!copy.country)copy.country='Yemen';if(meta.city&&!copy.city)copy.city=meta.city;if(meta.governorate&&!copy.governorate)copy.governorate=meta.governorate;if(meta.year&&!copy.year)copy.year=meta.year;if(meta.month&&!copy.month)copy.month=meta.month;if(meta.exactDate&&!copy.exactDate)copy.exactDate=meta.exactDate;if(meta.language&&!copy.language)copy.language=meta.language;if(meta.source&&!copy.source)copy.source=meta.source;if(meta.examTitle&&!copy.examTitle)copy.examTitle=meta.examTitle;if(meta.exam&&!copy.exam)copy.exam=meta.exam;if(meta.bankName&&!copy.bankName)copy.bankName=meta.bankName;if(meta.questionBank&&!copy.questionBank)copy.questionBank=meta.questionBank;if(meta.examProvider&&!copy.examProvider)copy.examProvider=meta.examProvider;if(!copy.databaseType)copy.databaseType=dbType;enriched.push(normalize(copy,i));}persistImportedRows(enriched).then(function(){db=uniqueMerge(db,enriched.slice(0,window.MQIStore?window.MQIStore.MAX_CACHE:750));renderAll();toast('Imported '+enriched.length+' questions into '+(dbType==='global'?'Global Question Banks':'Professional Licensure')+'. Full database stored in IndexedDB.'+(v.warnings.length?' · '+v.warnings.length+' warnings':''));});}catch(e){toast('Import failed: '+e.message);}};r.onerror=function(){toast('Could not read the file');};r.readAsText(file);
}

function exportJson(){
 if(!window.MQIStore){toast('IndexedDB is unavailable.');return;}
 var btn=document.activeElement;if(btn)btn.disabled=true;
 window.MQIStore.exportAll(activeStoreFilters(),appMode).then(function(rows){
  var payload={examMetadata:{databaseType:appMode,numberOfQuestions:rows.length,source:'Exported from Medical Question Intelligence Database'},questions:rows};
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download=(appMode==='global'?'global_question_bank':'professional_licensure_database')+'_export.json';document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(function(){URL.revokeObjectURL(a.href);},1000);toast('Exported '+rows.length.toLocaleString()+' questions.');
 }).catch(function(e){toast('Export failed: '+(e.message||e));}).then(function(){if(btn)btn.disabled=false;});
}
function downloadExamTemplate(){var global=appMode==='global',x={examMetadata:{databaseType:global?'global':'licensure',profession:global?'':'Human Medicine (General Medicine & Surgery)',qualification:'',specialty:global?'':'General Medicine & Surgery',bankName:global?'Example Global Bank':'',country:global?'United States':'Yemen',governorate:'',year:2026,month:'January',exactDate:'2026-01-01',language:'English',source:global?'Global Question Bank source file':'Kafa'ah Licensure Examination source file',examTitle:global?'Global Question Bank Exam':'Kafa'ah Licensure Examination',numberOfQuestions:1},questions:[{id:'2026-01-01-EXAMPLE-001',questionNumber:1,profession:global?'':'Human Medicine (General Medicine & Surgery)',qualification:'',specialty:global?'':'General Medicine & Surgery',bankName:global?'Example Global Bank':'',databaseType:global?'global':'licensure',country:global?'United States':'Yemen',governorate:'',year:2026,month:'January',exactDate:'2026-01-01',subject:'Cardiology',topic:'Acute Coronary Syndrome',title:'Initial Management of STEMI',originalQuestion:'PASTE THE ORIGINAL QUESTION EXACTLY AS IT APPEARS IN THE SOURCE.',originalOptions:{A:'Original option A',B:'Original option B',C:'Original option C',D:'Original option D'},sourceAnswer:{letters:[],text:'Not provided in the source file.'},hasCorrection:false,correctionStatus:'Correct',correction:'No correction required.',correctedQuestion:'',correctAnswer:{letters:['A'],text:'A — Original option A'},explanation:'Concise medical explanation.',optionExplanations:{A:'Why A is correct.',B:'Why B is not correct.',C:'Why C is not correct.',D:'Why D is not correct.'},tags:['Cardiology','Acute Coronary Syndrome']}]};var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(x,null,2)],{type:'application/json'}));a.download=global?'global_question_bank_template.json':'professional_licensure_exam_template.json';document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(function(){URL.revokeObjectURL(a.href);},1000);}
function examFileFromHref(href){
 href=(href||'').split('#')[0].split('?')[0];
 if(!/\.json$/i.test(href))return '';
 var name=href.split('/').pop();
 if(!name||/^(database-manifest|questions|index)\.json$/i.test(name))return '';
 return name;
}
function labelFromFile(file){
 var n=(file||'').replace(/\.json$/i,'');
 var m=n.match(/^(.+?)_(\d{4})-(\d{2})-(\d{2})$/);
 if(m){var months=['January','February','March','April','May','June','July','August','September','October','November','December'];return m[1].replace(/_/g,"'")+ ' • '+m[2]+'-'+m[3]+'-'+m[4];}
 return n.replace(/_/g,' ');
}
function discoverExamFiles(){
 /* TrebEdit/local HTTP servers commonly expose a directory listing for data/exams/.
    We read only the filenames; the user can therefore drop any new .json beside the
    existing exam files and the app will discover it without editing a manifest. */
 return fetch('data/exams/',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('directory listing unavailable');return r.text();}).then(function(html){
  var found={},m,re=/href=["']([^"']+\.json(?:\?[^"']*)?)["']/gi;
  while((m=re.exec(html))){var f=examFileFromHref(decodeURIComponent(m[1]));if(f)found[f]=1;}
  return Object.keys(found);
 });
}
function buildDiscoveredManifest(man){
 man=man&&typeof man==='object'?man:{};var base=Array.isArray(man.files)?man.files.slice():[],by={};
 for(var i=0;i<base.length;i++){var bf=base[i]||{},bn=text(bf.file||'').split('/').pop();if(bn)by[bn]=bf;}
 return discoverExamFiles().catch(function(){return [];}).then(function(names){
  for(var j=0;j<names.length;j++){var name=names[j];if(!by[name]){by[name]={file:'exams/'+name,label:labelFromFile(name),autoDiscovered:true};base.push(by[name]);}}
  man.files=base;return man;
 });
}
function loadAndNormalizeExamFile(f){
 return fetch('data/'+f.file,{cache:'default'}).then(function(r){if(!r.ok)throw new Error(f.file);return r.json();}).then(function(raw){
  var batches=[],baseMeta=f.metadata||{},fileKey=text(f.file||'exam').split('/').pop().replace(/\.json$/i,'').replace(/[^A-Za-z0-9_-]/g,'_'),out=[];
  if(Array.isArray(raw)){batches.push({questions:raw,meta:baseMeta,suffix:''});}
  else if(raw&&Array.isArray(raw.questions)){batches.push({questions:raw.questions,meta:raw.examMetadata||baseMeta,suffix:''});}
  else if(raw&&Array.isArray(raw.exams)){
   for(var bi=0;bi<raw.exams.length;bi++){var ex=raw.exams[bi]||{};if(Array.isArray(ex.questions))batches.push({questions:ex.questions,meta:ex.examMetadata||baseMeta,suffix:'_model'+(bi+1)});}
  }
  for(var b=0;b<batches.length;b++){
   var pack=batches[b],meta=pack.meta||baseMeta,rows=ensureQuestionIds(pack.questions,meta,f.file),enriched=[];
   for(var j=0;j<rows.length;j++){
    var q=rows[j]||{},copy={},k;for(k in q)copy[k]=q[k];
    /* Stable source-qualified IDs prevent one exam/model overwriting another in IndexedDB. */
    var rawId=text(copy.id||((j+1)+'')).replace(/\s+/g,'_');
    copy.id=(pack.suffix||fileKey==='sanaa2024_1-2'||fileKey==='_Ibb_2024-12-19')?fileKey+pack.suffix+'::'+rawId:rawId;
    if(meta.profession&&!copy.profession)copy.profession=meta.profession;
    if(meta.specialty&&!copy.specialty)copy.specialty=meta.specialty;
    if(meta.qualification&&!copy.qualification)copy.qualification=meta.qualification;
    if(meta.country&&!copy.country)copy.country=meta.country;if(!copy.country)copy.country='Yemen';
    if(meta.city&&!copy.city)copy.city=meta.city;if(meta.governorate&&!copy.governorate)copy.governorate=meta.governorate;
    if(meta.year&&!copy.year)copy.year=meta.year;if(meta.month&&!copy.month)copy.month=meta.month;
    if(meta.exactDate&&!copy.exactDate)copy.exactDate=meta.exactDate;if(meta.language&&!copy.language)copy.language=meta.language;
    if(meta.source&&!copy.source)copy.source=meta.source;if(meta.examTitle&&!copy.examTitle)copy.examTitle=meta.examTitle;
    if(meta.exam&&!copy.exam)copy.exam=meta.exam;if(meta.bankName&&!copy.bankName)copy.bankName=meta.bankName;
    if(meta.questionBank&&!copy.questionBank)copy.questionBank=meta.questionBank;
    if(meta.examProvider&&!copy.examProvider)copy.examProvider=meta.examProvider;
    if(!copy.databaseType)copy.databaseType=meta.databaseType||raw.databaseType||'licensure';
    if(!copy.sourceFile)copy.sourceFile=f.file;
    enriched.push(copy);
   }
   out=out.concat(normalizeAll(enriched));
  }
  return out;
 });
}
function syncFiles(){
 fetch('data/database-manifest.json',{cache:'default'}).then(function(r){if(!r.ok)throw new Error('Manifest unavailable');return r.json();})
 .then(buildDiscoveredManifest)
 .then(function(man){window._manifest=man;var files=man.files||[],promises=[],i;
  for(i=0;i<files.length;i++)(function(f){promises.push(loadAndNormalizeExamFile(f));})(files[i]);
  return Promise.all(promises);
 })
 .then(function(all){var add=[],i,j;for(i=0;i<all.length;i++)for(j=0;j<all[i].length;j++)add.push(all[i][j]);var before=db.length;db=uniqueMerge(db,add);saveDb();if(window.MQIStore&&add.length)window.MQIStore.putMany(add).catch(function(){});renderAll();toast('Database synced: '+(db.length-before)+' new questions · auto-detected exam files');})
 .catch(function(e){toast('Database sync unavailable; built-in database kept.');});
}

/* V13.0 Custom Exam Builder */
var CREATED_EXAMS_KEY='ymlq_created_exams_v13';
var createdExamDraft=null;
var createExamView='home';
function loadCreatedExams(){try{var x=JSON.parse(localStorage.getItem(CREATED_EXAMS_KEY)||'[]');state.createdExams=Array.isArray(x)?x:[];}catch(e){state.createdExams=[];}}
function saveCreatedExams(){try{localStorage.setItem(CREATED_EXAMS_KEY,JSON.stringify(state.createdExams||[]));}catch(e){}}
function createExamTypeOptions(type){
 var h='<div class="create-type-grid">';
 var types=[['licensure','🪪','Professional Licensure','Build a country-specific professional licensing exam.'],['global','🌍','Global Exam','Create an international exam with its own provider and specialty.'],['teacher','👨‍🏫','Teacher / Doctor Exam','Create a private exam for a class, course, doctor or instructor.']];
 for(var i=0;i<types.length;i++)h+='<button type="button" class="create-type '+(type===types[i][0]?'active':'')+'" data-create-type="'+types[i][0]+'"><span>'+types[i][1]+'</span><b>'+types[i][2]+'</b><small>'+types[i][3]+'</small></button>';
 return h+'</div>';
}
function createField(id,label,value,type,placeholder){return '<label class="create-field"><span>'+esc(label)+'</span><input id="'+id+'" class="select" type="'+(type||'text')+'" value="'+esc(value||'')+'" placeholder="'+esc(placeholder||'')+'"></label>';}
function createSelect(id,label,values,current,placeholder){var h='<label class="create-field"><span>'+esc(label)+'</span><select id="'+id+'" class="select"><option value="">'+esc(placeholder||'Select')+'</option>';for(var i=0;i<(values||[]).length;i++)h+='<option value="'+esc(values[i])+'"'+(values[i]===current?' selected':'')+'>'+esc(values[i])+'</option>';return h+'</select></label>';}
function renderCreateExam(){
 var c=$('createExamContent');if(!c)return;
 if(!createdExamDraft)createdExamDraft={type:'licensure',title:'',count:1,time:30,profession:examFilters.profession||'',qualification:examFilters.qualification||'',country:examFilters.country||'Yemen',city:examFilters.governorate||'',year:'',subject:'',section:'',date:'',provider:'',bankName:'',specialty:'',instructor:'',teacherPhone:'',institution:'',questions:[newBlankCreatedQuestion()]};
 var d=createdExamDraft;

 if(createExamView==='home'){
   var total=(state.createdExams||[]).length;
   var qs=(state.createdExams||[]).reduce(function(n,x){return n+(Array.isArray(x.questions)?x.questions.length:0);},0);
   c.innerHTML='<div class="exam-center panel">'+
     '<div class="exam-center-hero"><div class="page-kicker">🛠️ Exam Center</div><h2>Private Exam Center</h2><p>Create, enter, manage and share private exams smoothly. Professional Licensure and Global Question Banks remain completely separate.</p></div>'+
     '<div class="exam-center-stats"><div><b>'+total+'</b><span>Saved Exams</span></div><div><b>'+qs+'</b><span>Private Questions</span></div><div><b>JSON</b><span>Import / Export</span></div></div>'+
     '<div class="exam-center-grid">'+
       '<button class="exam-center-card primary" data-exam-view="create"><span>➕</span><b>Create New Exam</b><small>Build an exam for a class, student, doctor, course or personal revision.</small><i>→</i></button>'+
       '<button class="exam-center-card teal" data-exam-view="library"><span>▶️</span><b>Enter / Start Exam</b><small>Open your saved private exams and start one immediately.</small><i>→</i></button>'+
       '<button class="exam-center-card gold" data-exam-view="data"><span>📦</span><b>Import / Export JSON</b><small>Move private exams between phones, computers, students and teachers.</small><i>→</i></button>'+
       '<button class="exam-center-card purple" data-exam-view="createTeacher"><span>👨‍🏫</span><b>Teacher / Doctor Mode</b><small>Create a private exam and prepare it for distribution to students.</small><i>→</i></button>'+
     '</div>'+
     '<div class="exam-center-help"><b>🔐 Private by design</b><span>These exams are stored separately from Professional Licensure and Global Question Banks. They are not added to the public question database.</span></div>'+
   '</div>';
   bindCreateCenter();
   return;
 }

 if(createExamView==='library'){
   c.innerHTML='<div class="exam-subpage panel"><div class="exam-subpage-head"><button class="small-btn" id="backExamCenter">← Exam Center</button><div><span class="page-kicker">📚 Private Library</span><h2>My Private Exams</h2><p>Choose an exam to enter, export it, or delete it.</p></div></div>'+
   '<div class="exam-library-toolbar"><input id="privateExamSearch" class="search" placeholder="Search exam title, teacher, course…"><button class="btn primary" id="libraryCreateBtn">＋ Create Exam</button></div>'+
   '<div class="exam-library-summary" id="privateExamSummary"></div><div id="createdExamList"></div></div>';
   renderCreatedExamList();
   renderPrivateExamSummary();
   bindExamLibrary();
   return;
 }

 if(createExamView==='data'){
   c.innerHTML='<div class="exam-subpage panel"><div class="exam-subpage-head"><button class="small-btn" id="backExamCenter2">← Exam Center</button><div><span class="page-kicker">📦 Private Data</span><h2>Import & Export</h2><p>Transfer private exams as JSON without mixing them with the main medical question banks.</p></div></div>'+
   '<div class="data-action-grid">'+
     '<button class="data-action-card" id="exportCreatedExams"><span>⬇️</span><b>Export All Private Exams</b><small>Download every private exam as one JSON file.</small></button>'+
     '<button class="data-action-card" id="importCreatedExams"><span>⬆️</span><b>Import Private Exams</b><small>Import exams received from a teacher, doctor or another device.</small></button>'+
   '</div>'+
   '<input id="createdExamImportFile" type="file" accept="application/json,.json" hidden>'+
   '<div class="json-guide"><b>🔐 Private JSON format</b><p>Imported exams stay inside the Private Exam Library and are never inserted into Professional Licensure or Global Question Banks.</p><div class="json-flow"><span>Teacher</span><b>JSON</b><span>Student</span><b>→</b><span>Private Library</span></div></div>'+
   '<div class="exam-sub-actions"><button class="btn secondary" id="dataCreateBtn">＋ Create New Exam</button><button class="btn secondary" id="dataLibraryBtn">📚 Open Private Library</button></div>'+
   '</div>';
   var exportBtn=$('exportCreatedExams'); if(exportBtn) exportBtn.onclick=exportCreatedExams;
   var importBtn=$('importCreatedExams'); var importFile=$('createdExamImportFile');
   if(importBtn) importBtn.onclick=function(){if(importFile)importFile.click();};
   if(importFile) importFile.onchange=function(){if(this.files&&this.files[0])importCreatedExamsFile(this.files[0]);this.value='';};
   var backData=$('backExamCenter2'); if(backData) backData.onclick=function(){createExamView='home';renderCreateExam();};
   var dataCreate=$('dataCreateBtn'); if(dataCreate) dataCreate.onclick=function(){createExamView='create';renderCreateExam();};
   var dataLibrary=$('dataLibraryBtn'); if(dataLibrary) dataLibrary.onclick=function(){createExamView='library';renderCreateExam();};
   return;
 }

 // Create new exam / teacher mode.
 if(createExamView==='createTeacher')d.type='teacher';

 var h='<div class="create-builder panel"><div class="exam-subpage-head"><button class="small-btn" id="backExamCenter3">← Exam Center</button><div><span class="page-kicker">✍️ Exam Builder</span><h2>'+(d.type==='teacher'?'Teacher / Doctor Exam':'Create New Exam')+'</h2><p>Build the exam step by step. Save it privately or start it immediately.</p></div></div>';
 h+=createExamTypeOptions(d.type);
 h+='<div class="create-meta-grid">'+createField('ceTitle','Exam Title',d.title,'text','e.g. Cardiology Review Exam')+createField('ceCount','Number of Questions',d.count,'number','1–100')+createField('ceTime','Time Limit (minutes)',d.time,'number','Optional')+'</div>';
 if(d.type==='licensure'){
   var pvals=PROFESSIONS.map(function(x){return x.label;});
   h+='<div class="create-block-title">🪪 Professional Licensure Details</div><div class="create-meta-grid">'+createSelect('ceProfession','Profession',pvals,d.profession,'Select profession')+createSelect('ceQualification','Qualification',d.profession?qualificationForProfession(d.profession):[],d.qualification,'Select qualification')+createSelect('ceCountry','Country',profileLists.countries,d.country,'Select country')+createField('ceCity','City / Region',d.city)+createField('ceYear','Year',d.year,'number','2026')+createField('ceDate','Exam Date',d.date,'date')+'</div>';
 } else if(d.type==='global'){
   h+='<div class="create-block-title">🌍 Global Exam Details</div><div class="create-meta-grid">'+createField('ceProvider','Exam / Provider',d.provider,'text','e.g. USMLE, PLAB, Prometric')+createField('ceBank','Question Bank',d.bankName,'text','e.g. USMLE, PLAB, NBME')+createField('ceSpecialty','Specialty',d.specialty)+createField('ceCountry','Country',profileLists.countries,d.country,'Select country')+createField('ceCity','City / Region',d.city)+createField('ceYear','Year',d.year,'number','2026')+createField('ceDate','Exam Date',d.date,'date')+'</div>';
 } else {
   h+='<div class="create-block-title">👨‍🏫 Teacher / Doctor Exam Details</div><div class="create-meta-grid">'+createField('ceInstructor','Teacher / Doctor',d.instructor,'text','Name of teacher or doctor')+createField('ceTeacherPhone','Teacher WhatsApp',d.teacherPhone,'tel','9677xxxxxxxx')+createField('ceInstitution','Institution / Course',d.institution)+createField('ceSubject','Subject',d.subject)+createField('ceSection','Section / Department',d.section)+createField('ceDate','Exam Date',d.date,'date')+'</div>';
 }
 if(d.type!=='teacher')h+='<div class="create-meta-grid">'+createField('ceSubject','Subject',d.subject,'text','e.g. Cardiology')+createField('ceSection','Section / Department',d.section,'text','e.g. Internal Medicine')+'</div>';
 h+='<div class="create-block-title">✍️ Questions <small>Write each question, enter its options, and select the correct answer.</small></div><div id="createdQuestions"></div>';
 h+='<div class="create-actions"><button class="btn primary" id="addCreatedQuestion">＋ Add Question</button><button class="btn secondary" id="generateCreatedQuestions">Generate '+esc(String(d.count))+' Question Fields</button><button class="btn primary" id="saveCreatedExam">💾 Save Exam</button><button class="btn secondary" id="startCreatedExam">▶ Start Exam</button></div>';
 h+='<div class="create-save-hint">💡 <b>Tip:</b> Save keeps the exam in the private library. Start saves it and opens a dedicated exam simulation for this exam.</div></div>';
 c.innerHTML=h;renderCreatedQuestions();bindCreateExam();
}

function bindCreateCenter(){
 document.querySelectorAll('[data-exam-view]').forEach(function(b){b.onclick=function(){
   var v=this.dataset.examView;
   if(v==='createTeacher'){createdExamDraft=null;createExamView='createTeacher';}
   else if(v==='create'){createExamView='create';}
   else createExamView=v;
   renderCreateExam();
 };});
}

function bindExamLibrary(){
 var backExam=$('backExamCenter'); if(backExam) backExam.onclick=function(){createExamView='home';renderCreateExam();};
 var libraryCreate=$('libraryCreateBtn'); if(libraryCreate) libraryCreate.onclick=function(){createExamView='create';renderCreateExam();};
 var s=$('privateExamSearch');if(s)s.oninput=function(){renderCreatedExamList(this.value);};
}

function renderPrivateExamSummary(){
 var el=$('privateExamSummary');if(!el)return;
 var xs=state.createdExams||[],qs=xs.reduce(function(n,x){return n+(Array.isArray(x.questions)?x.questions.length:0);},0);
 el.innerHTML='<div><b>'+xs.length+'</b><span>Exams</span></div><div><b>'+qs+'</b><span>Questions</span></div><div><b>100%</b><span>Private storage</span></div>';
}

function newBlankCreatedQuestion(){return {question:'',options:{A:'',B:'',C:'',D:''},correct:'A',subject:'',topic:'',title:''};}
function renderCreatedQuestions(){var el=$('createdQuestions');if(!el)return;var qs=createdExamDraft.questions||[],h='';for(var i=0;i<qs.length;i++){var q=qs[i];h+='<div class="created-question" data-qindex="'+i+'"><div class="created-q-head"><b>Question '+(i+1)+'</b><button type="button" class="remove-created-q" data-remove-q="'+i+'">Remove</button></div><label class="create-field"><span>Question</span><textarea class="select ce-question" data-q="'+i+'" rows="3" placeholder="Write the question...">'+esc(q.question)+'</textarea></label><div class="created-options">';['A','B','C','D','E'].forEach(function(k){if(k==='E'&&!q.options.E)return;h+='<label class="create-option"><span>'+k+'</span><input class="select ce-option" data-q="'+i+'" data-opt="'+k+'" value="'+esc(q.options[k]||'')+'" placeholder="Option '+k+'"></label>';});h+='</div><div class="created-q-controls"><label class="create-field"><span>Correct Answer</span><select class="select ce-correct" data-q="'+i+'">'+['A','B','C','D','E'].map(function(k){return '<option value="'+k+'"'+(q.correct===k?' selected':'')+'>'+k+'</option>';}).join('')+'</select></label><button type="button" class="small-btn add-option-e" data-add-e="'+i+'">＋ Add Option E</button></div></div>';}el.innerHTML=h||'<div class="empty-card">No questions yet. Add at least one question.</div>';}
function syncCreatedQuestions(){var qs=createdExamDraft.questions||[];document.querySelectorAll('.ce-question').forEach(function(x){var i=+x.dataset.q; if(qs[i])qs[i].question=x.value;});document.querySelectorAll('.ce-option').forEach(function(x){var i=+x.dataset.q; if(qs[i])qs[i].options[x.dataset.opt]=x.value;});document.querySelectorAll('.ce-correct').forEach(function(x){var i=+x.dataset.q; if(qs[i])qs[i].correct=x.value;});}
function bindCreateExam(){
 document.querySelectorAll('[data-create-type]').forEach(function(b){b.onclick=function(){syncCreatedQuestions();createdExamDraft.type=this.dataset.createType;renderCreateExam();};});
 ['ceTitle','ceCount','ceTime','ceProfession','ceQualification','ceCountry','ceCity','ceYear','ceDate','ceProvider','ceBank','ceSpecialty','ceInstructor','ceTeacherPhone','ceInstitution','ceSubject','ceSection'].forEach(function(id){var x=$(id);if(x)x.oninput=x.onchange=function(){createdExamDraft[({ceTitle:'title',ceCount:'count',ceTime:'time',ceProfession:'profession',ceQualification:'qualification',ceCountry:'country',ceCity:'city',ceYear:'year',ceDate:'date',ceProvider:'provider',ceBank:'bankName',ceSpecialty:'specialty',ceInstructor:'instructor',ceTeacherPhone:'teacherPhone',ceInstitution:'institution',ceSubject:'subject',ceSection:'section'}[id])]=(id==='ceProfession'?professionId(x.value):x.value);if(id==='ceProfession'){createdExamDraft.qualification='';renderCreateExam();}};});
 $('addCreatedQuestion').onclick=function(){syncCreatedQuestions();if(createdExamDraft.questions.length>=100){toast('Maximum 100 questions.');return;}createdExamDraft.questions.push(newBlankCreatedQuestion());createdExamDraft.count=createdExamDraft.questions.length;renderCreateExam();};
 $('generateCreatedQuestions').onclick=function(){syncCreatedQuestions();var n=Math.max(1,Math.min(100,parseInt($('ceCount').value||1,10)));createdExamDraft.count=n;while(createdExamDraft.questions.length<n)createdExamDraft.questions.push(newBlankCreatedQuestion());if(createdExamDraft.questions.length>n)createdExamDraft.questions=createdExamDraft.questions.slice(0,n);renderCreateExam();};
 document.querySelectorAll('[data-remove-q]').forEach(function(b){b.onclick=function(){syncCreatedQuestions();createdExamDraft.questions.splice(+this.dataset.removeQ,1);createdExamDraft.count=Math.max(1,createdExamDraft.questions.length);renderCreateExam();};});
 document.querySelectorAll('[data-add-e]').forEach(function(b){b.onclick=function(){syncCreatedQuestions();var i=+this.dataset.addE;createdExamDraft.questions[i].options.E='';renderCreateExam();};});
 var exportBtn2=$('exportCreatedExams'); if(exportBtn2) exportBtn2.onclick=exportCreatedExams;
 var importBtn2=$('importCreatedExams'); if(importBtn2) importBtn2.onclick=function(){var f=$('createdExamImportFile');if(f)f.click();};
 var importFile2=$('createdExamImportFile'); if(importFile2) importFile2.onchange=function(){if(this.files&&this.files[0])importCreatedExamsFile(this.files[0]);this.value='';};
 $('saveCreatedExam').onclick=function(){syncCreatedQuestions();if(validateCreatedExam())saveCreatedExam(false);};
 $('startCreatedExam').onclick=function(){syncCreatedQuestions();if(validateCreatedExam())saveCreatedExam(true);};
}
function validateCreatedExam(){var d=createdExamDraft;if(!d.title.trim()){toast('Enter an exam title.');return false;}if(d.questions.length<1||d.questions.length>100){toast('The exam must contain 1–100 questions.');return false;}for(var i=0;i<d.questions.length;i++){var q=d.questions[i];if(!q.question.trim()){toast('Question '+(i+1)+' is empty.');return false;}var opts=Object.keys(q.options).filter(function(k){return q.options[k]&&q.options[k].trim();});if(opts.length<2){toast('Question '+(i+1)+' needs at least 2 options.');return false;}if(!q.options[q.correct]||!q.options[q.correct].trim()){toast('Select a valid correct answer for question '+(i+1)+'.');return false;}}return true;}
function saveCreatedExam(start){var d=JSON.parse(JSON.stringify(createdExamDraft)),id='custom-'+Date.now(),qs=d.questions.map(function(q,i){var options={};Object.keys(q.options).forEach(function(k){if(q.options[k])options[k]=q.options[k];});return normalize({id:id+'-'+(i+1),questionNumber:i+1,originalQuestion:q.question,originalOptions:options,correctAnswer:{letters:[q.correct],text:q.correct+' — '+options[q.correct]},subject:q.subject||d.subject||'Custom Exam',topic:q.topic||'',title:d.title,profession:d.type==='licensure'?professionById(d.profession).label:'',qualification:d.qualification||'',country:d.country||'',governorate:d.city||'',year:d.year||'',exactDate:d.date||'',examTitle:d.title,exam:d.title,source:d.type==='teacher'?'Teacher / Doctor Created Exam':(d.type==='global'?'Global Created Exam':'Professional Licensure Created Exam'),databaseType:d.type==='global'?'global':'licensure',bankName:d.bankName||d.provider||''},i);});d.id=id;d.createdAt=new Date().toISOString();d.questions=qs;d.private=true;state.createdExams=state.createdExams||[];state.createdExams.unshift(d);if(state.createdExams.length>50)state.createdExams=state.createdExams.slice(0,50);saveCreatedExams();toast('Private exam saved separately.');if(start){privateMockContext=d;clearInterval(timer);timer=null;mock=null;show('mock');}}
function exportCreatedExams(){
 try{
  var xs=Array.isArray(state.createdExams)?state.createdExams:[];
  if(!xs.length){toast('No private created exams to export.');return;}
  var payload={format:'YMLQ_PRIVATE_EXAMS_V1',exportedAt:new Date().toISOString(),examCount:xs.length,exams:xs};
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download='my_private_created_exams.json';document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(function(){URL.revokeObjectURL(a.href);},1000);toast('Exported '+xs.length+' private exam(s).');
 }catch(e){toast('Private export failed: '+(e.message||e));}
}
function importCreatedExamsFile(file){
 var r=new FileReader();r.onload=function(){try{
  var x=JSON.parse(r.result||'{}'), incoming=Array.isArray(x)?x:(Array.isArray(x.exams)?x.exams:[]);
  if(!incoming.length)throw new Error('No private exams found in this JSON file.');
  var existing=Array.isArray(state.createdExams)?state.createdExams:[], by={};
  existing.forEach(function(e){if(e&&e.id)by[e.id]=e;});
  var added=0;
  incoming.forEach(function(e){if(!e||typeof e!=='object'||!Array.isArray(e.questions)||!e.questions.length)return;var copy=JSON.parse(JSON.stringify(e));copy.private=true;copy.id=copy.id||('imported-'+Date.now()+'-'+Math.random().toString(36).slice(2,8));if(by[copy.id])copy.id=copy.id+'-'+Date.now();copy.questions=copy.questions.map(function(q,i){q=q||{};q.id=copy.id+'-'+(i+1);q.questionNumber=i+1;return q;});by[copy.id]=copy;existing.unshift(copy);added++;});
  state.createdExams=existing.slice(0,100);saveCreatedExams();renderCreatedExamList();toast('Imported '+added+' private exam(s). They were not added to the main databases.');
 }catch(e){toast('Private import failed: '+(e.message||e));}};r.onerror=function(){toast('Could not read private exam file.');};r.readAsText(file);
}
function openCreatedExamForPractice(id){
 var x=(state.createdExams||[]).find(function(e){return e.id===id;});
 if(!x||!x.questions||!x.questions.length){toast('This private exam has no questions.');return;}
 privateMockContext=x;
 clearInterval(timer);timer=null;mock=null;
 show('mock');
}

function deleteCreatedExam(id){if(!id)return;if(!confirm('Delete this private exam?'))return;state.createdExams=(state.createdExams||[]).filter(function(e){return e.id!==id;});saveCreatedExams();renderCreatedExamList();toast('Private exam deleted.');}
function sendCreatedResultWhatsApp(ctx,score,total,percent,answers){
 var phone=(ctx&&ctx.teacherPhone||'').replace(/[^0-9]/g,'');if(!phone)phone=prompt('Enter teacher WhatsApp number with country code, e.g. 9677xxxxxxxx:','');phone=(phone||'').replace(/[^0-9]/g,'');if(!phone){toast('Teacher WhatsApp number is required.');return;}
 var lines=['Medical Exam Result','Exam: '+(ctx.title||'Private Exam'),'Student: '+((state.profile&&state.profile.name)||'Student'),'Score: '+score+' / '+total+' ('+percent+'%)','Date: '+new Date().toLocaleString(),'','Answers:'];
 var pool=(ctx&&Array.isArray(ctx.pool))?ctx.pool:[];for(var i=0;i<pool.length;i++){var q=pool[i],k=answers&&answers[q.id]||'Not answered';lines.push((i+1)+'. '+k+(isCorrect(q,k)?' ✓':' ✗'));}
 lines.push('','Sent from Yemen Medical Licence app.');
 var url='https://wa.me/'+phone+'?text='+encodeURIComponent(lines.join('\n'));window.open(url,'_blank');
}
function renderCreatedExamList(query){
 var el=$('createdExamList');if(!el)return;var xs=state.createdExams||[],q=String(query||'').trim().toLowerCase();
 if(q)xs=xs.filter(function(x){return [x.title,x.instructor,x.institution,x.subject,x.section,x.type].join(' ').toLowerCase().indexOf(q)>=0;});
 if(!xs.length){el.innerHTML='<div class="empty-card">'+(q?'No private exams match your search.':'No private exams yet. Create your first private exam.')+'</div>';return;}
 el.innerHTML=xs.slice(0,100).map(function(x){
   var type=x.type==='teacher'?'Teacher / Doctor':(x.type==='global'?'Global Exam':'Professional Licensure');
   return '<div class="created-exam-row enhanced"><div class="created-exam-main"><div class="exam-row-icon">'+(x.type==='teacher'?'👨‍🏫':x.type==='global'?'🌍':'🪪')+'</div><div><b>'+esc(x.title||'Untitled Exam')+'</b><small>🔐 Private · '+type+' · '+x.questions.length+' questions · '+esc(x.createdAt?new Date(x.createdAt).toLocaleDateString():'')+(x.instructor?' · '+esc(x.instructor):'')+(x.institution?' · '+esc(x.institution):'')+'</small></div></div><div class="created-exam-actions"><button class="small-btn primary-mini" data-start-saved="'+esc(x.id)+'">▶ Enter</button><button class="small-btn" data-export-one="'+esc(x.id)+'">⬇️ JSON</button><button class="small-btn danger-mini" data-delete-saved="'+esc(x.id)+'">🗑</button></div></div>';
 }).join('');
 document.querySelectorAll('[data-start-saved]').forEach(function(b){b.onclick=function(){openCreatedExamForPractice(this.dataset.startSaved);};});
 document.querySelectorAll('[data-delete-saved]').forEach(function(b){b.onclick=function(){deleteCreatedExam(this.dataset.deleteSaved);};});
 document.querySelectorAll('[data-export-one]').forEach(function(b){b.onclick=function(){
   var x=(state.createdExams||[]).find(function(e){return e.id===this.dataset.exportOne;}.bind(this));if(!x)return;
   var payload={format:'YMLQ_PRIVATE_EXAM_V1',exam:x};var a=document.createElement('a');
   a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
   a.download=(String(x.title||'private_exam').replace(/[^a-z0-9_-]+/gi,'_')||'private_exam')+'.json';
   document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(function(){URL.revokeObjectURL(a.href);},1000);
 };});
 renderPrivateExamSummary();
}

function renderAll(){if(currentScreen==='dashboard')renderHome();if(currentScreen==='createExam')renderCreateExam();if(currentScreen==='practice')renderPracticeSetup();if(currentScreen==='bank')renderBank();if(currentScreen==='intel')renderIntel();if(currentScreen==='analytics')renderAnalytics();if(currentScreen==='database')renderDatabase();if(currentScreen==='mistakes')renderMistakes();if(currentScreen==='saved')renderSaved();if(currentScreen==='frequency')renderFrequency();if(currentScreen==='globalSearch')renderGlobalSearch();if(currentScreen==='crossIntelligence')renderCrossIntelligence();renderSettings();}
function resetAll(){if(!window.confirm('Reset saved questions, attempts and imported database?'))return;try{localStorage.removeItem(DB_KEY);localStorage.removeItem(STATE_KEY);localStorage.removeItem('ymlq_exam_filters');localStorage.removeItem('ymlq_profile_lists');localStorage.removeItem(CREATED_EXAMS_KEY);if(window.MQIStore)window.MQIStore.clear();}catch(e){}location.reload();}
function bind(){var nav=document.querySelectorAll('[data-screen]'),i;for(i=0;i<nav.length;i++)nav[i].onclick=function(){var target=this.getAttribute('data-screen');if(target==='mock')privateMockContext=null;if(this.classList.contains('launch-license'))setAppMode('licensure');if(this.classList.contains('launch-global'))setAppMode('global');show(target);};$('soundBtn').onclick=function(){soundOn=!soundOn;renderSettings();toast(soundOn?'Sound enabled':'Sound muted');};$('settingsBtn').onclick=function(){show('settings');};$('menuBtn').onclick=function(){openNavDrawer();};$('moreNav').onclick=function(){openNavDrawer();};$('closeNav').onclick=closeNavDrawer;$('navOverlay').onclick=closeNavDrawer;$('soundToggle').onclick=function(){soundOn=!soundOn;try{localStorage.setItem('ymlq_sound',soundOn?'1':'0');}catch(e){}renderSettings();toast(soundOn?'Sound enabled':'Sound muted');};$('celebrationToggle').onclick=function(){celebrationOn=!celebrationOn;try{localStorage.setItem('ymlq_celebration',celebrationOn?'1':'0');}catch(e){}renderSettings();toast(celebrationOn?'Celebration effects enabled':'Celebration effects disabled');};$('mockLiveScoreToggle').onclick=function(){mockLiveScoreVisible=!mockLiveScoreVisible;try{localStorage.setItem('ymlq_mock_live_score',mockLiveScoreVisible?'1':'0');}catch(e){}renderSettings();toast(mockLiveScoreVisible?'Live Mock Score enabled':'Live Mock Score hidden');if(currentScreen==='mock'&&mock)renderMockQuestion();};$('importBtn').onclick=function(){$('jsonFile').click();};$('jsonFile').onchange=function(){if(this.files&&this.files[0])importJsonFile(this.files[0]);this.value='';};$('exportBtn').onclick=exportJson;$('templateBtn').onclick=downloadExamTemplate;$('syncBtn').onclick=syncFiles;$('resetBtn').onclick=resetAll;$('practiceReset').onclick=renderPracticeSetup;$('bankSearch').oninput=function(){bankPage=0;clearTimeout(bankSearchTimer);bankSearchTimer=setTimeout(renderBank,180);};}
function loadScalableCache(done){
 if(!window.MQIStore){done(false);return;}
 window.MQIStore.sample(window.MQIStore.MAX_CACHE,appMode).then(function(rows){if(rows&&rows.length){db=normalizeAll(rows);initialLoaded=1;done(true);}else done(false);}).catch(function(){done(false);});
}
function persistImportedRows(rows){if(window.MQIStore&&rows&&rows.length){return window.MQIStore.putMany(rows);}return Promise.resolve();}

function boot(){soundOn=localStorage.getItem('ymlq_sound')!=='0';celebrationOn=localStorage.getItem('ymlq_celebration')!=='0';mockLiveScoreVisible=localStorage.getItem('ymlq_mock_live_score')!=='0';loadExamFilters();loadState();loadCreatedExams();loadScalableCache(function(hasCache){if(!hasCache){var saved=loadSavedDb();if(saved){db=saved;initialLoaded=1;renderAll();}else{fetch('data/questions.json',{cache:'default'}).then(function(r){return r.json();}).then(function(x){var rows=normalizeAll(x);db=rows.slice(0,window.MQIStore?window.MQIStore.MAX_CACHE:750);if(window.MQIStore)window.MQIStore.putMany(rows);renderAll();syncFiles();}).catch(function(){db=[];renderAll();toast('Could not load database file. Use Import JSON.');});}}else renderAll();});bind();renderAll();syncFiles();}
window.addEventListener('beforeunload',function(){try{localStorage.setItem('ymlq_sound',soundOn?'1':'0');}catch(e){}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
