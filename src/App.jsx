import { useState, useEffect, useCallback, useRef } from "react";

// ── CONFIG: replace these to go live ───────────────────────────
const SUPABASE_URL = https:https://wpdjctyndhlwxnyzqkko.supabase.co
const SUPABASE_KEY = sb_publishable_eefk5pQipqpbdsBj55TR9w_rqd1mnMW
const LIVE = !SUPABASE_URL.includes("Ysb_publishable_mjqD2Ob2psc-3uBEOVR_8g_TX-w2l5FOUR_PROJECT");

// ── Supabase helpers ─────────────────────────────────────────────
const SB_H = () => ({ "Content-Type":"application/json", apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}`, Prefer:"return=representation" });
const sbGet  = p    => fetch(`${SUPABASE_URL}${p}`,{headers:SB_H()}).then(r=>r.json());
const sbPost = (p,b)=> fetch(`${SUPABASE_URL}${p}`,{method:"POST",  headers:SB_H(),body:JSON.stringify(b)}).then(r=>r.json());
const sbPatch= (p,b)=> fetch(`${SUPABASE_URL}${p}`,{method:"PATCH", headers:SB_H(),body:JSON.stringify(b)}).then(r=>r.json());
const sbDel  = p    => fetch(`${SUPABASE_URL}${p}`,{method:"DELETE",headers:SB_H()});
const sbImg  = async file => {
  const path=`img-${Date.now()}.${file.name.split(".").pop()}`;
  await fetch(`${SUPABASE_URL}/storage/v1/object/products/${path}`,{method:"POST",headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`,"Content-Type":file.type},body:file});
  return `${SUPABASE_URL}/storage/v1/object/public/products/${path}`;
};

// ── Local storage fallback ────────────────────────────────────────
const LS = {
  get: k=>{try{return JSON.parse(localStorage.getItem(k)||"[]");}catch{return[];}},
  set: (k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}}
};

// ── Constants ────────────────────────────────────────────────────
const OPH=7, CLH=20, PHONE="0701227713", LOC="Meru Nkubu, Kenya", PASS="sarah2024";
const shopOpen=()=>{const h=new Date().getHours();return h>=OPH&&h<CLH;};
const kes=n=>`KES ${Number(n).toLocaleString("en-KE")}`;
const COLS=["#e84393","#c9a84c","#0f3460","#7b2d8b","#16a085","#e74c3c","#2980b9","#8e44ad","#c0392b","#1abc9c"];

const CATS=[
  {id:"all",label:"All Items",icon:"✦"},
  {id:"women",label:"Women",icon:"♀"},
  {id:"men",label:"Men",icon:"♂"},
  {id:"kids",label:"Kids",icon:"★"},
  {id:"shoes-women",label:"Women's Shoes",icon:"👠"},
  {id:"shoes-men",label:"Men's Shoes",icon:"👟"},
  {id:"shoes-kids",label:"Kids' Shoes",icon:"🥿"},
  {id:"accessories",label:"Accessories",icon:"◇"},
];

const COUNTIES=["Baringo","Bomet","Bungoma","Busia","Embu","Garissa","Homa Bay","Isiolo","Kajiado",
  "Kakamega","Kericho","Kiambu","Kilifi","Kirinyaga","Kisii","Kisumu","Kitui","Kwale","Laikipia",
  "Machakos","Makueni","Mandera","Marsabit","Meru","Meru Nkubu","Migori","Mombasa","Murang'a",
  "Nairobi","Nakuru","Nandi","Narok","Nyamira","Nyandarua","Nyeri","Samburu","Siaya",
  "Taita-Taveta","Tana River","Tharaka-Nithi","Trans Nzoia","Turkana","Uasin Gishu",
  "Vihiga","Wajir","West Pokot"].sort();

// ── Design tokens ────────────────────────────────────────────────
const C = {
  bg:"#0d0a1a", surface:"#1a1030", navy:"#16213e",
  rose:"#e84393", gold:"#c9a84c", goldL:"#f5d276",
  white:"#ffffff", muted:"#8b8099",
  border:"rgba(201,168,76,0.2)", borderMid:"rgba(201,168,76,0.35)",
};

// ── Shared style helpers ─────────────────────────────────────────
const S = {
  btn: (bg,color,extra={})=>({padding:"11px 28px",borderRadius:50,border:"none",fontWeight:600,fontSize:".9rem",cursor:"pointer",fontFamily:"Georgia,serif",background:bg,color,...extra}),
  input: {width:"100%",padding:"10px 14px",borderRadius:9,border:`1px solid ${C.border}`,background:"rgba(255,255,255,.06)",color:C.white,fontSize:".86rem",marginBottom:12,outline:"none",fontFamily:"inherit"},
  card: {background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,overflow:"hidden"},
  modal: {background:C.navy,border:`1px solid ${C.border}`,borderRadius:20,padding:32,width:"100%",maxWidth:500,maxHeight:"90vh",overflowY:"auto",position:"relative"},
  overlay: {position:"fixed",inset:0,background:"rgba(0,0,0,.78)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16},
};

// ── Category badge ───────────────────────────────────────────────
const CatBadge=({cat})=>{
  const c=CATS.find(x=>x.id===cat);
  return c?<span style={{display:"inline-block",fontSize:".63rem",color:C.gold,border:`1px solid ${C.border}`,padding:"2px 8px",borderRadius:20,marginBottom:8}}>{c.icon} {c.label}</span>:null;
};

// ── Product illustration SVG ────────────────────────────────────
const ProdSVG=({category,col})=>(
  <svg viewBox="0 0 200 200" width="84" height="84" xmlns="http://www.w3.org/2000/svg" opacity="0.65">
    {category.includes("shoes")
      ?<><ellipse cx="100" cy="150" rx="75" ry="24" fill={col} opacity="0.28"/>
        <path d="M24,148 Q56,78 100,68 Q144,78 176,148Z" fill={col} opacity="0.56"/>
        <path d="M24,148 Q56,104 100,90 Q144,104 176,148" fill="none" stroke="white" strokeWidth="2" opacity="0.42"/></>
      :category==="accessories"
      ?<><circle cx="100" cy="100" r="55" fill="none" stroke={col} strokeWidth="8" opacity="0.55"/>
        <circle cx="100" cy="100" r="33" fill={col} opacity="0.25"/>
        <path d="M70,82 Q100,60 130,82 Q130,124 100,142 Q70,124 70,82Z" fill={col} opacity="0.48"/></>
      :<><path d="M100,28 Q116,18 132,28 L158,62 L142,67 L142,172 L58,172 L58,67 L42,62 L68,28 Q84,18 100,28Z" fill={col} opacity="0.58"/>
        <path d="M84,30 Q100,50 116,30" fill="none" stroke="white" strokeWidth="2" opacity="0.58"/>
        <rect x="74" y="92" width="52" height="2.5" fill="white" opacity="0.35" rx="1.2"/>
        <rect x="74" y="114" width="38" height="2.5" fill="white" opacity="0.27" rx="1.2"/></>
    }
  </svg>
);

// ── Hero background SVG ──────────────────────────────────────────
const HeroBG=()=>(
  <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice"
    style={{position:"absolute",inset:0,width:"100%",height:"100%"}} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#150824"/><stop offset="50%" stopColor="#1a1a3e"/><stop offset="100%" stopColor="#0d2137"/>
      </linearGradient>
      <linearGradient id="go" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c9a84c"/><stop offset="100%" stopColor="#f5d276"/>
      </linearGradient>
      <linearGradient id="ro" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e84393"/><stop offset="100%" stopColor="#ff6fb5"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="600" fill="url(#bg)"/>
    <circle cx="160" cy="300" r="210" fill="none" stroke="url(#go)" strokeWidth="1" opacity="0.13"/>
    <circle cx="1040" cy="300" r="170" fill="none" stroke="url(#ro)" strokeWidth="1" opacity="0.13"/>
    <g transform="translate(524,45)">
      <path d="M76,0 Q100,14 114,40 L150,208 Q164,258 126,303 Q102,328 76,303 Q50,328 26,303 Q-12,258 2,208 L38,40 Q52,14 76,0Z" fill="url(#ro)" opacity="0.11"/>
      <path d="M76,0 Q100,14 114,40 L150,208 Q164,258 126,303 Q102,328 76,303 Q50,328 26,303 Q-12,258 2,208 L38,40 Q52,14 76,0Z" fill="none" stroke="url(#go)" strokeWidth="1.2" opacity="0.48"/>
      <path d="M58,6 Q76,30 94,6" fill="none" stroke="url(#go)" strokeWidth="1.4" opacity="0.72"/>
    </g>
    {[[90,80],[270,155],[880,90],[1108,200],[640,460],[370,388],[798,360],[490,185],[758,468],[145,418]].map(([x,y],i)=>(
      <g key={i} transform={`translate(${x},${y})`} opacity="0.38">
        <line x1="-5" y1="0" x2="5" y2="0" stroke="url(#go)" strokeWidth="1"/>
        <line x1="0" y1="-5" x2="0" y2="5" stroke="url(#go)" strokeWidth="1"/>
      </g>
    ))}
    <path d="M148,30 Q182,9 216,30 L216,54 L148,54Z" fill="none" stroke="#c9a84c" strokeWidth="1.3" opacity="0.32"/>
    <line x1="182" y1="9" x2="182" y2="30" stroke="#c9a84c" strokeWidth="1.3" opacity="0.32"/>
    <path d="M952,30 Q986,9 1020,30 L1020,54 L952,54Z" fill="none" stroke="#e84393" strokeWidth="1.3" opacity="0.32"/>
    <line x1="986" y1="9" x2="986" y2="30" stroke="#e84393" strokeWidth="1.3" opacity="0.32"/>
    <path d="M0,558 Q300,520 600,558 Q900,596 1200,558 L1200,600 L0,600Z" fill="url(#go)" opacity="0.05"/>
  </svg>
);

// ══════════════════════════════════════════════════════════════════
//  COMPONENTS
// ══════════════════════════════════════════════════════════════════

function SetupBanner(){
  const [v,setV]=useState(true);
  if(!v) return null;
  return(
    <div style={{background:"linear-gradient(135deg,#130820,#0d2545)",borderBottom:`2px solid ${C.gold}`,padding:"12px 20px"}}>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",gap:12,alignItems:"flex-start"}}>
        <span style={{fontSize:"1.5rem",flexShrink:0}}>⚙️</span>
        <div style={{flex:1,fontSize:".81rem",lineHeight:1.6,color:"rgba(255,255,255,.72)"}}>
          <strong style={{color:C.goldL}}>Developer Setup: </strong>
          Replace <code style={{background:"rgba(255,255,255,.1)",padding:"1px 6px",borderRadius:4,color:C.goldL}}>SUPABASE_URL</code> &amp;{" "}
          <code style={{background:"rgba(255,255,255,.1)",padding:"1px 6px",borderRadius:4,color:C.goldL}}>SUPABASE_KEY</code> to go fully live.{" "}
          <strong style={{color:C.gold}}>Currently running in demo mode</strong> — all features work using browser storage.
        </div>
        <button onClick={()=>setV(false)} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,padding:"4px 9px",borderRadius:7,cursor:"pointer",flexShrink:0}}>✕</button>
      </div>
    </div>
  );
}

