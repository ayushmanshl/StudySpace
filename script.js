(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const get = (key, fallback) => { try { const v=localStorage.getItem(key); return v===null?fallback:JSON.parse(v); } catch { return fallback; } };
  const put = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
  const toast = message => { const el=$("#toast"); el.textContent=message; el.classList.add("show"); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove("show"),2400); };
  const esc = value => String(value).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const today = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };

  const data = {
    JEE: {
      "11": {Physics:["Units and Measurements","Motion in a Straight Line","Motion in a Plane","Laws of Motion","Work, Energy and Power","Rotational Motion","Gravitation","Thermal Properties of Matter","Thermodynamics","Kinetic Theory","Oscillations","Waves"],Chemistry:["Some Basic Concepts of Chemistry","Structure of Atom","Periodicity","Chemical Bonding","Thermodynamics","Equilibrium","Redox Reactions","Organic Chemistry Basics","Hydrocarbons"],Mathematics:["Sets","Relations and Functions","Trigonometry","Complex Numbers","Permutations and Combinations","Binomial Theorem","Sequences and Series","Straight Lines","Conic Sections","Limits and Derivatives","Probability"]},
      "12": {Physics:["Electric Charges and Fields","Electrostatic Potential and Capacitance","Current Electricity","Moving Charges and Magnetism","Electromagnetic Induction","Alternating Current","Electromagnetic Waves","Ray Optics","Wave Optics","Dual Nature","Atoms and Nuclei","Semiconductor Electronics"],Chemistry:["Solutions","Electrochemistry","Chemical Kinetics","d- and f-Block Elements","Coordination Compounds","Haloalkanes and Haloarenes","Alcohols, Phenols and Ethers","Carbonyl Compounds","Amines","Biomolecules"],Mathematics:["Matrices","Determinants","Continuity and Differentiability","Applications of Derivatives","Integrals","Differential Equations","Vector Algebra","Three-Dimensional Geometry","Probability"]},
      dropper:{Physics:["Mechanics revision","Thermal Physics revision","Electrostatics","Current Electricity","Magnetism","Optics","Modern Physics"],Chemistry:["Physical Chemistry revision","Inorganic Chemistry revision","Organic Chemistry revision"],Mathematics:["Algebra revision","Trigonometry revision","Coordinate Geometry revision","Calculus revision","Vectors and 3D revision"]}
    },
    NEET: {
      "11": {Physics:["Units and Measurements","Motion in a Straight Line","Motion in a Plane","Laws of Motion","Work, Energy and Power","Rotational Motion","Gravitation","Thermal Physics","Thermodynamics","Oscillations and Waves"],Chemistry:["Basic Concepts of Chemistry","Structure of Atom","Periodicity","Chemical Bonding","Thermodynamics","Equilibrium","Redox Reactions","Organic Chemistry Basics","Hydrocarbons"],Biology:["The Living World","Biological Classification","Plant Kingdom","Animal Kingdom","Morphology of Flowering Plants","Anatomy of Flowering Plants","Cell: The Unit of Life","Biomolecules","Cell Division","Photosynthesis","Respiration in Plants","Breathing and Exchange of Gases","Body Fluids and Circulation","Excretory Products","Neural Control"]},
      "12": {Physics:["Electric Charges and Fields","Electrostatic Potential","Current Electricity","Moving Charges and Magnetism","Electromagnetic Induction","Alternating Current","Ray Optics","Wave Optics","Dual Nature","Atoms and Nuclei","Semiconductor Electronics"],Chemistry:["Solutions","Electrochemistry","Chemical Kinetics","d- and f-Block Elements","Coordination Compounds","Haloalkanes and Haloarenes","Alcohols, Phenols and Ethers","Carbonyl Compounds","Amines","Biomolecules"],Biology:["Human Reproduction","Reproductive Health","Principles of Inheritance","Molecular Basis of Inheritance","Evolution","Human Health and Disease","Microbes in Human Welfare","Biotechnology","Organisms and Populations","Ecosystem","Biodiversity and Conservation"]},
      dropper:{Physics:["Mechanics revision","Thermal Physics revision","Electricity and Magnetism","Optics","Modern Physics"],Chemistry:["Physical Chemistry revision","Inorganic Chemistry revision","Organic Chemistry revision"],Biology:["Botany revision","Human Physiology","Genetics and Evolution","Ecology revision","Biotechnology revision"]}
    }
  };
  let exam=localStorage.getItem("ss-exam")||"JEE", grade=localStorage.getItem("ss-grade")||"11";
  if(!data[exam]) exam="JEE"; if(!["11","12","dropper"].includes(grade)) grade="11";
  $("#exam").value=exam; $("#grade").value=grade;
  let chapterStatus=get("ss-chapters",{}), tasks=get("ss-tasks",[]);
  if(!Array.isArray(tasks)) tasks=[];
  $("#exam").addEventListener("change",()=>{exam=$("#exam").value;localStorage.setItem("ss-exam",exam);$("#subjectfilter").value="all";renderChapters();});
  $("#grade").addEventListener("change",()=>{grade=$("#grade").value;localStorage.setItem("ss-grade",grade);renderChapters();});

  const chapterKey=(subject,chapter)=>`${exam}|${grade}|${subject}|${chapter}`;
  function renderChapters(){
    const subjects=Object.keys(data[exam][grade]);
    if(!subjects.includes($("#subjectfilter").value)) $("#subjectfilter").value="all";
    const all=subjects.flatMap(subject=>data[exam][grade][subject].map(chapter=>({subject,chapter,status:chapterStatus[chapterKey(subject,chapter)]||"Not started"})));
    const done=all.filter(x=>x.status==="Completed").length, pct=all.length?Math.round(done/all.length*100):0;
    $("#percent").textContent=pct;$("#syllabusbar").style.width=pct+"%";$("#chaptersdone").textContent=`${done} of ${all.length} chapters completed`;
    $("#subjectsummary").innerHTML=subjects.map(subject=>{const arr=all.filter(x=>x.subject===subject),d=arr.filter(x=>x.status==="Completed").length,p=arr.length?Math.round(d/arr.length*100):0;return `<div class="subject-chip"><div><span>${subject}</span><b>${p}%</b></div><div class="track"><i style="width:${p}%"></i></div></div>`}).join("");
    const filter=$("#subjectfilter").value;
    const filtered=all.filter(x=>filter==="all"||x.subject===filter);
    $("#chapterlist").innerHTML=filtered.map(x=>{const cls=x.status.replace(" ","-");return `<tr><td><span class="chapter-name">${esc(x.chapter)}</span><span class="chapter-subject">${esc(x.subject)}</span></td><td><span class="status ${cls}">${x.status}</span></td><td><select class="chapter-select" data-subject="${esc(x.subject)}" data-chapter="${esc(x.chapter)}"><option ${x.status==="Not started"?"selected":""}>Not started</option><option ${x.status==="In progress"?"selected":""}>In progress</option><option ${x.status==="Completed"?"selected":""}>Completed</option></select></td></tr>`}).join("");
    if(!filtered.length) $("#chapterlist").innerHTML='<tr><td colspan="3">No chapters found.</td></tr>';
  }
  $("#subjectfilter").addEventListener("change",renderChapters);
  $("#chapterlist").addEventListener("change",e=>{const s=e.target.closest(".chapter-select");if(!s)return;chapterStatus[chapterKey(s.dataset.subject,s.dataset.chapter)]=s.value;put("ss-chapters",chapterStatus);renderChapters();toast("Chapter progress saved.");});

  function renderTasks(){
    $("#date").textContent=new Intl.DateTimeFormat(undefined,{month:"short",day:"numeric"}).format(new Date());
    $("#tasklist").innerHTML=tasks.map(t=>`<div class="task ${t.done?"done":""}" data-id="${esc(t.id)}"><input type="checkbox" class="taskcheck" aria-label="Complete task" ${t.done?"checked":""}><span>${esc(t.text)}</span><button class="delete" aria-label="Delete task">×</button></div>`).join("");
    $("#empty").hidden=tasks.length>0;const done=tasks.filter(t=>t.done).length;
    $("#taskdone").textContent=done;$("#tasktotal").textContent=tasks.length;$("#taskbar").style.width=(tasks.length?done/tasks.length*100:0)+"%";$("#remaining").textContent=`${tasks.length-done} task${tasks.length-done===1?"":"s"} remaining`;
  }
  $("#taskform").addEventListener("submit",e=>{e.preventDefault();const input=$("#taskinput"),text=input.value.trim();if(!text)return;tasks.unshift({id:Date.now()+"-"+Math.random().toString(36).slice(2),text,done:false});put("ss-tasks",tasks);input.value="";renderTasks();toast("Task added.");});
  $("#tasklist").addEventListener("change",e=>{if(!e.target.matches(".taskcheck"))return;const t=tasks.find(x=>x.id===e.target.closest(".task").dataset.id);if(t)t.done=e.target.checked;put("ss-tasks",tasks);renderTasks();});
  $("#tasklist").addEventListener("click",e=>{const b=e.target.closest(".delete");if(!b)return;const id=b.closest(".task").dataset.id;tasks=tasks.filter(t=>t.id!==id);put("ss-tasks",tasks);renderTasks();});
  $("#clear").addEventListener("click",()=>{tasks=tasks.filter(t=>!t.done);put("ss-tasks",tasks);renderTasks();toast("Completed tasks cleared.");});

  let preset=25,remaining=1500,running=false,endAt=null,interval=null;const circumference=2*Math.PI*96;
  let focusLog=get("ss-focus",{});
  function renderTimer(){const m=Math.floor(remaining/60),s=remaining%60;$("#time").textContent=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;$("#timerlabel").textContent=running?"FOCUS IN PROGRESS":"FOCUS TIME";$("#timercaption").textContent=running?"Stay with the task":"One thing at a time";$("#start").textContent=running?"Ⅱ Pause focus":"▶ Start focus";$("#ring").style.strokeDasharray=circumference;$("#ring").style.strokeDashoffset=circumference*(1-remaining/(preset*60));$$(".preset").forEach(b=>b.classList.toggle("active",Number(b.dataset.min)===preset));$("#focusminutes").textContent=Math.floor(Number(focusLog[today()]||0));}
  function stop(){running=false;endAt=null;if(interval)clearInterval(interval);interval=null;renderTimer();}
  function tick(){if(!running)return;remaining=Math.max(0,Math.ceil((endAt-Date.now())/1000));renderTimer();if(remaining===0){focusLog[today()]=Number(focusLog[today()]||0)+preset;put("ss-focus",focusLog);stop();remaining=preset*60;renderTimer();toast("Focus session complete. Great work!");}}
  $("#start").addEventListener("click",()=>{if(running){remaining=Math.max(0,Math.ceil((endAt-Date.now())/1000));stop();toast("Focus session paused.");return;}running=true;endAt=Date.now()+remaining*1000;interval=setInterval(tick,250);renderTimer();});
  $("#reset").addEventListener("click",()=>{stop();remaining=preset*60;renderTimer();toast("Timer reset.");});
  $$(".preset").forEach(b=>b.addEventListener("click",()=>{stop();preset=Number(b.dataset.min);remaining=preset*60;renderTimer();}));

  $$("[data-attempt]").forEach(box=>{const key="ss-attempt-"+box.dataset.attempt;box.checked=localStorage.getItem(key)==="true";box.addEventListener("change",()=>{localStorage.setItem(key,String(box.checked));toast("Attempt status saved.");});});
  $$("[data-score],[data-max]").forEach(input=>{const type=input.dataset.score?"score":"max",id=input.dataset[type],saved=localStorage.getItem(`ss-${id}-${type}`);if(saved!==null)input.value=saved;});
  $$("[data-save]").forEach(button=>{const id=button.dataset.save,score=$(`[data-score="${id}"]`),max=$(`[data-max="${id}"]`),result=$(`[data-result="${id}"]`),box=$(`[data-attempt="${id}"]`);
    function update(){const s=localStorage.getItem(`ss-${id}-score`),m=localStorage.getItem(`ss-${id}-max`);if(s===null||m===null||s===""||m===""){result.textContent="Not recorded";return;}const sn=Number(s),mn=Number(m);result.textContent=mn>0&&sn>=0&&sn<=mn?`${sn} / ${mn} (${(sn/mn*100).toFixed(1)}%)`:"Check score / maximum";}
    update();button.addEventListener("click",()=>{const s=score.value.trim(),m=max.value.trim();if(!s||!m){toast("Enter both score and maximum marks.");return;}if(!Number.isFinite(Number(s))||!Number.isFinite(Number(m))||Number(s)<0||Number(m)<=0||Number(s)>Number(m)){toast("Please check the score and maximum marks.");return;}localStorage.setItem(`ss-${id}-score`,s);localStorage.setItem(`ss-${id}-max`,m);localStorage.setItem(`ss-attempt-${id}`,"true");box.checked=true;update();toast("Score saved in this browser.");});
  });
  $$(".sidebar nav a").forEach(a=>a.addEventListener("click",()=>{$$(".sidebar nav a").forEach(n=>n.classList.remove("active"));a.classList.add("active");}));
  renderChapters();renderTasks();renderTimer();
})();