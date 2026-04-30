
(function(){
  var t=document.querySelector('.mobile-toggle'); var n=document.querySelector('.nav-links');
  if(t&&n){t.addEventListener('click',function(){n.classList.toggle('open')})}
})();

(function(){
  var checker=document.getElementById('lf-checker'); if(!checker) return;
  var steps=[
    {key:'goal', q:'What do you want to check today?', h:'Choose the result you care about most. You can compare phone, iPhone, tablet, and internet options later.', opts:['Free phone service','Free iPhone options','Free tablet options','Home internet help']},
    {key:'benefit', q:'Which benefit or status applies to you?', h:'Lifeline eligibility often connects with benefits like SNAP, Medicaid, SSI, Federal Public Housing, or income-based qualification.', opts:['SNAP / EBT','Medicaid','SSI or Veterans Pension','Federal Public Housing','Income-based qualification','Not sure yet']},
    {key:'state', q:'Select your state', h:'Availability, provider options, and device offers can vary by state.', type:'state'},
    {key:'status', q:'Do you already have Lifeline service?', h:'Only one Lifeline benefit is generally allowed per household. This helps avoid duplicate-benefit mistakes.', opts:['No, I am checking for the first time','I had Lifeline before but not now','Someone in my household may have it','Yes, I currently have Lifeline']},
    {key:'device', q:'Which device outcome would be most useful?', h:'Phones are more common than tablets or iPhones. Availability depends on provider rules, inventory, and eligibility.', opts:['Any reliable free phone','I want iPhone availability','I want Android availability','I want tablet availability','I only need service discount']},
    {key:'timeline', q:'How soon do you want to apply?', h:'If you are ready, the result page will show a shorter path. If not, it will show document preparation steps first.', opts:['Today','This week','After I check documents','I am just comparing options']},
    {key:'documents', q:'Which documents can you access?', h:'Most official checks require identity, benefit proof or income proof, and sometimes address information.', opts:['Photo ID and benefit letter','Photo ID and income proof','Only photo ID right now','I need a document checklist']},
    {key:'priority', q:'Choose your final result path', h:'No personal data is stored. Your result is generated in your browser based on your selections.', opts:['Show fastest apply options','Show provider comparison','Show document checklist first','Show iPhone and tablet notes']}
  ];
  var states=['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Florida','Georgia','Illinois','Indiana','Kentucky','Louisiana','Maryland','Massachusetts','Michigan','Mississippi','Missouri','Nevada','New Jersey','New Mexico','New York','North Carolina','Ohio','Oklahoma','Oregon','Pennsylvania','South Carolina','Tennessee','Texas','Virginia','Washington','Wisconsin'];
  var idx=0, answers={};
  var content=document.getElementById('check-content'), fill=document.getElementById('check-fill'), meta=document.getElementById('check-meta'), pct=document.getElementById('check-pct'), loading=document.getElementById('check-loading');
  function update(){ var p=Math.round((idx)/(steps.length)*100); fill.style.width=Math.max(8,p)+'%'; meta.textContent='Step '+(idx+1)+' of '+steps.length; pct.textContent=p+'%'; }
  function showLoad(text, cb){ loading.querySelector('b').textContent=text||'Checking options'; loading.style.display='flex'; setTimeout(function(){loading.style.display='none'; cb&&cb();}, 900); }
  function slug(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
  function resultUrl(){
    var q=new URLSearchParams(); Object.keys(answers).forEach(function(k){q.set(k,answers[k])});
    return '/results/?'+q.toString();
  }
  function render(){
    update(); var s=steps[idx]; var html='<div class="question">'+s.q+'</div><p class="help">'+s.h+'</p><div class="options">';
    if(s.type==='state'){
      html+='<select class="select" id="stateSel"><option value="">Choose your state</option>'+states.map(function(st){return '<option>'+st+'</option>'}).join('')+'</select>';
      html+='<button class="btn btn-primary" id="stateNext">Continue</button>';
    } else {
      s.opts.forEach(function(o){html+='<button class="option" data-val="'+o.replace(/"/g,'&quot;')+'"><span>'+o+'</span><b>›</b></button>'});
    }
    html+='</div><div class="checker-nav">'+(idx>0?'<button class="btn btn-soft" id="backBtn">Back</button>':'')+'</div>';
    content.innerHTML=html;
    content.querySelectorAll('.option').forEach(function(b){b.addEventListener('click',function(){ answers[s.key]=b.getAttribute('data-val'); if(idx<steps.length-1){ showLoad(idx===3?'Checking duplicate-benefit risk':idx===5?'Checking document readiness':'Matching options', function(){idx++; render();}); } else { showLoad('Preparing your result page', function(){window.location.href=resultUrl();}); } })});
    var st=document.getElementById('stateNext'); if(st){st.addEventListener('click',function(){var val=document.getElementById('stateSel').value; if(!val) return; answers[s.key]=val; showLoad('Matching providers in your state', function(){idx++; render();});})}
    var bk=document.getElementById('backBtn'); if(bk){bk.addEventListener('click',function(){idx=Math.max(0,idx-1); render();})}
  }
  render();
})();

(function(){
  var result=document.getElementById('result-summary'); if(!result) return;
  var p=new URLSearchParams(location.search); var goal=p.get('goal')||'Free phone service', benefit=p.get('benefit')||'benefit or income-based qualification', state=p.get('state')||'your state', device=p.get('device')||'a reliable phone', priority=p.get('priority')||'provider comparison';
  var score=70; if(/SNAP|Medicaid|SSI|Housing/.test(benefit)) score+=10; if(/Today|fastest/.test(priority)) score+=4; if(/iPhone|tablet/.test(goal+device)) score-=4; score=Math.max(54,Math.min(91,score));
  result.innerHTML='<div class="score"><div class="score-circle"><span>'+score+'%</span></div><div><h1>Your '+htmlEscape(goal)+' Match</h1><p class="lead">Based on your selections, the next smart step is to compare Lifeline providers, check document requirements, and confirm availability for '+htmlEscape(state)+'. This is not approval, but it gives you a clearer path before visiting a provider page.</p><div class="trust-row"><span class="pill"><b>✓</b> '+htmlEscape(benefit)+'</span><span class="pill"><b>✓</b> '+htmlEscape(device)+'</span><span class="pill"><b>✓</b> '+htmlEscape(priority)+'</span></div></div></div>';
  function htmlEscape(v){return String(v).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
})();

(function(){
  document.querySelectorAll('.faq-q').forEach(function(q){q.addEventListener('click',function(){q.parentElement.classList.toggle('open')})});
})();
