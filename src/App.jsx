import { useState, useEffect, useRef } from "react";

/* ─── DATA ─────────────────────────────────────────────────── */
const PROGRAM = [
  { id:"j1", label:"J1", title:"Pec · Biceps · Front Delts", hasCardio:true, groups:[
    { name:"Pectoraux", exercises:[
      { id:"dc_incline", name:"DC Incliné Dumbbell / Smith", sets:3, reps:"8–12" },
      { id:"dc_normal",  name:"DC Normal",                   sets:3, reps:"8–12" },
      { id:"dips",       name:"Dips / Écarté Poulie Haute",  sets:3, reps:"8–12" },
    ]},
    { name:"Front Delts", exercises:[
      { id:"ohp_j1", name:"OHP Barbell", sets:3, reps:"10–12" },
    ]},
    { name:"Biceps", exercises:[
      { id:"curl_pupitre", name:"Curl Pupitre",  sets:3, reps:"8–12"  },
      { id:"bayesian",     name:"Bayesian Curl", sets:3, reps:"Échec" },
      { id:"curl_marteau", name:"Curl Marteau",  sets:3, reps:"10–12" },
    ]},
  ]},
  { id:"j2", label:"J2", title:"Dos · Triceps · Épaules", hasCardio:true, groups:[
    { name:"Dos", exercises:[
      { id:"lats_pd",     name:"Lats Pulldown Prise Neutre",      sets:2, reps:"Échec"  },
      { id:"lats_uni",    name:"Lats Pulldown Unilatéral",        sets:2, reps:"Échec"  },
      { id:"rowing",      name:"Rowing Prise Serrée Inversée",    sets:3, reps:"10–12"  },
      { id:"tbar",        name:"T-Bar Row / Bent Over Rowing",    sets:3, reps:"10–12"  },
    ]},
    { name:"Épaules", exercises:[
      { id:"elev_lat_j2", name:"Élévation Latérale Poulie", sets:3, reps:"12–15" },
      { id:"rear_j2",     name:"Rear Delts",                sets:2, reps:"Échec"  },
    ]},
    { name:"Triceps", exercises:[
      { id:"ohte",    name:"Overhead Triceps Extension",          sets:3, reps:"10–12" },
      { id:"tri_ext", name:"Triceps Extension",                   sets:3, reps:"10–12" },
      { id:"tri_inv", name:"Extension Prise Inversée Unilatéral", sets:3, reps:"12"    },
    ]},
  ]},
  { id:"j3", label:"J3", title:"Jambes · Abdos", hasCardio:false, groups:[
    { name:"Jambes", exercises:[
      { id:"leg_press",  name:"Leg Press",   sets:4, reps:"8–10" },
      { id:"leg_ext",    name:"Leg Extension",sets:3, reps:"12"  },
      { id:"leg_curl",   name:"Leg Curl",     sets:3, reps:"12"  },
      { id:"adductors",  name:"Adducteurs",   sets:3, reps:"15"  },
      { id:"calf",       name:"Calf Raise",   sets:3, reps:"15"  },
      { id:"glutes",     name:"Glutes",       sets:3, reps:"12"  },
    ]},
    { name:"Abdos", exercises:[
      { id:"abs_poulie",  name:"Abs à la Poulie",         sets:3, reps:"Échec" },
      { id:"elev_jambes", name:"Élévation Jambes Gainées",sets:3, reps:"Échec" },
    ]},
  ]},
  { id:"j4", label:"J4", title:"Épaules · Traps", hasCardio:true, groups:[
    { name:"Deltoïdes", exercises:[
      { id:"dev_mil",       name:"Développé Militaire / OHP",  sets:3, reps:"10–12" },
      { id:"elev_lat_j4",   name:"Élévation Latérale Poulie", sets:3, reps:"Échec"  },
      { id:"ss_front",      name:"Front Raise",               sets:3, reps:"12", superset:true, ssFirst:true },
      { id:"ss_lat",        name:"Lateral Raise Dumbbell",    sets:3, reps:"12", superset:true },
      { id:"rear_poulie",   name:"Rear Delt Poulie",          sets:3, reps:"Échec"  },
    ]},
    { name:"Trapèzes", exercises:[
      { id:"shrugs_bb",  name:"Shrugs Barbell / Smith", sets:4, reps:"10" },
      { id:"shrugs_tb",  name:"T-Bar Shrugs",           sets:4, reps:"10" },
    ]},
  ]},
  { id:"j5", label:"J5", title:"Rappel HDC · Avant-Bras", hasCardio:true, groups:[
    { name:"Rappel HDC", exercises:[
      { id:"lats_r",  name:"Lats Pull Down",   sets:2, reps:"Échec" },
      { id:"dc_semi", name:"DC Semi-Incliné",  sets:2, reps:"Échec" },
      { id:"curl_r",  name:"Curl Pupitre",     sets:2, reps:"Échec" },
      { id:"tri_r",   name:"Triceps OHE",      sets:2, reps:"Échec" },
    ]},
    { name:"Avant-Bras", exercises:[
      { id:"wrist",      name:"Flexion Poignets sur Barre", sets:2, reps:"Échec" },
      { id:"ez_mart",    name:"Curl EZ Bar Marteau",        sets:2, reps:"Échec" },
      { id:"supination", name:"Supination / Pronation",     sets:2, reps:"Échec" },
    ]},
  ]},
];