function Hero({open}){
  return(
    <div style={{position:"relative",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",paddingTop:62}}>
      <HeroBG/>
      <div style={{position:"absolute",inset:0,background:"rgba(13,10,26,.4)",zIndex:1}}/>
      <div style={{position:"relative",zIndex:2,textAlign:"center",maxWidth:820,padding:"0 22px"}}>
        {/* open/closed pill */}
        <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"7px 18px",borderRadius:30,fontSize:".77rem",fontWeight:600,marginBottom:26,
          ...(open?{color:"#4ade80",border:"1px solid rgba(74,222,128,.3)",background:"rgba(74,222,128,.09)"}:{color:"#f87171",border:"1px solid rgba(248,113,113,.3)",background:"rgba(248,113,113,.09)"})}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:"currentColor",display:"inline-block"}}/>
          {open?"Open Now":"Closed"} · {OPH}:00 AM – {CLH}:00 PM
        </div>
        <h1 style={{fontFamily:"Georgia,'Times New Roman',serif",fontSize:"clamp(2.8rem,8.5vw,5.8rem)",fontWeight:900,lineHeight:1.04,marginBottom:12}}>
          <span style={{color:C.rose}}>Sarah</span><span style={{color:C.gold}}> Fashions</span>
        </h1>
        <p style={{fontSize:".76rem",color:"rgba(255,255,255,.44)",letterSpacing:3,textTransform:"uppercase",marginBottom:8}}>MERU NKUBU, KENYA</p>
        <p style={{fontSize:".94rem",color:C.gold,marginBottom:36}}>Clothes · Shoes · Accessories — Women · Men · Kids</p>
        <div style={{display:"flex",gap:12,justifyContent:"center",marginBottom:42,flexWrap:"wrap"}}>
          <a href="#shop" style={{background:"linear-gradient(135deg,#e84393,#c4206c)",color:"#fff",padding:"12px 32px",borderRadius:50,fontWeight:700,textDecoration:"none",fontSize:".92rem",fontFamily:"inherit"}}>Shop Now</a>
          <a href="#about" style={{background:"transparent",color:C.gold,border:`1px solid ${C.gold}`,padding:"12px 32px",borderRadius:50,fontWeight:700,textDecoration:"none",fontSize:".92rem",fontFamily:"inherit"}}>Our Story</a>
        </div>
        <div style={{display:"flex",gap:20,justifyContent:"center",flexWrap:"wrap",fontSize:".77rem",color:"rgba(255,255,255,.46)"}}>
          <span>📍 {LOC}</span><span>📞 {PHONE}</span><span>🚚 Nationwide Delivery</span>
        </div>
      </div>
    </div>
  );
}

function Ticker(){
  const txt=`🚚 Nationwide Delivery — fee confirmed by seller   ·   💳 M-Pesa: ${PHONE}   ·   📍 ${LOC}   ·   🕐 Open ${OPH}am–${CLH}pm   ·   📞 WhatsApp: ${PHONE}   ·   ✦ New arrivals added by seller        `;
  return(
    <div style={{overflow:"hidden",background:"linear-gradient(90deg,#e84393,#c4206c,#e84393)",padding:"9px 0",whiteSpace:"nowrap"}}>
      <div style={{display:"inline-block",animation:"sf-ticker 32s linear infinite",fontSize:".78rem",fontWeight:500,color:"#fff"}}>
        {txt+txt}
      </div>
    </div>
  );
}