const CARDIO = {
  incline:{ label:"Marche Inclinée", sessions:[{ title:"Standard", detail:"15% · 5–6 km/h · 30 min · FC 120–130 bpm" }] },
  stairs:{ label:"Escalier", sessions:[
    { title:"Endurance",    detail:"5 min niv.5 → 20 min niv.8–10 → 5 min niv.4" },
    { title:"Intervalles",  detail:"8× (1 min niv.14–16 / 1 min niv.6) + 5 min échauff/cooldown" },
    { title:"Force Cardio", detail:"Niv.12 constant · Bras actifs · 20 min" },
  ]},
};

/* ─── UTILS ─────────────────────────────────────────────────── */
const todayKey = () => new Date().toISOString().split("T")[0];
const fmtDate  = d  => new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"});
const load     = k  => { try{ const v=localStorage.getItem(k); return v?JSON.parse(v):null; }catch{ return null; }};
const save     = (k,v) => { try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} };

const GOLD="#c9a84c", GOLD2="#8a6d2e", BG="#0b0b0b", S1="#141414", S2="#1c1c1c", S3="#242424";
const BR="#2a2a2a", BR2="#333", TX="#f0ece4", TX2="#777", TX3="#444";
const RED="#c0392b";

/* ─── UTILS semaine ─────────────────────────────────────────── */
function getWeekLabel(dateStr) {
  const d = new Date(dateStr);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-S${String(week).padStart(2,"0")}`;
}

function buildWeeklyCalories(calories) {
  const weekly = {};
  Object.entries(calories).forEach(([date, sessions]) => {
    const wk = getWeekLabel(date);
    const total = Object.values(sessions).reduce((a,b)=>a+b,0);
    weekly[wk] = (weekly[wk]||0) + total;
  });
  return Object.entries(weekly).sort((a,b)=>a[0].localeCompare(b[0]));
}

/* ─── EXPORT EXCEL via SheetJS ──────────────────────────────── */
function exportExcel(weights, bodyWeights, calories, imc, objective) {
  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
  script.onload = () => {
    const XLSX = window.XLSX;
    const wb   = XLSX.utils.book_new();

    /* Sheet 1 — Charges */
    const wRows = [["Date","Exercice","Série","Charge (kg)"]];
    Object.entries(weights).forEach(([k,v])=>{
      const [date,,exRaw,setRaw]=k.split("_");
      const ex = PROGRAM.flatMap(d=>d.groups).flatMap(g=>g.exercises).find(e=>e.id===exRaw);
      wRows.push([date, ex?.name||exRaw, setRaw?.replace("s",""), parseFloat(v)||0]);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(wRows), "Charges");

    /* Sheet 2 — Poids corporel */
    const bRows = [["Date","Poids (kg)"]];
    Object.entries(bodyWeights).sort().forEach(([d,w])=>bRows.push([d,w]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(bRows), "Poids Corporel");

    /* Sheet 3 — Calories par séance */
    const cRows = [["Date","Séance","Calories brûlées"]];
    Object.entries(calories).sort().forEach(([d,sessions])=>{
      Object.entries(sessions).forEach(([sess,kcal])=>cRows.push([d,sess,kcal]));
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cRows), "Calories");

    /* Sheet 4 — Calories par semaine */
    const swRows = [["Semaine","Total calories brûlées"]];
    buildWeeklyCalories(calories).forEach(([wk,kcal])=>swRows.push([wk,kcal]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(swRows), "Calories Hebdo");

    /* Sheet 5 — Résumé */
    const latestBW = Object.entries(bodyWeights).sort((a,b)=>a[0].localeCompare(b[0])).at(-1)?.[1]||"—";
    const totalKcal = Object.values(calories).flatMap(s=>Object.values(s)).reduce((a,b)=>a+b,0);
    const exWithData = [...new Set(Object.keys(weights).map(k=>k.split("_")[1]))].length;
    const sumRows = [
      ["Données","Valeur"],
      ["Objectif", objective||"—"],
      ["Poids actuel (kg)", latestBW],
      ["IMC", imc||"—"],
      ["Total calories brûlées", totalKcal],
      ["Exercices suivis", exWithData],
      ["Export généré le", new Date().toLocaleDateString("fr-FR")],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sumRows), "Résumé");

    XLSX.writeFile(wb, `manoe_training_${todayKey()}.xlsx`);
  };
  document.head.appendChild(script);
}

/* ─── COMPONENTS ────────────────────────────────────────────── */
function Pill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flexShrink:0, padding:"9px 20px",
      background:active?GOLD:S2, border:`1px solid ${active?GOLD:BR}`,
      borderRadius:100, color:active?"#000":TX2,
      fontSize:13, fontFamily:"'Bebas Neue',sans-serif",
      letterSpacing:"0.08em", cursor:"pointer", transition:"all 0.18s",
    }}>{label}</button>
  );
}

function Card({ children, style }) {
  return <div style={{ background:S1, border:`1px solid ${BR}`, borderRadius:18, overflow:"hidden", ...style }}>{children}</div>;
}

function SectionLabel({ children }) {
  return <div style={{ fontSize:10, fontWeight:700, color:GOLD2, letterSpacing:"0.16em", textTransform:"uppercase", marginBottom:10, paddingLeft:2 }}>{children}</div>;
}

function Divider() {
  return <div style={{ height:1, background:BR, margin:"0 18px" }} />;
}

/* ─── MAIN APP ──────────────────────────────────────────────── */
export default function App() {
  const [tab,       setTab]       = useState("program");
  const [activeDay, setActiveDay] = useState("j1");
  const [cardioMode,setCardioMode]= useState("incline");
  const [weights,   setWeights]   = useState(()=>load("mg_w4")||{});
  const [bodyW,     setBodyW]     = useState(()=>load("mg_bw4")||{});
  const [calories,  setCalories]  = useState(()=>load("mg_cal4")||{});
  const [done,      setDone]      = useState(()=>load("mg_done4")||{});
  const [bwInput,   setBwInput]   = useState("");
  const [calInput,  setCalInput]  = useState("");
  const [calDay,    setCalDay]    = useState("j1");
  const [saved,     setSaved]     = useState("");
  const [histEx,    setHistEx]    = useState(null);
  const [drawerOpen,setDrawerOpen]= useState(false);
  const [objective, setObjective] = useState(()=>load("mg_obj")||"Sèche — Road to 75 kg");
  const [editObj,   setEditObj]   = useState(false);
  const [objInput,  setObjInput]  = useState("");

  /* ── helpers ── */
  const persist = (key,val,setter) => { setter(val); save(key,val); };

  const saveWeight = (exId,set,val) => {
    const k=`${todayKey()}_${exId}_s${set}`;
    persist("mg_w4",{...weights,[k]:val},setWeights);
  };
  const getWeight  = (exId,set) => weights[`${todayKey()}_${exId}_s${set}`]||"";
  const getBest    = exId => {
    const vals=Object.entries(weights).filter(([k])=>k.includes(`_${exId}_`)).map(([,v])=>parseFloat(v)).filter(v=>!isNaN(v));
    return vals.length?Math.max(...vals):null;
  };
  const getHistory = exId => {
    const entries={};
    Object.entries(weights).filter(([k])=>k.includes(`_${exId}_`)).forEach(([k,v])=>{
      const date=k.split("_")[0];
      if(!entries[date]||parseFloat(v)>entries[date]) entries[date]=parseFloat(v);
    });
    return Object.entries(entries).sort((a,b)=>a[0].localeCompare(b[0]));
  };

  const toggleSet = (exId,set) => {
    const k=`${todayKey()}_${exId}_s${set}_done`;
    persist("mg_done4",{...done,[k]:!done[k]},setDone);
  };
  const isDone    = (exId,set) => !!done[`${todayKey()}_${exId}_s${set}_done`];

  const addBodyW = () => {
    if(!bwInput) return;
    persist("mg_bw4",{...bodyW,[todayKey()]:parseFloat(bwInput)},setBodyW);
    setBwInput(""); flash("Poids enregistré ✓");
  };

  const addCalories = () => {
    if(!calInput) return;
    const today=todayKey();
    const updated={...calories,[today]:{...(calories[today]||{}),[calDay]:parseInt(calInput)}};
    persist("mg_cal4",updated,setCalories);
    setCalInput(""); flash("Calories enregistrées ✓");
  };

  const flash = msg => { setSaved(msg); setTimeout(()=>setSaved(""),2200); };

  /* ── derived ── */
  const currentDay = PROGRAM.find(d=>d.id===activeDay);
  const allEx      = currentDay.groups.flatMap(g=>g.exercises);
  const totalSets  = allEx.reduce((a,ex)=>a+ex.sets,0);
  const doneSets   = allEx.reduce((a,ex)=>a+Array.from({length:ex.sets}).filter((_,i)=>isDone(ex.id,i+1)).length,0);
  const pct        = totalSets?Math.round(doneSets/totalSets*100):0;

  const sortedBW   = Object.entries(bodyW).sort((a,b)=>a[0].localeCompare(b[0]));
  const startBW    = sortedBW[0]?.[1];
  const latestBW   = sortedBW.at(-1)?.[1];
  const bwDelta    = startBW&&latestBW?(latestBW-startBW).toFixed(1):null;

  // IMC dynamique basé sur le dernier poids enregistré
  const currentWeight = latestBW || 91;
  const HEIGHT_M = 1.78;
  const imc = (currentWeight / (HEIGHT_M * HEIGHT_M)).toFixed(1);
  const imcLabel = imc < 18.5 ? "Insuffisance" : imc < 25 ? "Normal" : imc < 30 ? "Surpoids" : "Obésité";

  // Progression des charges : nb d'exercices avec record amélioré vs début
  const allExIds = PROGRAM.flatMap(d=>d.groups).flatMap(g=>g.exercises).map(e=>e.id);
  const exWithData = allExIds.filter(id=>getBest(id)!==null).length;

  const allCalEntries = Object.entries(calories).sort((a,b)=>a[0].localeCompare(b[0])).flatMap(([date,sessions])=>
    Object.entries(sessions).map(([sess,kcal])=>({date,sess,kcal}))
  );
  const totalKcal = allCalEntries.reduce((a,e)=>a+e.kcal,0);

  // Calories cette semaine
  const now = new Date();
  const dayOfWeek = now.getDay()===0?6:now.getDay()-1;
  const weekDates = Array.from({length:7},(_,i)=>{ const d=new Date(now); d.setDate(now.getDate()-dayOfWeek+i); return d.toISOString().split("T")[0]; });
  const weekKcal = weekDates.reduce((a,d)=>a+Object.values(calories[d]||{}).reduce((x,y)=>x+y,0),0);
  const weekSessions = weekDates.filter(d=>calories[d]&&Object.keys(calories[d]).length>0).length;

  // Objectif : kg restants
  const targetMatch = objective.match(/(\d+(?:[.,]\d+)?)\s*kg/i);
  const targetKg = targetMatch ? parseFloat(targetMatch[1].replace(",",".")) : null;
  const kgLeft = targetKg && latestBW ? (latestBW - targetKg).toFixed(1) : null;

  /* ── history modal for charges ── */
  const histData = histEx ? getHistory(histEx) : [];
  const histName = histEx ? PROGRAM.flatMap(d=>d.groups).flatMap(g=>g.exercises).find(e=>e.id===histEx)?.name : "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:${BG};overscroll-behavior:none;}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        input:focus{border-color:${GOLD}!important;outline:none;}
        ::-webkit-scrollbar{width:0;height:0;}
        button{transition:opacity 0.15s;}
        button:active{opacity:0.7;}
      `}</style>

      <div style={{ minHeight:"100vh", background:BG, color:TX, fontFamily:"'Outfit',sans-serif", maxWidth:480, margin:"0 auto", paddingBottom:110 }}>

        {/* ── PROFILE DRAWER ── */}
        {drawerOpen&&(
          <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex" }}>
            {/* Backdrop */}
            <div onClick={()=>setDrawerOpen(false)} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.7)" }} />
            {/* Drawer panel */}
            <div style={{ position:"relative", width:"75%", maxWidth:300, height:"100%", background:S1, borderRight:`1px solid ${BR2}`, display:"flex", flexDirection:"column", padding:0, zIndex:51, animation:"slideIn 0.25s ease" }}>
              <style>{`@keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>

              {/* Top gradient accent */}
              <div style={{ height:3, background:`linear-gradient(90deg,${GOLD},transparent)` }} />

              {/* Avatar + name — données live */}
              <div style={{ padding:"32px 24px 24px", borderBottom:`1px solid ${BR}` }}>
                <div style={{ width:56, height:56, borderRadius:"50%", background:`linear-gradient(135deg,${GOLD2},${GOLD})`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
                  <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:"#000", letterSpacing:"0.04em" }}>M</span>
                </div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, letterSpacing:"0.08em", color:TX }}>MANOÉ</div>
                {/* Stats live */}
                <div style={{ display:"flex", gap:16, marginTop:10 }}>
                  <div>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:GOLD, letterSpacing:"0.04em" }}>{currentWeight} <span style={{ fontSize:12, color:GOLD2 }}>KG</span></div>
                    <div style={{ fontSize:10, color:TX2, marginTop:1 }}>Poids actuel</div>
                  </div>
                  <div style={{ width:1, background:BR }} />
                  <div>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:TX, letterSpacing:"0.04em" }}>{HEIGHT_M*100} <span style={{ fontSize:12, color:TX2 }}>CM</span></div>
                    <div style={{ fontSize:10, color:TX2, marginTop:1 }}>Taille</div>
                  </div>
                  <div style={{ width:1, background:BR }} />
                  <div>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:TX, letterSpacing:"0.04em" }}>{imc}</div>
                    <div style={{ fontSize:10, color:TX2, marginTop:1 }}>IMC · {imcLabel}</div>
                  </div>
                </div>
                {/* Progression objectif */}
                {kgLeft!==null&&(
                  <div style={{ marginTop:14, padding:"10px 12px", background:S2, borderRadius:10, border:`1px solid ${parseFloat(kgLeft)<=0?"#1f4a1f":BR}` }}>
                    <div style={{ fontSize:11, color:TX2, marginBottom:4 }}>
                      {parseFloat(kgLeft)<=0?"🎯 Objectif atteint !":"Reste à perdre"}
                    </div>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:parseFloat(kgLeft)<=0?GOLD:TX, letterSpacing:"0.04em" }}>
                      {parseFloat(kgLeft)>0?kgLeft+" KG":"✓"}
                    </div>
                    {parseFloat(kgLeft)>0&&bwDelta&&(
                      <div style={{ fontSize:10, color:GOLD, marginTop:3 }}>Déjà perdu : {Math.abs(parseFloat(bwDelta))} kg</div>
                    )}
                  </div>
                )}
              </div>

              {/* Objectif */}
              <div style={{ padding:"20px 24px", borderBottom:`1px solid ${BR}` }}>
                <div style={{ fontSize:10, color:GOLD2, letterSpacing:"0.14em", textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>Objectif</div>
                {editObj?(
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    <input value={objInput} onChange={e=>setObjInput(e.target.value)}
                      placeholder="Ex: Road to 75 kg"
                      style={{ padding:"10px 12px", background:S2, border:`1px solid ${GOLD}`, borderRadius:10, color:TX, fontFamily:"inherit", fontSize:13, outline:"none" }} />
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={()=>{ const v=objInput.trim()||objective; save("mg_obj",v); setObjective(v); setEditObj(false); }} style={{ flex:1, padding:"9px", background:GOLD, border:"none", borderRadius:8, color:"#000", fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", fontSize:14, cursor:"pointer" }}>OK</button>
                      <button onClick={()=>setEditObj(false)} style={{ flex:1, padding:"9px", background:S2, border:`1px solid ${BR2}`, borderRadius:8, color:TX2, fontFamily:"inherit", fontSize:13, cursor:"pointer" }}>Annuler</button>
                    </div>
                  </div>
                ):(
                  <button onClick={()=>{ setObjInput(objective); setEditObj(true); }} style={{ background:"none", border:"none", cursor:"pointer", textAlign:"left", padding:0, width:"100%" }}>
                    <div style={{ fontSize:14, fontWeight:500, color:TX, lineHeight:1.5 }}>{objective}</div>
                    <div style={{ fontSize:11, color:GOLD, marginTop:6 }}>✏️ Modifier</div>
                  </button>
                )}
              </div>

              {/* Nutrition */}
              <div style={{ padding:"20px 24px", borderBottom:`1px solid ${BR}` }}>
                <div style={{ fontSize:10, color:GOLD2, letterSpacing:"0.14em", textTransform:"uppercase", fontWeight:700, marginBottom:12 }}>Nutrition</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {[
                    { label:"Protéines", value:"185g / jour", icon:"🥩" },
                    { label:"Whey", value:"Après la séance", icon:"🥛" },
                    { label:"Jour de salle", value:"2 000 – 2 100 kcal", icon:"🏋️" },
                    { label:"Jour sans salle", value:"1 600 – 1 700 kcal", icon:"🛋️" },
                  ].map(item=>(
                    <div key={item.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:S2, borderRadius:10, border:`1px solid ${BR}` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:14 }}>{item.icon}</span>
                        <span style={{ fontSize:12, color:TX2 }}>{item.label}</span>
                      </div>
                      <span style={{ fontSize:12, fontWeight:600, color:TX }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding:"20px 24px", borderBottom:`1px solid ${BR}` }}>
                <div style={{ fontSize:10, color:GOLD2, letterSpacing:"0.14em", textTransform:"uppercase", fontWeight:700, marginBottom:12 }}>Cette semaine</div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, color:GOLD, letterSpacing:"0.04em", lineHeight:1 }}>
                  {weekKcal.toLocaleString()} <span style={{ fontSize:16, color:GOLD2 }}>KCAL</span>
                </div>
                <div style={{ fontSize:11, color:TX2, marginTop:6 }}>{weekSessions} séance{weekSessions>1?"s":""} · {totalKcal.toLocaleString()} kcal au total</div>
                <div style={{ marginTop:12, height:3, background:BR, borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${Math.min(100,Math.round(weekKcal/3000*100))}%`, background:`linear-gradient(90deg,${GOLD2},${GOLD})`, borderRadius:3 }} />
                </div>
                <div style={{ fontSize:10, color:TX2, marginTop:4 }}>Objectif semaine : 3 000 kcal</div>
              </div>

              {/* Suivi charges */}
              <div style={{ padding:"20px 24px", borderBottom:`1px solid ${BR}` }}>
                <div style={{ fontSize:10, color:GOLD2, letterSpacing:"0.14em", textTransform:"uppercase", fontWeight:700, marginBottom:12 }}>Charges suivies</div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, color:TX, letterSpacing:"0.04em", lineHeight:1 }}>
                  {exWithData} <span style={{ fontSize:16, color:TX2 }}>/ {allExIds.length}</span>
                </div>
                <div style={{ fontSize:11, color:TX2, marginTop:6 }}>exercices avec données enregistrées</div>
                <div style={{ marginTop:12, height:3, background:BR, borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${Math.round(exWithData/allExIds.length*100)}%`, background:`linear-gradient(90deg,${GOLD2},${GOLD})`, borderRadius:3 }} />
                </div>
              </div>

              {/* Export Excel */}
              <div style={{ padding:"20px 24px" }}>
                <div style={{ fontSize:10, color:GOLD2, letterSpacing:"0.14em", textTransform:"uppercase", fontWeight:700, marginBottom:12 }}>Export</div>
                <button onClick={()=>{ exportExcel(weights,bodyW,calories,imc,objective); setDrawerOpen(false); }} style={{
                  width:"100%", padding:"13px 16px", background:S2, border:`1px solid ${BR2}`,
                  borderRadius:12, color:GOLD, fontSize:13, fontWeight:600,
                  fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", gap:10,
                }}>
                  <span style={{ fontSize:18 }}>↓</span> Exporter en Excel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── HEADER ── */}
        <div style={{ background:BG, borderBottom:`1px solid ${BR}`, padding:"22px 20px 0", position:"sticky", top:0, zIndex:30 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            {/* Hamburger icon */}
            <button onClick={()=>setDrawerOpen(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:0, display:"flex", flexDirection:"column", gap:5 }}>
              <div style={{ width:22, height:2, background:GOLD, borderRadius:2 }} />
              <div style={{ width:16, height:2, background:TX2, borderRadius:2 }} />
              <div style={{ width:22, height:2, background:TX2, borderRadius:2 }} />
            </button>

            {/* Title */}
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:"0.14em", color:TX }}>PROGRAMME <span style={{ color:GOLD }}>GYM</span></div>
              <div style={{ fontSize:10, color:TX2, letterSpacing:"0.08em", marginTop:1 }}>SÈCHE · 5 JOURS</div>
            </div>

            {/* Placeholder right */}
            <div style={{ width:32 }} />
          </div>
          <div style={{ display:"flex" }}>
            {[{id:"program",label:"Programme"},{id:"charges",label:"Charges"},{id:"body",label:"Corps"},{id:"calories",label:"Calories"}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                flex:1, padding:"12px 0", background:"none", border:"none",
                borderBottom:tab===t.id?`2px solid ${GOLD}`:"2px solid transparent",
                color:tab===t.id?GOLD:TX2, fontSize:11, fontWeight:tab===t.id?600:400,
                letterSpacing:"0.04em", cursor:"pointer", fontFamily:"inherit",
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        <div style={{ padding:"20px 16px" }}>

          {/* ══════════════ PROGRAMME ══════════════ */}
          {tab==="program" && <>
            {/* Day pills */}
            <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4, marginBottom:20 }}>
              {PROGRAM.map(d=><Pill key={d.id} label={d.label} active={activeDay===d.id} onClick={()=>setActiveDay(d.id)} />)}
            </div>

            {/* Hero progress card */}
            <div style={{ background:`linear-gradient(135deg,${S1} 0%,#1a1a0f 100%)`, border:`1px solid ${BR2}`, borderRadius:20, padding:22, marginBottom:22, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${GOLD},transparent 70%)` }} />
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:"0.08em", marginBottom:3 }}>{currentDay.title}</div>
              <div style={{ fontSize:12, color:TX2, marginBottom:18 }}>{currentDay.groups.reduce((a,g)=>a+g.exercises.length,0)} exercices · {doneSets}/{totalSets} séries</div>
              <div style={{ height:4, background:BR, borderRadius:4, overflow:"hidden", marginBottom:8 }}>
                <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${GOLD2},${GOLD})`, borderRadius:4, transition:"width 0.5s ease" }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:TX2 }}>
                <span>{pct===100?"Séance terminée ✓":"Progression"}</span>
                <span style={{ color:GOLD, fontWeight:700 }}>{pct}%</span>
              </div>
            </div>

            {/* Groups */}
            {currentDay.groups.map(group=>(
              <div key={group.name} style={{ marginBottom:18 }}>
                <SectionLabel>{group.name}</SectionLabel>
                <Card>
                  {group.exercises.map((ex,idx)=>{
                    const cnt=Array.from({length:ex.sets}).filter((_,i)=>isDone(ex.id,i+1)).length;
                    const allDone=cnt===ex.sets;
                    const best=getBest(ex.id);
                    return (
                      <div key={ex.id}>
                        {ex.ssFirst && <div style={{ padding:"8px 18px 0", fontSize:9, fontWeight:700, color:"#6b5a1e", letterSpacing:"0.14em", textTransform:"uppercase" }}>⚡ Superset</div>}
                        <div style={{ padding:"15px 18px", background:allDone?"#141a10":ex.superset?"#17150a":"transparent", borderLeft:`3px solid ${allDone?GOLD:ex.superset?"#6b5a1e":"transparent"}` }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <div style={{ flex:1, paddingRight:12 }}>
                              <div style={{ fontSize:14, fontWeight:500, color:allDone?GOLD2:TX, textDecoration:allDone?"line-through":"none", opacity:allDone?0.55:1, marginBottom:3 }}>{ex.name}</div>
                              <div style={{ fontSize:11, color:TX2 }}>
                                {ex.sets} × {ex.reps}
                                {best&&<span style={{ color:GOLD, marginLeft:10 }}>↑ {best} kg</span>}
                              </div>
                            </div>
                            <div style={{ display:"flex", gap:6 }}>
                              {Array.from({length:ex.sets}).map((_,i)=>(
                                <button key={i} onClick={()=>toggleSet(ex.id,i+1)} style={{
                                  width:30, height:30, borderRadius:"50%",
                                  background:isDone(ex.id,i+1)?GOLD:S2,
                                  border:`1px solid ${isDone(ex.id,i+1)?GOLD:BR2}`,
                                  color:isDone(ex.id,i+1)?"#000":TX2,
                                  fontSize:isDone(ex.id,i+1)?12:11, fontWeight:700,
                                  display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
                                }}>{isDone(ex.id,i+1)?"✓":i+1}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                        {idx<group.exercises.length-1&&<Divider/>}
                      </div>
                    );
                  })}
                </Card>
              </div>
            ))}

            {/* Cardio */}
            {currentDay.hasCardio&&(
              <div style={{ marginBottom:18 }}>
                <SectionLabel>Cardio</SectionLabel>
                <Card>
                  <div style={{ display:"flex", borderBottom:`1px solid ${BR}` }}>
                    {Object.entries(CARDIO).map(([k,v])=>(
                      <button key={k} onClick={()=>setCardioMode(k)} style={{
                        flex:1, padding:"12px", background:cardioMode===k?"#1a1600":"none", border:"none",
                        color:cardioMode===k?GOLD:TX2, fontSize:12, fontWeight:cardioMode===k?600:400,
                        borderBottom:cardioMode===k?`2px solid ${GOLD}`:"2px solid transparent",
                        cursor:"pointer", fontFamily:"inherit",
                      }}>{v.label}</button>
                    ))}
                  </div>
                  <div style={{ padding:18 }}>
                    {CARDIO[cardioMode].sessions.map((s,i)=>(
                      <div key={i} style={{ marginBottom:i<CARDIO[cardioMode].sessions.length-1?14:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:TX, marginBottom:4 }}>{s.title}</div>
                        <div style={{ fontSize:12, color:TX2, lineHeight:1.7 }}>{s.detail}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </>}

          {/* ══════════════ CHARGES ══════════════ */}
          {tab==="charges" && <>
            {/* History modal */}
            {histEx&&(
              <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:50, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
                <div style={{ background:S1, border:`1px solid ${BR2}`, borderRadius:"24px 24px 0 0", padding:24, maxHeight:"70vh", overflowY:"auto" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                    <div>
                      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:"0.06em", color:TX }}>{histName}</div>
                      <div style={{ fontSize:11, color:TX2, marginTop:2 }}>Historique des charges</div>
                    </div>
                    <button onClick={()=>setHistEx(null)} style={{ background:S2, border:`1px solid ${BR2}`, borderRadius:8, padding:"6px 14px", color:TX2, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>✕</button>
                  </div>
                  {histData.length===0?(
                    <div style={{ fontSize:13, color:TX2, textAlign:"center", padding:"20px 0" }}>Aucune donnée enregistrée.</div>
                  ):(
                    <>
                      {/* Mini bar chart */}
                      <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:80, marginBottom:20 }}>
                        {histData.map(([date,w],idx)=>{
                          const all=histData.map(x=>x[1]);
                          const mn=Math.min(...all)-1, mx=Math.max(...all)+1;
                          const h=Math.max(8,((w-mn)/(mx-mn))*72);
                          const isLast=idx===histData.length-1;
                          return (
                            <div key={date} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                              <div style={{ width:"100%", height:h, background:isLast?GOLD:S3, border:`1px solid ${isLast?GOLD:BR2}`, borderRadius:4 }} />
                              <span style={{ fontSize:9, color:TX2 }}>{w}</span>
                            </div>
                          );
                        })}
                      </div>
                      {[...histData].reverse().map(([date,w],idx)=>(
                        <div key={date} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 0", borderBottom:`1px solid ${BR}` }}>
                          <span style={{ fontSize:13, color:TX2 }}>{fmtDate(date)}</span>
                          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:idx===0?GOLD:TX, letterSpacing:"0.04em" }}>{w} KG</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}

            <div style={{ fontSize:12, color:TX2, marginBottom:18, padding:"13px 16px", background:S1, borderRadius:12, border:`1px solid ${BR}`, lineHeight:1.7 }}>
              Enregistre tes charges. Appuie sur un exercice pour voir son historique.
            </div>
            {PROGRAM.map(day=>(
              <div key={day.id} style={{ marginBottom:20 }}>
                <SectionLabel>{day.label} — {day.title}</SectionLabel>
                <Card>
                  {day.groups.flatMap(g=>g.exercises).map((ex,idx,arr)=>{
                    const best=getBest(ex.id);
                    return (
                      <div key={ex.id}>
                        <div style={{ padding:"15px 18px" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                            <button onClick={()=>setHistEx(ex.id)} style={{ background:"none", border:"none", cursor:"pointer", textAlign:"left", padding:0 }}>
                              <div style={{ fontSize:13, fontWeight:500, color:TX }}>{ex.name}</div>
                              <div style={{ fontSize:11, color:GOLD, marginTop:2 }}>{best?`↑ Record: ${best} kg`:"Appuie pour voir l'historique →"}</div>
                            </button>
                          </div>
                          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                            {Array.from({length:ex.sets}).map((_,i)=>(
                              <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                                <span style={{ fontSize:9, color:TX3, fontWeight:700, letterSpacing:"0.08em" }}>S{i+1}</span>
                                <input type="number" placeholder="—" value={getWeight(ex.id,i+1)} onChange={e=>saveWeight(ex.id,i+1,e.target.value)}
                                  style={{ width:56, padding:"9px 4px", textAlign:"center", background:S2, border:`1px solid ${BR2}`, borderRadius:10, color:TX, fontFamily:"inherit", fontSize:14, fontWeight:600 }} />
                              </div>
                            ))}
                          </div>
                        </div>
                        {idx<arr.length-1&&<Divider/>}
                      </div>
                    );
                  })}
                </Card>
              </div>
            ))}
          </>}

          {/* ══════════════ CORPS ══════════════ */}
          {tab==="body" && <>
            {bwDelta!==null&&(
              <div style={{ background:parseFloat(bwDelta)>0?"#1a0808":"#0a140a", border:`1px solid ${parseFloat(bwDelta)>0?"#5a1f1f":"#1f4a1f"}`, borderRadius:18, padding:22, marginBottom:16 }}>
                <div style={{ fontSize:10, color:TX2, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8 }}>Évolution</div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:48, letterSpacing:"0.04em", color:parseFloat(bwDelta)>0?RED:GOLD, lineHeight:1 }}>
                  {parseFloat(bwDelta)>0?"+":""}{bwDelta} KG
                </div>
                <div style={{ fontSize:12, color:TX2, marginTop:10 }}>
                  Départ <b style={{ color:TX }}>{startBW} kg</b> → Actuel <b style={{ color:GOLD }}>{latestBW} kg</b>
                </div>
              </div>
            )}

            <Card style={{ marginBottom:16 }}>
              <div style={{ padding:18 }}>
                <div style={{ fontSize:11, color:TX2, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:14 }}>Enregistrer aujourd'hui</div>
                <div style={{ display:"flex", gap:10 }}>
                  <input type="number" step="0.1" placeholder="Poids en kg" value={bwInput} onChange={e=>setBwInput(e.target.value)}
                    style={{ flex:1, padding:"13px 16px", background:S2, border:`1px solid ${BR2}`, borderRadius:12, color:TX, fontFamily:"inherit", fontSize:16, fontWeight:600 }} />
                  <button onClick={addBodyW} style={{ padding:"13px 20px", background:GOLD, border:"none", borderRadius:12, color:"#000", fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", fontSize:16, letterSpacing:"0.06em", cursor:"pointer" }}>OK</button>
                </div>
                {saved&&<div style={{ marginTop:10, fontSize:12, color:GOLD, fontWeight:600 }}>{saved}</div>}
              </div>
            </Card>

            {sortedBW.length>=2&&(
              <Card style={{ padding:18, marginBottom:16 }}>
                <div style={{ fontSize:11, color:TX2, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:16 }}>Courbe</div>
                <div style={{ display:"flex", alignItems:"flex-end", gap:5, height:90 }}>
                  {sortedBW.map(([date,w],idx)=>{
                    const all=sortedBW.map(x=>x[1]);
                    const mn=Math.min(...all)-0.5, mx=Math.max(...all)+0.5;
                    const h=Math.max(8,((w-mn)/(mx-mn))*80);
                    const isLast=idx===sortedBW.length-1;
                    return (
                      <div key={date} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                        <div style={{ width:"100%", height:h, background:isLast?GOLD:S3, border:`1px solid ${isLast?GOLD:BR2}`, borderRadius:5 }} />
                        <span style={{ fontSize:9, color:TX2 }}>{w}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            <Card style={{ overflow:"hidden" }}>
              <div style={{ padding:"14px 18px", borderBottom:`1px solid ${BR}` }}>
                <span style={{ fontSize:11, color:TX2, letterSpacing:"0.08em", textTransform:"uppercase" }}>Historique</span>
              </div>
              {sortedBW.length===0?(
                <div style={{ padding:18, fontSize:13, color:TX2 }}>Aucune entrée pour l'instant.</div>
              ):(
                [...sortedBW].reverse().map(([date,w],idx)=>(
                  <div key={date} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px", background:idx===0?"#1a1600":"transparent", borderBottom:`1px solid ${BR}` }}>
                    <span style={{ fontSize:13, color:TX2 }}>{fmtDate(date)}</span>
                    <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:idx===0?GOLD:TX, letterSpacing:"0.04em" }}>{w} KG</span>
                  </div>
                ))
              )}
            </Card>
          </>}

          {/* ══════════════ CALORIES ══════════════ */}
          {tab==="calories" && <>
            {/* Total banner */}
            <div style={{ background:`linear-gradient(135deg,${S1},#1a1400)`, border:`1px solid ${BR2}`, borderRadius:18, padding:22, marginBottom:16, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${GOLD},transparent 60%)` }} />
              <div style={{ fontSize:10, color:TX2, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6 }}>Total brûlé</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:48, color:GOLD, letterSpacing:"0.04em", lineHeight:1 }}>
                {totalKcal.toLocaleString()} <span style={{ fontSize:22, color:GOLD2 }}>KCAL</span>
              </div>
              <div style={{ fontSize:12, color:TX2, marginTop:8 }}>{allCalEntries.length} séances enregistrées</div>
            </div>

            {/* Input */}
            <Card style={{ marginBottom:16 }}>
              <div style={{ padding:18 }}>
                <div style={{ fontSize:11, color:TX2, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:14 }}>Enregistrer une séance</div>
                <div style={{ display:"flex", gap:8, marginBottom:12, overflowX:"auto", paddingBottom:4 }}>
                  {PROGRAM.map(d=><Pill key={d.id} label={d.label} active={calDay===d.id} onClick={()=>setCalDay(d.id)} />)}
                </div>
                <div style={{ fontSize:12, color:TX2, marginBottom:10 }}>{PROGRAM.find(d=>d.id===calDay)?.title}</div>
                <div style={{ display:"flex", gap:10 }}>
                  <input type="number" placeholder="Calories brûlées" value={calInput} onChange={e=>setCalInput(e.target.value)}
                    style={{ flex:1, padding:"13px 16px", background:S2, border:`1px solid ${BR2}`, borderRadius:12, color:TX, fontFamily:"inherit", fontSize:16, fontWeight:600 }} />
                  <button onClick={addCalories} style={{ padding:"13px 20px", background:GOLD, border:"none", borderRadius:12, color:"#000", fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", fontSize:16, letterSpacing:"0.06em", cursor:"pointer" }}>OK</button>
                </div>
                {saved&&<div style={{ marginTop:10, fontSize:12, color:GOLD, fontWeight:600 }}>{saved}</div>}
              </div>
            </Card>

            {/* Bar chart */}
            {allCalEntries.length>=2&&(
              <Card style={{ padding:18, marginBottom:16 }}>
                <div style={{ fontSize:11, color:TX2, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:16 }}>Évolution des calories</div>
                <div style={{ display:"flex", alignItems:"flex-end", gap:5, height:90 }}>
                  {allCalEntries.map(({date,sess,kcal},idx)=>{
                    const all=allCalEntries.map(e=>e.kcal);
                    const mx=Math.max(...all);
                    const h=Math.max(8,(kcal/mx)*80);
                    const isLast=idx===allCalEntries.length-1;
                    return (
                      <div key={`${date}_${sess}`} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                        <div style={{ width:"100%", height:h, background:isLast?GOLD:S3, border:`1px solid ${isLast?GOLD:BR2}`, borderRadius:5 }} />
                        <span style={{ fontSize:9, color:TX2 }}>{kcal}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* History */}
            <Card style={{ overflow:"hidden" }}>
              <div style={{ padding:"14px 18px", borderBottom:`1px solid ${BR}` }}>
                <span style={{ fontSize:11, color:TX2, letterSpacing:"0.08em", textTransform:"uppercase" }}>Historique</span>
              </div>
              {allCalEntries.length===0?(
                <div style={{ padding:18, fontSize:13, color:TX2 }}>Aucune séance enregistrée.</div>
              ):(
                [...allCalEntries].reverse().map(({date,sess,kcal},idx)=>(
                  <div key={`${date}_${sess}`} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px", background:idx===0?"#1a1600":"transparent", borderBottom:`1px solid ${BR}` }}>
                    <div>
                      <div style={{ fontSize:13, color:TX2 }}>{fmtDate(date)}</div>
                      <div style={{ fontSize:11, color:TX3, marginTop:2 }}>{PROGRAM.find(d=>d.id===sess)?.title||sess}</div>
                    </div>
                    <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:idx===0?GOLD:TX, letterSpacing:"0.04em" }}>{kcal} KCAL</span>
                  </div>
                ))
              )}
            </Card>
          </>}

        </div>
      </div>
    </>
  );
}