function PCard({p,onAdd}){
  const [done,setDone]=useState(false);
  const col=COLS[p.id%COLS.length];
  const [hov,setHov]=useState(false);
  return(
    <div style={{...S.card,position:"relative",transition:"transform .22s,box-shadow .22s",transform:hov?"translateY(-4px)":"none",boxShadow:hov?"0 8px 28px rgba(201,168,76,.16)":"none"}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      {p.discount>0&&<span style={{position:"absolute",top:12,left:12,background:C.rose,color:"#fff",fontSize:".65rem",fontWeight:700,padding:"3px 9px",borderRadius:20,zIndex:2}}>-{p.discount}%</span>}
      {p.featured&&<span style={{position:"absolute",top:12,right:12,background:"linear-gradient(135deg,#c9a84c,#f5d276)",color:"#0d0a1a",fontSize:".63rem",fontWeight:700,padding:"3px 9px",borderRadius:20,zIndex:2}}>✦ Featured</span>}
      <div style={{height:190,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",background:`linear-gradient(135deg,${col}14,${col}30)`}}>
        {p.image_url?<img src={p.image_url} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<ProdSVG category={p.category} col={col}/>}
      </div>
      <div style={{padding:16}}>
        <CatBadge cat={p.category}/>
        <h3 style={{fontFamily:"Georgia,serif",fontSize:"1rem",fontWeight:600,marginBottom:5,color:C.white}}>{p.name}</h3>
        {p.description&&<p style={{fontSize:".74rem",color:C.muted,lineHeight:1.55,marginBottom:11}}>{p.description}</p>}
        <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}>
          <span style={{fontSize:"1.05rem",fontWeight:700,color:C.gold}}>{kes(p.price)}</span>
          {p.original_price>p.price&&<span style={{fontSize:".79rem",color:C.muted,textDecoration:"line-through"}}>{kes(p.original_price)}</span>}
        </div>
        <p style={{fontSize:".71rem",color:C.muted,marginBottom:12}}>{p.stock>0?`${p.stock} in stock`:"Out of stock"}</p>
        <button disabled={p.stock===0} onClick={()=>{if(!p.stock)return;onAdd(p);setDone(true);setTimeout(()=>setDone(false),1600);}}
          style={{width:"100%",padding:"10px",borderRadius:8,border:`1px solid ${done?"#4ade80":p.stock===0?"#444":C.rose}`,background:done?"#4ade80":"transparent",
            color:done?"#0d0a1a":p.stock===0?"#555":C.rose,fontWeight:600,fontSize:".83rem",cursor:p.stock===0?"not-allowed":"pointer",transition:"all .2s",opacity:p.stock===0?.35:1,fontFamily:"inherit"}}>
          {done?"✓ Added!":p.stock===0?"Out of Stock":"Add to Cart"}
        </button>
      </div>
    </div>
  );
}

function CartPanel({cart,onQty,onRemove,onClose,onCheckout}){
  const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  return(
    <div style={{position:"fixed",right:0,top:0,bottom:0,width:"min(400px,100vw)",background:C.navy,borderLeft:`1px solid ${C.border}`,zIndex:200,padding:24,overflowY:"auto",boxShadow:"-5px 0 32px rgba(0,0,0,.42)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:"1.28rem",color:C.white}}>🛒 Your Cart</h2>
        <button onClick={onClose} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,padding:"5px 10px",borderRadius:7,cursor:"pointer"}}>✕</button>
      </div>
      {cart.length===0
        ?<div style={{textAlign:"center",padding:"42px 0",color:C.muted}}><div style={{fontSize:"2.8rem",marginBottom:10}}>🛒</div><p>Your cart is empty</p></div>
        :<>
          {cart.map(it=>(
            <div key={it.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${C.border}`}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:500,fontSize:".87rem",marginBottom:3,color:C.white}}>{it.name}</div>
                <div style={{color:C.gold,fontSize:".77rem"}}>{kes(it.price)} · <strong>{kes(it.price*it.qty)}</strong></div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <button onClick={()=>onQty(it.id,it.qty-1)} style={{background:C.surface,border:`1px solid ${C.border}`,color:C.white,width:24,height:24,borderRadius:5,cursor:"pointer",fontSize:".85rem"}}>−</button>
                <span style={{fontSize:".84rem",minWidth:18,textAlign:"center",color:C.white}}>{it.qty}</span>
                <button onClick={()=>onQty(it.id,it.qty+1)} style={{background:C.surface,border:`1px solid ${C.border}`,color:C.white,width:24,height:24,borderRadius:5,cursor:"pointer",fontSize:".85rem"}}>+</button>
                <button onClick={()=>onRemove(it.id)} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:".85rem",padding:"3px 6px"}}>✕</button>
              </div>
            </div>
          ))}
          <div style={{textAlign:"right",padding:"15px 0 10px",fontSize:".98rem",borderBottom:`1px solid ${C.border}`,marginBottom:10,color:C.white}}>Subtotal: <strong>{kes(total)}</strong></div>
          <div style={{background:"rgba(201,168,76,.07)",border:`1px solid ${C.border}`,borderRadius:8,padding:"11px 13px",fontSize:".77rem",color:"rgba(255,255,255,.7)",lineHeight:1.55,marginBottom:14}}>
            🚚 Delivery fee will be confirmed by Sarah after you place your order, based on your location.
          </div>
          <button onClick={onCheckout} style={{width:"100%",padding:12,background:"linear-gradient(135deg,#e84393,#c4206c)",color:"#fff",border:"none",borderRadius:50,fontWeight:700,fontSize:".92rem",cursor:"pointer",fontFamily:"inherit"}}>
            Proceed to Checkout →
          </button>
        </>
      }
    </div>
  );
}

function Checkout({cart,onClose,onPlace}){
  const [step,setStep]=useState(1);
  const [busy,setBusy]=useState(false);
  const sub=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const [f,setF]=useState({name:"",phone:"",county:"",town:"",address:"",payment:"M-Pesa",mpesa:"",notes:""});
  const sf=(k,v)=>setF(p=>({...p,[k]:v}));
  const fi=(label,key,type="text",ph="")=>(
    <div key={key}>
      <label style={{display:"block",fontSize:".72rem",color:C.muted,marginBottom:4}}>{label}</label>
      <input type={type} placeholder={ph} value={f[key]} onChange={e=>sf(key,e.target.value)} style={{...S.input}}/>
    </div>
  );
  async function place(){
    if(!f.name.trim()||!f.phone.trim()||!f.county){alert("Please fill your name, phone and county.");return;}
    setBusy(true);try{await onPlace({...f,cart,subtotal:sub});}finally{setBusy(false);}
  }
  return(
    <div style={S.overlay}>
      <div style={S.modal}>
        <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"transparent",border:`1px solid ${C.border}`,color:C.muted,padding:"5px 10px",borderRadius:7,cursor:"pointer"}}>✕</button>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:"1.48rem",marginBottom:20,color:C.white}}>Checkout</h2>
        {step===1&&<>
          <p style={{fontSize:".72rem",textTransform:"uppercase",letterSpacing:"1.4px",color:C.gold,marginBottom:14,fontWeight:600}}>Step 1 of 2 — Delivery Details</p>
          {fi("Full Name *","name","text","e.g. Jane Mwangi")}
          {fi("Phone Number *","phone","tel","e.g. 0712 345 678")}
          <label style={{display:"block",fontSize:".72rem",color:C.muted,marginBottom:4}}>County *</label>
          <select value={f.county} onChange={e=>sf("county",e.target.value)} style={{...S.input,color:f.county?C.white:C.muted}}>
            <option value="">Select your county…</option>
            {COUNTIES.map(c=><option key={c} value={c} style={{background:C.navy}}>{c}</option>)}
          </select>
          {fi("Town / Estate","town","text","e.g. Nkubu Town")}
          {fi("Specific Address / Landmark","address","text","e.g. Opp. KCB Bank")}
          <button onClick={()=>setStep(2)} style={{...S.btn("linear-gradient(135deg,#e84393,#c4206c)","#fff")}}>Continue to Payment →</button>
        </>}
        {step===2&&<>
          <p style={{fontSize:".72rem",textTransform:"uppercase",letterSpacing:"1.4px",color:C.gold,marginBottom:14,fontWeight:600}}>Step 2 of 2 — Payment</p>
          {["M-Pesa","Cash on Delivery","Bank Transfer"].map(m=>(
            <label key={m} style={{display:"flex",alignItems:"center",gap:9,padding:10,border:`1px solid ${f.payment===m?"#e84393":C.border}`,borderRadius:9,marginBottom:8,cursor:"pointer",fontSize:".86rem",color:C.white}}>
              <input type="radio" name="pay" checked={f.payment===m} onChange={()=>sf("payment",m)}/>{m}
            </label>
          ))}
          {f.payment==="M-Pesa"&&<div style={{background:"rgba(201,168,76,.07)",border:`1px solid ${C.border}`,borderRadius:9,padding:13,marginBottom:12,fontSize:".83rem",color:C.white}}>
            <p style={{marginBottom:6}}>📱 Send M-Pesa to: <strong>{PHONE}</strong> (Sarah Fashions)</p>
            <p style={{fontSize:".75rem",color:C.gold,marginBottom:8}}>Send first, then enter your confirmation code below.</p>
            {fi("M-Pesa Confirmation Code","mpesa","text","e.g. QAX1234ABC")}
          </div>}
          <label style={{display:"block",fontSize:".72rem",color:C.muted,marginBottom:4}}>Order Notes (size, colour, etc.)</label>
          <textarea value={f.notes} onChange={e=>sf("notes",e.target.value)} placeholder="Any special requests for Sarah…"
            style={{...S.input,minHeight:72,resize:"vertical"}}/>
          <div style={{background:"rgba(255,255,255,.03)",borderRadius:9,padding:13,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:".83rem",color:C.muted}}><span>Items subtotal</span><span>{kes(sub)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:".83rem",color:C.muted}}><span>Delivery fee</span><span style={{color:C.gold,fontStyle:"italic"}}>Confirmed by seller</span></div>
          </div>
          <div style={{background:"rgba(201,168,76,.07)",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 13px",fontSize:".77rem",color:"rgba(255,255,255,.7)",marginBottom:14,lineHeight:1.55}}>
            📞 Sarah will call <strong>{f.phone||"you"}</strong> to confirm delivery fee to <strong>{f.county||"your county"}</strong> before dispatching.
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setStep(1)} style={{...S.btn("transparent",C.gold,{border:`1px solid ${C.gold}`})}}>← Back</button>
            <button onClick={place} disabled={busy} style={{...S.btn("linear-gradient(135deg,#e84393,#c4206c)","#fff",{flex:1,opacity:busy?.6:1})}}>
              {busy?"Placing order…":"Place Order ✓"}
            </button>
          </div>
        </>}
      </div>
    </div>
  );
}

function OrderSuccess({o,onClose}){
  return(
    <div style={S.overlay}>
      <div style={{...S.modal,textAlign:"center",maxWidth:440}}>
        <div style={{width:66,height:66,background:"linear-gradient(135deg,#4ade80,#16a085)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.8rem",margin:"0 auto 16px"}}>✓</div>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:"1.65rem",marginBottom:10,color:C.white}}>Order Confirmed!</h2>
        <p style={{color:C.muted}}>Thank you <strong style={{color:C.white}}>{o.customer_name||o.name}</strong>!</p>
        <p style={{color:C.muted,marginTop:8,fontSize:".88rem"}}>Sarah will call <strong style={{color:C.white}}>{o.phone}</strong> to confirm delivery fee and dispatch time.</p>
        <div style={{fontSize:".95rem",color:C.gold,fontWeight:700,margin:"14px 0"}}>Subtotal: {kes(o.subtotal)}</div>
        <div style={{background:"rgba(201,168,76,.07)",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 13px",fontSize:".77rem",color:"rgba(255,255,255,.7)",marginBottom:22,lineHeight:1.55}}>
          🚚 Delivery to <strong>{o.county}</strong> — fee confirmed by seller
        </div>
        <button onClick={onClose} style={{...S.btn("linear-gradient(135deg,#e84393,#c4206c)","#fff")}}>Continue Shopping</button>
      </div>
    </div>
  );
}

function ImgUp({preview,onFile,onClear,busy}){
  const ref=useRef();
  return(
    <div style={{marginBottom:16}}>
      {preview
        ?<div>
            <img src={preview} alt="" style={{width:"100%",maxHeight:162,objectFit:"cover",borderRadius:9,border:`1px solid ${C.border}`}}/>
            {busy&&<p style={{fontSize:".79rem",color:C.gold,textAlign:"center",padding:6}}>Uploading…</p>}
            <button onClick={onClear} style={{display:"block",marginTop:7,background:"transparent",border:"1px solid #f87171",color:"#f87171",padding:"5px 13px",borderRadius:6,cursor:"pointer",fontSize:".75rem",fontFamily:"inherit"}}>✕ Remove photo</button>
          </div>
        :<label style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,border:`2px dashed ${C.border}`,borderRadius:11,padding:24,cursor:"pointer",color:C.muted,fontSize:".81rem",textAlign:"center"}}>
            <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" style={{display:"none"}}
              onChange={e=>{const f=e.target.files[0];if(f&&f.size<=3*1024*1024)onFile(f);else if(f)alert("Max 3 MB");}}/>
            <span style={{fontSize:"1.9rem"}}>📷</span>
            <span style={{color:C.muted}}>Click to upload product photo</span>
            <span style={{fontSize:".68rem",color:C.muted}}>JPG · PNG · WEBP · max 3 MB</span>
          </label>
      }
    </div>
  );
}

function SellerPanel({products,orders,onClose,onRefresh}){
  const [authed,setAuthed]=useState(false);
  const [pw,setPw]=useState("");
  const [tab,setTab]=useState("products");
  const [editId,setEditId]=useState(null);
  const [busy,setBusy]=useState(false);
  const [imgFile,setImgFile]=useState(null);
  const [imgPrev,setImgPrev]=useState(null);
  const [imgBusy,setImgBusy]=useState(false);
  const [toast,setToast]=useState(null);
  const blank={name:"",category:"women",price:"",original_price:"",description:"",stock:"",discount:"0",featured:false,image_url:null};
  const [form,setForm]=useState(blank);
  const sf=(k,v)=>setForm(p=>({...p,[k]:v}));
  const flash=(type,text)=>{setToast({type,text});setTimeout(()=>setToast(null),4000);};

  function handleImg(file){setImgFile(file);const r=new FileReader();r.onload=e=>setImgPrev(e.target.result);r.readAsDataURL(file);}
  function clearImg(){setImgFile(null);setImgPrev(null);}

  async function save(){
    if(!form.name.trim()||!form.price||!form.stock){flash("err","Name, price and stock are required.");return;}
    setBusy(true);
    try{
      let image_url=form.image_url||null;
      if(imgFile){setImgBusy(true);image_url=LIVE?await sbImg(imgFile):imgPrev;setImgBusy(false);}
      const payload={name:form.name.trim(),category:form.category,price:Number(form.price),original_price:Number(form.original_price||form.price),description:form.description.trim(),stock:Number(form.stock),discount:Number(form.discount)||0,featured:!!form.featured,image_url};
      if(LIVE){editId?await sbPatch(`/rest/v1/products?id=eq.${editId}`,payload):await sbPost("/rest/v1/products",payload);}
      else{const ex=LS.get("sf_p");LS.set("sf_p",editId?ex.map(x=>x.id===editId?{...x,...payload}:x):[{...payload,id:Date.now(),created_at:new Date().toISOString()},...ex]);}
      flash("ok",editId?"✓ Product updated — live on store!":"✓ Published — visible to customers instantly!");
      setForm(blank);setEditId(null);clearImg();onRefresh();
    }catch(e){flash("err","Error: "+e.message);setImgBusy(false);}finally{setBusy(false);}
  }

  async function del(id){
    if(!confirm("Delete this product permanently?"))return;
    try{
      LIVE?await sbDel(`/rest/v1/products?id=eq.${id}`):LS.set("sf_p",LS.get("sf_p").filter(p=>p.id!==id));
      flash("ok","✓ Product deleted.");onRefresh();
    }catch(e){flash("err",e.message);}
  }

  function startEdit(p){
    setForm({name:p.name,category:p.category,price:p.price,original_price:p.original_price||"",description:p.description||"",stock:p.stock,discount:p.discount||"0",featured:!!p.featured,image_url:p.image_url||null});
    setImgPrev(p.image_url||null);setImgFile(null);setEditId(p.id);setTab("add");
  }

  async function updateOrder(id,patch){
    try{LIVE?await sbPatch(`/rest/v1/orders?id=eq.${id}`,patch):LS.set("sf_o",LS.get("sf_o").map(o=>o.id===id?{...o,...patch}:o));onRefresh();}
    catch(e){flash("err",e.message);}
  }

  const revenue=orders.reduce((s,o)=>s+(o.subtotal||0)+(o.delivery_fee||0),0);

  if(!authed) return(
    <div style={S.overlay}>
      <div style={{...S.modal,textAlign:"center",maxWidth:380}}>
        <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"transparent",border:`1px solid ${C.border}`,color:C.muted,padding:"5px 10px",borderRadius:7,cursor:"pointer"}}>✕</button>
        <div style={{fontSize:"2.4rem",marginBottom:12}}>🔐</div>
        <h2 style={{fontFamily:"Georgia,serif",marginBottom:8,color:C.white}}>Seller Login</h2>
        <p style={{color:C.muted,marginBottom:20,fontSize:".85rem"}}>Sarah Fashions Management Panel</p>
        <input type="password" placeholder="Enter seller password" value={pw} onChange={e=>setPw(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&(pw===PASS?setAuthed(true):alert("Wrong password"))}
          style={{...S.input}}/>
        <button onClick={()=>pw===PASS?setAuthed(true):alert("Incorrect password")}
          style={{width:"100%",padding:12,background:"linear-gradient(135deg,#e84393,#c4206c)",color:"#fff",border:"none",borderRadius:50,fontWeight:700,fontSize:".92rem",cursor:"pointer",fontFamily:"inherit"}}>
          Login
        </button>
      </div>
    </div>
  );

  const fi2=(label,key,type="text",ph="")=>(
    <div key={key}>
      <label style={{display:"block",fontSize:".72rem",color:C.muted,marginBottom:4}}>{label}</label>
      <input type={type} placeholder={ph} value={form[key]} onChange={e=>sf(key,e.target.value)} style={{...S.input}}/>
    </div>
  );

  const TAB_STYLE=(t)=>({padding:"8px 18px",borderRadius:8,border:`1px solid ${tab===t?"#e84393":C.border}`,background:tab===t?"#e84393":"transparent",color:tab===t?"#fff":C.muted,cursor:"pointer",fontSize:".82rem",fontFamily:"inherit",fontWeight:tab===t?700:400});

  return(
    <div style={{position:"fixed",inset:0,background:C.bg,zIndex:400,overflowY:"auto"}}>
      <div style={{maxWidth:1200,margin:"0 auto",padding:28}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
          <div>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:"1.45rem",color:C.white}}>⚙ Seller Dashboard — Sarah Fashions</h2>
            <p style={{fontSize:".75rem",color:C.muted,marginTop:4}}>{LIVE?"🟢 Live mode — Supabase connected":"🟡 Demo mode — browser storage (connect Supabase to go live)"}</p>
          </div>
          <button onClick={onClose} style={{background:"transparent",color:C.gold,border:`1px solid ${C.gold}`,padding:"8px 16px",borderRadius:50,fontWeight:600,fontSize:".85rem",cursor:"pointer",fontFamily:"inherit"}}>✕ Close</button>
        </div>

        {/* Toast */}
        {toast&&<div style={{padding:"11px 16px",borderRadius:9,marginBottom:14,fontSize:".84rem",
          ...(toast.type==="ok"?{background:"rgba(74,222,128,.1)",border:"1px solid rgba(74,222,128,.28)",color:"#4ade80"}:{background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.28)",color:"#f87171"})}}>{toast.text}</div>}

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(138px,1fr))",gap:12,marginBottom:24}}>
          {[["📦",products.length,"Products"],["📋",orders.length,"Orders"],["🔴",products.filter(p=>p.stock===0).length,"Out of Stock"],[null,kes(revenue),"Revenue"]].map(([ic,v,l],i)=>(
            <div key={i} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:16,textAlign:"center"}}>
              <div style={{fontFamily:"Georgia,serif",fontSize:typeof v==="string"&&v.length>9?".88rem":"1.42rem",color:C.gold,fontWeight:700}}>{ic&&ic+" "}{v}</div>
              <div style={{fontSize:".67rem",color:C.muted,marginTop:3,textTransform:"uppercase",letterSpacing:1}}>{l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:6,marginBottom:22,flexWrap:"wrap"}}>
          <button style={TAB_STYLE("products")} onClick={()=>{setTab("products");setEditId(null);setForm(blank);clearImg();}}>📦 Products</button>
          <button style={TAB_STYLE("add")} onClick={()=>setTab("add")}>{editId?"✏ Edit Product":"➕ Add Product"}</button>
          <button style={TAB_STYLE("orders")} onClick={()=>setTab("orders")}>📋 Orders {orders.length>0?`(${orders.length})`:""}</button>
        </div>

        {/* Products table */}
        {tab==="products"&&(products.length===0
          ?<div style={{textAlign:"center",padding:"68px 20px",color:C.muted}}>
              <div style={{fontSize:"3.5rem",marginBottom:14}}>📦</div>
              <h3 style={{fontFamily:"Georgia,serif",fontSize:"1.28rem",color:C.white,marginBottom:8}}>No products yet</h3>
              <p>Click <strong style={{color:C.gold}}>➕ Add Product</strong> to publish your first item.</p>
              <button onClick={()=>setTab("add")} style={{marginTop:14,...S.btn("linear-gradient(135deg,#e84393,#c4206c)","#fff")}}>Add First Product</button>
            </div>
          :<div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:".82rem"}}>
                <thead>
                  <tr>{["Photo","Name","Category","Price","Stock","Featured","Actions"].map(h=>(
                    <th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:".68rem",textTransform:"uppercase",letterSpacing:1,color:C.muted,borderBottom:`1px solid ${C.border}`}}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>{products.map(p=>(
                  <tr key={p.id}>
                    <td style={{padding:"12px",borderBottom:`1px solid rgba(255,255,255,.04)`,verticalAlign:"middle"}}>
                      {p.image_url?<img src={p.image_url} alt="" style={{width:40,height:40,objectFit:"cover",borderRadius:7,border:`1px solid ${C.border}`}}/>
                        :<div style={{width:40,height:40,borderRadius:7,background:C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem"}}>👗</div>}
                    </td>
                    <td style={{padding:"12px",borderBottom:`1px solid rgba(255,255,255,.04)`,fontWeight:500,color:C.white,maxWidth:140}}>{p.name}</td>
                    <td style={{padding:"12px",borderBottom:`1px solid rgba(255,255,255,.04)`}}><CatBadge cat={p.category}/></td>
                    <td style={{padding:"12px",borderBottom:`1px solid rgba(255,255,255,.04)`,color:C.white}}>{kes(p.price)}</td>
                    <td style={{padding:"12px",borderBottom:`1px solid rgba(255,255,255,.04)`,color:p.stock===0?"#f87171":C.white,fontWeight:p.stock===0?700:400}}>{p.stock===0?"OUT":p.stock}</td>
                    <td style={{padding:"12px",borderBottom:`1px solid rgba(255,255,255,.04)`,color:C.gold}}>{p.featured?"✦":""}</td>
                    <td style={{padding:"12px",borderBottom:`1px solid rgba(255,255,255,.04)`}}>
                      <button onClick={()=>startEdit(p)} style={{padding:"5px 11px",borderRadius:5,fontSize:".72rem",cursor:"pointer",background:"transparent",border:`1px solid ${C.gold}`,color:C.gold,marginRight:4,fontFamily:"inherit"}}>Edit</button>
                      <button onClick={()=>del(p.id)} style={{padding:"5px 11px",borderRadius:5,fontSize:".72rem",cursor:"pointer",background:"transparent",border:"1px solid #f87171",color:"#f87171",fontFamily:"inherit"}}>Delete</button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
        )}

        {/* Add/Edit form */}
        {tab==="add"&&(
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:24}}>
            <h3 style={{fontFamily:"Georgia,serif",fontSize:"1.14rem",marginBottom:18,color:C.white}}>{editId?"Edit Product":"Add New Product"}</h3>
            <p style={{fontSize:".72rem",color:C.muted,marginBottom:8}}>Product Photo</p>
            <ImgUp preview={imgPrev} onFile={handleImg} onClear={clearImg} busy={imgBusy}/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(188px,1fr))",gap:"0 14px"}}>
              {fi2("Product Name *","name","text","e.g. Floral Maxi Dress")}
              {fi2("Selling Price (KES) *","price","number","e.g. 2500")}
              {fi2("Original / Crossed Price (KES)","original_price","number","e.g. 3000 (optional)")}
              {fi2("Stock Quantity *","stock","number","e.g. 10")}
              {fi2("Discount % (shown as badge)","discount","number","e.g. 20")}
              <div>
                <label style={{display:"block",fontSize:".72rem",color:C.muted,marginBottom:4}}>Category *</label>
                <select value={form.category} onChange={e=>sf("category",e.target.value)} style={{...S.input,color:C.white}}>
                  {CATS.filter(c=>c.id!=="all").map(c=><option key={c.id} value={c.id} style={{background:C.navy}}>{c.icon} {c.label}</option>)}
                </select>
              </div>
            </div>
            <label style={{display:"block",fontSize:".72rem",color:C.muted,marginBottom:4}}>Description</label>
            <textarea value={form.description} onChange={e=>sf("description",e.target.value)}
              placeholder="Describe the item — sizes, colours, fabric…"
              style={{...S.input,minHeight:74,resize:"vertical"}}/>
            <label style={{display:"flex",alignItems:"center",gap:8,fontSize:".85rem",color:C.muted,cursor:"pointer",marginBottom:18}}>
              <input type="checkbox" checked={form.featured} onChange={e=>sf("featured",e.target.checked)}/>
              Mark as Featured (shows first in shop)
            </label>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              {editId&&<button onClick={()=>{setEditId(null);setForm(blank);clearImg();setTab("products");}} style={{...S.btn("transparent",C.gold,{border:`1px solid ${C.gold}`})}}>Cancel</button>}
              <button onClick={save} disabled={busy||imgBusy} style={{...S.btn("linear-gradient(135deg,#e84393,#c4206c)","#fff",{flex:1,opacity:busy||imgBusy?.6:1})}}>
                {busy?"Saving…":imgBusy?"Uploading photo…":editId?"Save Changes →":"✓ Publish — Goes Live Instantly"}
              </button>
            </div>
          </div>
        )}

        {/* Orders */}
        {tab==="orders"&&(orders.length===0
          ?<div style={{textAlign:"center",padding:"68px 20px",color:C.muted}}>
              <div style={{fontSize:"3.5rem",marginBottom:14}}>📋</div>
              <h3 style={{fontFamily:"Georgia,serif",fontSize:"1.28rem",color:C.white,marginBottom:8}}>No orders yet</h3>
              <p>Customer orders appear here in real time.</p>
            </div>
          :<div style={{display:"flex",flexDirection:"column",gap:12}}>
              {[...orders].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).map(o=>{
                const sc={Pending:C.gold,Confirmed:"#60a5fa",Dispatched:"#a78bfa",Delivered:"#4ade80",Cancelled:"#f87171"}[o.status||"Pending"]||C.gold;
                return(
                  <div key={o.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7,flexWrap:"wrap",gap:6}}>
                      <strong style={{color:C.white}}>{o.customer_name||o.name}</strong>
                      <span style={{fontSize:".72rem",color:C.muted}}>{new Date(o.created_at).toLocaleString("en-KE")}</span>
                      <span style={{fontSize:".69rem",fontWeight:700,padding:"2px 9px",borderRadius:20,background:`${sc}18`,color:sc,border:`1px solid ${sc}44`}}>{o.status||"Pending"}</span>
                    </div>
                    <p style={{fontSize:".75rem",color:C.muted,marginBottom:4}}>📞 {o.phone} · 📍 {o.county}{o.town?", "+o.town:""}{o.address?" · 🏠 "+o.address:""}</p>
                    {o.notes&&<p style={{fontSize:".75rem",color:C.muted,marginBottom:4}}>📝 {o.notes}</p>}
                    <p style={{fontSize:".75rem",color:C.muted,marginBottom:8}}>💳 {o.payment}{(o.mpesa_code||o.mpesa)?" · "+(o.mpesa_code||o.mpesa):""}</p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>
                      {(o.items||o.cart||[]).map((it,j)=>(
                        <span key={j} style={{background:"rgba(232,67,147,.08)",border:"1px solid rgba(232,67,147,.18)",color:C.rose,fontSize:".69rem",padding:"2px 8px",borderRadius:20}}>{it.name} ×{it.qty} — {kes(it.price*it.qty)}</span>
                      ))}
                    </div>
                    <div style={{borderTop:`1px solid ${C.border}`,paddingTop:10,marginTop:4}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:".79rem",color:C.muted,padding:"3px 0"}}><span>Items subtotal</span><span>{kes(o.subtotal||0)}</span></div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:".79rem",color:C.muted,padding:"3px 0"}}>
                        <span>Delivery fee (KES)</span>
                        <input type="number" min="0" placeholder="Enter amount" defaultValue={o.delivery_fee||""}
                          onBlur={e=>updateOrder(o.id,{delivery_fee:Number(e.target.value)})}
                          style={{background:C.surface,border:`1px solid ${C.border}`,color:C.white,padding:"4px 9px",borderRadius:6,fontSize:".77rem",width:118,outline:"none",fontFamily:"inherit"}}/>
                      </div>
                      {o.delivery_fee>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:".85rem",fontWeight:700,color:C.white,borderTop:`1px solid ${C.border}`,marginTop:6,paddingTop:8}}><span>Total</span><span>{kes((o.subtotal||0)+(o.delivery_fee||0))}</span></div>}
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:5,marginTop:10,paddingTop:8,borderTop:`1px solid ${C.border}`}}>
                      <span style={{fontSize:".72rem",color:C.muted}}>Set status:</span>
                      {["Pending","Confirmed","Dispatched","Delivered","Cancelled"].map(s=>(
                        <button key={s} onClick={()=>updateOrder(o.id,{status:s})}
                          style={{padding:"3px 10px",borderRadius:20,fontSize:".69rem",cursor:"pointer",fontFamily:"inherit",
                            ...(o.status===s?{background:C.rose,border:`1px solid ${C.rose}`,color:"#fff"}:{background:"transparent",border:`1px solid ${C.border}`,color:C.muted})}}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════════════════════
export default function App(){
  const [products,setProducts]=useState([]);
  const [orders,setOrders]=useState([]);
  const [loading,setLoading]=useState(true);
  const [loadErr,setLoadErr]=useState(null);
  const [cat,setCat]=useState("all");
  const [search,setSearch]=useState("");
  const [sort,setSort]=useState("default");
  const [cart,setCart]=useState([]);
  const [showCart,setShowCart]=useState(false);
  const [checkout,setCheckout]=useState(false);
  const [success,setSuccess]=useState(null);
  const [seller,setSeller]=useState(false);
  const [open]=useState(shopOpen);
  const [syncAt,setSyncAt]=useState(null);

  const load=useCallback(async()=>{
    try{
      if(LIVE){
        const [p,o]=await Promise.all([sbGet("/rest/v1/products?select=*&order=created_at.desc"),sbGet("/rest/v1/orders?select=*&order=created_at.desc")]);
        setProducts(Array.isArray(p)?p:[]);setOrders(Array.isArray(o)?o:[]);
      }else{setProducts(LS.get("sf_p"));setOrders(LS.get("sf_o"));}
      setSyncAt(new Date());setLoadErr(null);
    }catch(e){setLoadErr("Cannot reach database: "+e.message);}
    finally{setLoading(false);}
  },[]);

  useEffect(()=>{load();const id=setInterval(load,12000);return()=>clearInterval(id);},[load]);

  const filtered=products.filter(p=>{
    const mc=cat==="all"||p.category===cat;
    const ms=!search||(p.name+" "+(p.description||"")).toLowerCase().includes(search.toLowerCase());
    return mc&&ms;
  }).sort((a,b)=>{
    if(sort==="price-asc")return a.price-b.price;
    if(sort==="price-desc")return b.price-a.price;
    if(sort==="discount")return(b.discount||0)-(a.discount||0);
    if(sort==="newest")return new Date(b.created_at)-new Date(a.created_at);
    return(b.featured?1:0)-(a.featured?1:0);
  });

  const addCart=useCallback(p=>setCart(c=>{const ex=c.find(i=>i.id===p.id);return ex?c.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...c,{...p,qty:1}];}),[]);
  const rmCart=id=>setCart(c=>c.filter(i=>i.id!==id));
  const setQty=(id,q)=>q<1?rmCart(id):setCart(c=>c.map(i=>i.id===id?{...i,qty:q}:i));

  async function placeOrder(data){
    const payload={customer_name:data.name,phone:data.phone,county:data.county,town:data.town,address:data.address,payment:data.payment,mpesa_code:data.mpesa,notes:data.notes,items:data.cart.map(i=>({id:i.id,name:i.name,price:i.price,qty:i.qty})),subtotal:data.subtotal,status:"Pending",delivery_fee:0};
    let saved;
    if(LIVE){const r=await sbPost("/rest/v1/orders",payload);saved=Array.isArray(r)?r[0]:r;}
    else{saved={...payload,id:Date.now(),created_at:new Date().toISOString()};LS.set("sf_o",[...LS.get("sf_o"),saved]);}
    setCart([]);setCheckout(false);setSuccess({...saved,name:data.name});load();
  }

  const cartCount=cart.reduce((s,i)=>s+i.qty,0);

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.white,fontFamily:"'Segoe UI',Arial,sans-serif"}}>
      {/* inject only animation keyframes — no @import */}
      <style>{`
        @keyframes sf-ticker{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}
        @keyframes sf-spin{to{transform:rotate(360deg);}}
        @keyframes sf-pulse{0%,100%{opacity:1;}50%{opacity:.28;}}
        .sf-spin{animation:sf-spin 1s linear infinite;}
        .sf-pulse{animation:sf-pulse 2s infinite;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:${C.bg};}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px;}
        input,select,textarea,button{font-family:inherit;}
        a{transition:opacity .18s;}a:hover{opacity:.8;}
      `}</style>

      {!LIVE&&<SetupBanner/>}

      {/* ── NAVBAR ── */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 26px",background:"rgba(13,10,26,.96)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:"1.4rem",fontWeight:700,letterSpacing:1}}>
          <span style={{color:C.rose}}>S</span>arah<span style={{color:C.gold}}> Fashions</span>
        </div>
        <div style={{flex:1,display:"flex",justifyContent:"center"}}>
          <div className="sf-pulse" style={{display:"flex",alignItems:"center",gap:7,fontSize:".75rem",fontWeight:600,padding:"5px 14px",borderRadius:20,border:"1px solid",
            ...(open?{color:"#4ade80",borderColor:"#4ade80",background:"rgba(74,222,128,.08)"}:{color:"#f87171",borderColor:"#f87171",background:"rgba(248,113,113,.08)"})}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:"currentColor",display:"inline-block"}}/>
            {open?"Open Now":"Closed"} · {OPH}am – {CLH}pm
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {syncAt&&<span className="sf-pulse" style={{fontSize:".57rem",color:"#4ade80",letterSpacing:.5}}>● LIVE</span>}
          <button onClick={()=>setSeller(true)} style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",color:C.gold,fontSize:".81rem",fontWeight:500,cursor:"pointer"}}>⚙ Seller</button>
          <button onClick={()=>setShowCart(true)} style={{padding:"7px 14px",borderRadius:8,border:"none",background:C.rose,color:"#fff",fontSize:".81rem",fontWeight:600,cursor:"pointer",position:"relative"}}>
            🛒 Cart{cartCount>0&&<span style={{position:"absolute",top:-6,right:-6,background:C.gold,color:C.bg,width:18,height:18,borderRadius:"50%",fontSize:".62rem",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <Hero open={open}/>

      {/* ── TICKER ── */}
      <div style={{overflow:"hidden",background:"linear-gradient(90deg,#e84393,#c4206c,#e84393)",padding:"9px 0",whiteSpace:"nowrap"}}>
        <div style={{display:"inline-block",animation:"sf-ticker 32s linear infinite",fontSize:".77rem",fontWeight:500,color:"#fff"}}>
          {`🚚 Nationwide Delivery — fee confirmed by seller   ·   💳 M-Pesa: ${PHONE}   ·   📍 ${LOC}   ·   🕐 Open ${OPH}am–${CLH}pm   ·   📞 WhatsApp: ${PHONE}   ·   ✦ New arrivals daily        `.repeat(2)}
        </div>
      </div>

      {/* ── SHOP ── */}
      <section id="shop" style={{padding:"72px 26px",maxWidth:1440,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:44}}>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"2.35rem",fontWeight:700,marginBottom:6,color:C.white}}>Our Collection</h2>
          <p style={{color:C.muted,fontSize:".92rem"}}>Curated fashion for every style &amp; every occasion</p>
        </div>

        {/* Search + sort */}
        <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
          <input placeholder="🔍 Search products…" value={search} onChange={e=>setSearch(e.target.value)}
            style={{flex:1,minWidth:185,...S.input,borderRadius:50,marginBottom:0}}/>
          <select value={sort} onChange={e=>setSort(e.target.value)}
            style={{...S.input,borderRadius:50,marginBottom:0,width:"auto",cursor:"pointer",color:C.white}}>
            <option value="default">Featured First</option>
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="discount">Biggest Discount</option>
          </select>
        </div>

        {/* Category pills */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:28}}>
          {CATS.map(c=>(
            <button key={c.id} onClick={()=>setCat(c.id)}
              style={{padding:"6px 15px",borderRadius:30,border:"1px solid",fontSize:".77rem",cursor:"pointer",whiteSpace:"nowrap",transition:"all .2s",
                ...(cat===c.id?{background:"linear-gradient(135deg,#e84393,#c4206c)",borderColor:"transparent",color:"#fff",fontWeight:700}:{background:"transparent",borderColor:C.border,color:C.muted})}}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {loading
          ?<div style={{textAlign:"center",padding:80,color:C.muted}}>
              <div className="sf-spin" style={{width:42,height:42,border:`3px solid ${C.border}`,borderTopColor:C.rose,borderRadius:"50%",margin:"0 auto 18px"}}/>
              <p>Loading products…</p>
            </div>
          :loadErr
          ?<div style={{textAlign:"center",padding:70,color:C.muted}}>
              <p style={{color:"#f87171",marginBottom:12}}>⚠ {loadErr}</p>
              <button onClick={load} style={{...S.btn("linear-gradient(135deg,#e84393,#c4206c)","#fff")}}>Retry</button>
            </div>
          :products.length===0
          ?<div style={{textAlign:"center",padding:"90px 20px",color:C.muted}}>
              <div style={{fontSize:"4rem",marginBottom:18}}>👗</div>
              <h3 style={{fontFamily:"Georgia,serif",fontSize:"1.48rem",color:C.white,marginBottom:10}}>Store is being stocked</h3>
              <p>Products appear here as soon as Sarah adds them.</p>
              <p style={{marginTop:8}}>Call or WhatsApp: <strong style={{color:C.gold}}>{PHONE}</strong></p>
            </div>
          :filtered.length===0
          ?<div style={{textAlign:"center",padding:"60px 20px",color:C.muted}}><p>No items match your search. Try a different word or category.</p></div>
          :<>
              <p style={{color:C.muted,fontSize:".79rem",marginBottom:20}}>
                {filtered.length} item{filtered.length!==1?"s":""}
                {syncAt&&<span style={{opacity:.52}}> · Last sync {syncAt.toLocaleTimeString()}</span>}
              </p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(258px,1fr))",gap:20}}>
                {filtered.map(p=><PCard key={p.id} p={p} onAdd={addCart}/>)}
              </div>
            </>
        }
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{background:C.surface,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`,padding:"70px 26px"}}>
        <div style={{maxWidth:1060,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr auto",gap:50,alignItems:"center"}}>
          <div>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:"1.95rem",marginBottom:16,color:C.white}}>About Sarah Fashions</h2>
            <p style={{color:"rgba(255,255,255,.66)",lineHeight:1.8,marginBottom:13,fontSize:".9rem"}}>Nestled in the heart of <strong style={{color:C.white}}>Meru Nkubu</strong>, Sarah Fashions is your go-to destination for quality clothes, shoes, and accessories for the whole family — men, women, and children.</p>
            <p style={{color:"rgba(255,255,255,.66)",lineHeight:1.8,marginBottom:20,fontSize:".9rem"}}>From casual everyday wear to elegant evening pieces, our collection keeps you looking your best without breaking the bank.</p>
            {[["📍",LOC],["📞",PHONE],[`🕐`,`${OPH}:00 AM – ${CLH}:00 PM daily`],["🚚","Countrywide Delivery — fee confirmed by seller"]].map(([ic,tx],i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,fontSize:".83rem",marginBottom:9}}>
                <span>{ic}</span><span style={{color:"rgba(255,255,255,.6)"}}>{tx}</span>
              </div>
            ))}
          </div>
          <div style={{flexShrink:0}}>
            <svg viewBox="0 0 240 280" xmlns="http://www.w3.org/2000/svg" width="200">
              <defs><linearGradient id="aG2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#e84393"/><stop offset="100%" stopColor="#c9a84c"/></linearGradient></defs>
              <circle cx="120" cy="138" r="110" fill="url(#aG2)" opacity="0.07"/>
              <circle cx="120" cy="138" r="78" fill="none" stroke="url(#aG2)" strokeWidth="1" opacity="0.2"/>
              <path d="M120,38 Q139,28 155,38 L180,68 L163,74 L163,234 L77,234 L77,74 L60,68 L85,38 Q101,28 120,38Z" fill="url(#aG2)" opacity="0.65"/>
              <path d="M106,40 Q120,60 134,40" fill="none" stroke="white" strokeWidth="2" opacity="0.65"/>
              <rect x="100" y="118" width="40" height="2.5" fill="white" opacity="0.45" rx="1.2"/>
              <text x="120" y="266" textAnchor="middle" fill="url(#aG2)" fontSize="10" fontFamily="serif" opacity="0.65">Style · Quality · You</text>
            </svg>
          </div>
        </div>
      </section>

      {/* ── INFO CARDS ── */}
      <section style={{padding:"70px 26px"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(218px,1fr))",gap:18}}>
          {[
            {icon:"💳",title:"Payment",rows:["M-Pesa","Cash on Delivery","Bank Transfer"],note:`M-Pesa: ${PHONE}`},
            {icon:"🚚",title:"Delivery",rows:["All 47 Counties","2–5 Business Days","Doorstep Delivery"],note:"Fee confirmed by seller per location"},
            {icon:"🔒",title:"Secure Shopping",rows:["Verified M-Pesa Payments","Order Confirmation Call","Your Data Protected"],note:"Shop with full confidence"},
            {icon:"📞",title:"Contact Us",rows:[PHONE,"Call or WhatsApp",LOC],note:`Open ${OPH}am–${CLH}pm daily`},
          ].map((c,i)=>(
            <div key={i} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:22,textAlign:"center"}}>
              <div style={{fontSize:"1.8rem",marginBottom:11}}>{c.icon}</div>
              <h3 style={{fontFamily:"Georgia,serif",fontSize:"1rem",marginBottom:10,color:C.white}}>{c.title}</h3>
              {c.rows.map((r,j)=><p key={j} style={{fontSize:".79rem",color:C.muted,marginBottom:4}}>✓ {r}</p>)}
              <p style={{fontSize:".79rem",color:C.gold,fontWeight:600,marginTop:9}}>{c.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FREE HOSTING NOTE ── */}
      <div style={{background:"rgba(201,168,76,.07)",borderTop:`1px solid rgba(201,168,76,.15)`,borderBottom:`1px solid rgba(201,168,76,.15)`,padding:"11px 20px",textAlign:"center",fontSize:".79rem",color:"rgba(255,255,255,.58)"}}>
        <strong style={{color:C.gold}}>🌐 100% Free Hosting</strong> · Netlify (frontend) + Supabase (database) · KES 0 / month
      </div>

      {/* ── FOOTER ── */}
      <footer style={{background:"#050309",borderTop:`1px solid ${C.border}`,padding:"40px 26px 16px"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:22,paddingBottom:22,borderBottom:`1px solid ${C.border}`,marginBottom:14}}>
          <div>
            <div style={{fontFamily:"Georgia,serif",fontSize:"1.28rem",fontWeight:700,marginBottom:5}}><span style={{color:C.rose}}>S</span>arah<span style={{color:C.gold}}> Fashions</span></div>
            <p style={{fontSize:".77rem",color:C.muted}}>Meru Nkubu's Premier Fashion Destination</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {[["#shop","Shop"],["#about","About"]].map(([h,l])=><a key={h} href={h} style={{color:C.muted,fontSize:".79rem",textDecoration:"none"}}>{l}</a>)}
            <span style={{color:C.muted,fontSize:".77rem"}}>{PHONE}</span>
            <span style={{color:C.muted,fontSize:".77rem"}}>{LOC}</span>
          </div>
        </div>
        <div style={{textAlign:"center",fontSize:".71rem",color:C.muted}}>© {new Date().getFullYear()} Sarah Fashions · Meru Nkubu, Kenya · All rights reserved.</div>
      </footer>

      {/* ── OVERLAYS ── */}
      {showCart&&(
        <div style={{position:"fixed",inset:0,zIndex:199}} onClick={()=>setShowCart(false)}>
          <div onClick={e=>e.stopPropagation()}>
            <CartPanel cart={cart} onQty={setQty} onRemove={rmCart} onClose={()=>setShowCart(false)} onCheckout={()=>{setShowCart(false);setCheckout(true);}}/>
          </div>
        </div>
      )}
      {checkout&&<Checkout cart={cart} onClose={()=>setCheckout(false)} onPlace={placeOrder}/>}
      {success&&<OrderSuccess o={success} onClose={()=>setSuccess(null)}/>}
      {seller&&<SellerPanel products={products} orders={orders} onClose={()=>setSeller(false)} onRefresh={load}/>}
    </div>
  );
}
