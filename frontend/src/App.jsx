import { useState, useEffect, useRef } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API = "http://127.0.0.1:8000";

// ─── THEME ───────────────────────────────────────────────────────────────────
const C = {
  bg:         "#0F0E0B",
  bg2:        "#161410",
  bg3:        "#1D1A14",
  border:     "rgba(245,166,35,0.12)",
  border2:    "rgba(245,166,35,0.28)",
  amber:      "#F5A623",
  amberBright:"#FFB944",
  green:      "#3ECF8E",
  greenDim:   "rgba(62,207,142,0.12)",
  amberDim:   "rgba(245,166,35,0.09)",
  amberDim2:  "rgba(245,166,35,0.17)",
  text:       "#F0E6D3",
  muted:      "#7A6E5F",
  muted2:     "#A89880",
  danger:     "#E05252",
  gradBtn:    "linear-gradient(135deg, #F5A623, #E8521A)",
  gradCard:   "linear-gradient(135deg, rgba(245,166,35,0.08), rgba(232,130,26,0.04))",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; font-family: 'Sora', sans-serif; }
  ::selection { background: rgba(245,166,35,0.28); }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(245,166,35,0.18); border-radius: 4px; }
  input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px #1D1A14 inset !important;
    -webkit-text-fill-color: #F0E6D3 !important;
  }
  @keyframes float    { 0%{transform:translateY(0) scale(1);} 100%{transform:translateY(-22px) scale(1.05);} }
  @keyframes slideDown{ from{opacity:0;transform:translateY(-14px);} to{opacity:1;transform:translateY(0);} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(18px);} to{opacity:1;transform:translateY(0);} }
  @keyframes fadeIn   { from{opacity:0;} to{opacity:1;} }
  @keyframes scaleIn  { from{opacity:0;transform:scale(0.94);} to{opacity:1;transform:scale(1);} }
  @keyframes pulse    { 0%,100%{opacity:0.3;transform:scale(0.75);} 50%{opacity:1;transform:scale(1);} }
  @media (max-width:860px){ .auth-left{ display:none !important; } }
`;

// ─── DATA ────────────────────────────────────────────────────────────────────
const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Every expert was once a beginner. Your journey starts now.", author: "Helen Hayes" },
  { text: "Confidence is not 'they will like me.' It's 'I'll be fine if they don't.'", author: "Christina Grimmie" },
  { text: "Preparation is the key to success.", author: "Alexander Graham Bell" },
  { text: "An interview is your chance to tell your story. Own it.", author: "InterviewIQ" },
  { text: "You are more capable than you believe. Show them.", author: "InterviewIQ" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
];
const STATS = [
  { label: "Mock Interviews", value: "12", icon: "🎯" },
  { label: "Avg Score",       value: "8.4", icon: "⭐" },
  { label: "Hours Practiced", value: "5.2", icon: "⏱️" },
  { label: "Skills Improved", value: "7",   icon: "📈" },
];
const RECENT = [
  { role: "Frontend Developer",  date: "Feb 14, 2026", score: 8.7, level: "Senior" },
  { role: "Full Stack Engineer", date: "Feb 10, 2026", score: 7.9, level: "Mid"    },
  { role: "React Developer",     date: "Feb 5, 2026",  score: 9.1, level: "Senior" },
];

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const IS = {   // input style
  width:"100%", marginTop:8, padding:"13px 16px", borderRadius:10,
  border:`1px solid ${C.border}`, background:"rgba(255,255,255,0.03)",
  color:C.text, fontSize:15, outline:"none", fontFamily:"inherit", transition:"border-color 0.2s",
};
const LB = {   // link button
  background:"none", border:"none", color:C.amber, cursor:"pointer",
  fontSize:"inherit", fontWeight:700, padding:0, fontFamily:"inherit",
};

// ─── LOGO ─────────────────────────────────────────────────────────────────────
function Logo({ size = 36 }) {
  const id = `lg${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5A623"/>
          <stop offset="100%" stopColor="#E8521A"/>
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill={`url(#${id})`}/>
      <path d="M20 8C15 8 11 12 11 17C11 19.5 12 21.5 13.5 23L13 31H27L26.5 23C28 21.5 29 19.5 29 17C29 12 25 8 20 8Z"
            fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.2"/>
      <path d="M22 12L17 21H21L19 28L25 19H21L22 12Z" fill="white"/>
    </svg>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 5500); return () => clearTimeout(t); }, []);
  const colors = {
    success: { bg: "rgba(62,207,142,0.11)", bd: "#3ECF8E44" },
    error:   { bg: "rgba(224,82,82,0.11)",  bd: "#E0525244" },
    warn:    { bg: C.amberDim2,              bd: `${C.amber}44` },
    info:    { bg: C.amberDim,               bd: `${C.amber}33` },
  };
  const { bg, bd } = colors[type] || colors.info;
  return (
    <div style={{
      position:"fixed", top:18, right:18, zIndex:9999,
      background:bg, border:`1px solid ${bd}`, borderRadius:12,
      padding:"13px 18px", color:C.text, fontSize:13,
      backdropFilter:"blur(14px)", animation:"slideDown 0.32s ease",
      maxWidth:370, display:"flex", alignItems:"center", gap:10,
      boxShadow:"0 8px 32px rgba(0,0,0,0.45)", fontFamily:"'Sora',sans-serif",
    }}>
      <span style={{ flex:1, lineHeight:1.5 }}>{msg}</span>
      <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted2, cursor:"pointer", fontSize:18, lineHeight:1, padding:"0 2px" }}>×</button>
    </div>
  );
}

// ─── OAUTH MODAL ──────────────────────────────────────────────────────────────
function OAuthModal({ provider, onClose }) {
  const steps = {
    Google: {
      color: "#4285F4",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      ),
      steps: [
        "Go to console.cloud.google.com",
        "Create a new project → APIs & Services → Credentials",
        'Click "Create Credentials" → OAuth Client ID → Web Application',
        `Add Authorized redirect URI: http://localhost:5173/auth/google`,
        "Copy the Client ID → paste it in App.jsx OAUTH.Google config",
      ],
      url: "https://console.cloud.google.com/apis/credentials",
    },
    LinkedIn: {
      color: "#0A66C2",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#0A66C2">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      steps: [
        "Go to linkedin.com/developers/apps → Create App",
        "Fill in app name, company page, and logo",
        'Under "Auth" tab → add redirect URL: http://localhost:5173/auth/linkedin',
        'Request "Sign In with LinkedIn" product access',
        "Copy Client ID → paste it in App.jsx OAUTH.LinkedIn config",
      ],
      url: "https://www.linkedin.com/developers/apps/new",
    },
    GitHub: {
      color: "#E8E8E8",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
      ),
      steps: [
        "Go to github.com/settings/developers → OAuth Apps → New OAuth App",
        "Fill in Application name and Homepage URL",
        `Set Callback URL: http://localhost:5173/auth/github`,
        "Click Register Application",
        "Copy Client ID → paste it in App.jsx OAUTH.GitHub config",
      ],
      url: "https://github.com/settings/applications/new",
    },
  };

  const info = steps[provider];
  if (!info) return null;

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.78)",
      zIndex:8888, display:"flex", alignItems:"center", justifyContent:"center", padding:24,
    }} onClick={onClose}>
      <div style={{
        background:C.bg2, border:`1px solid ${C.border2}`, borderRadius:20,
        padding:"36px 40px", maxWidth:520, width:"100%",
        animation:"scaleIn 0.25s ease",
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24 }}>
          <div style={{
            width:52, height:52, borderRadius:12,
            background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}`,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>{info.icon}</div>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:C.text }}>
              Connect {provider}
            </div>
            <div style={{ fontSize:12, color:C.muted2, marginTop:3 }}>
              Setup takes ~3 minutes
            </div>
          </div>
          <button onClick={onClose} style={{
            marginLeft:"auto", background:"none", border:"none",
            color:C.muted2, fontSize:22, cursor:"pointer", lineHeight:1,
          }}>×</button>
        </div>

        {/* Steps */}
        <div style={{
          background:C.bg3, borderRadius:12, padding:"20px 22px",
          border:`1px solid ${C.border}`, marginBottom:20,
        }}>
          <div style={{ fontSize:11, color:C.amber, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:14 }}>
            Setup Steps
          </div>
          {info.steps.map((s, i) => (
            <div key={i} style={{ display:"flex", gap:12, marginBottom: i < info.steps.length-1 ? 12 : 0 }}>
              <div style={{
                width:22, height:22, borderRadius:"50%", flexShrink:0,
                background:C.gradBtn, display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:11, fontWeight:700, color:"white",
              }}>{i+1}</div>
              <div style={{ fontSize:13, color:C.muted2, lineHeight:1.55, paddingTop:2 }}>{s}</div>
            </div>
          ))}
        </div>

        {/* Code snippet for App.jsx */}
        <div style={{
          background:"#0A0908", borderRadius:10, padding:"14px 16px",
          border:`1px solid ${C.border}`, marginBottom:20,
          fontFamily:"'DM Mono',monospace", fontSize:12, color:"#A89880", lineHeight:1.7,
        }}>
          <span style={{ color:C.muted }}>// In App.jsx top — replace YOUR_CLIENT_ID:</span>
          <br/>
          <span style={{ color:C.amber }}>const</span> OAUTH_{provider.toUpperCase()}_ID = <span style={{ color:C.green }}>"paste-your-client-id-here"</span>;
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <a href={info.url} target="_blank" rel="noreferrer" style={{
            flex:1, display:"block", padding:"12px", borderRadius:10, textAlign:"center",
            background:C.gradBtn, color:"white", fontWeight:700, fontSize:14,
            textDecoration:"none", boxShadow:`0 4px 18px rgba(245,166,35,0.28)`,
          }}>
            Open {provider} Console ↗
          </a>
          <button onClick={onClose} style={{
            padding:"12px 20px", borderRadius:10,
            background:C.bg3, border:`1px solid ${C.border}`,
            color:C.muted2, fontWeight:600, fontSize:14,
            cursor:"pointer", fontFamily:"inherit",
          }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── SUMMARY MODAL ────────────────────────────────────────────────────────────
function SummaryModal({ messages, level, onClose, userName }) {
  // Build summary purely from chat history — no backend needed
  const botMsgs   = messages.filter(m => m.role === "bot");
  const userMsgs  = messages.filter(m => m.role === "user");

  // Extract scores from bot messages like "Score: 7/10"
  const scores = botMsgs
    .map(m => { const match = m.text.match(/Score[:\s]+(\d+(?:\.\d+)?)\s*\/\s*10/i); return match ? parseFloat(match[1]) : null; })
    .filter(Boolean);

  const avgScore   = scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1) : "N/A";
  const totalQs    = botMsgs.filter(m => m.text.endsWith("?")).length;
  const totalAns   = userMsgs.length;

  const scoreColor = avgScore >= 8 ? C.green : avgScore >= 6 ? C.amber : C.danger;

  // Individual Q&A pairs
  const qaPairs = [];
  let lastQ = null;
  messages.forEach(m => {
    if (m.role === "bot" && m.text.trim().endsWith("?")) { lastQ = m.text; }
    else if (m.role === "user" && lastQ) {
      qaPairs.push({ q: lastQ, a: m.text });
      lastQ = null;
    }
  });

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.82)",
      zIndex:9000, display:"flex", alignItems:"center", justifyContent:"center", padding:24,
    }} onClick={onClose}>
      <div style={{
        background:C.bg2, border:`1px solid ${C.border2}`,
        borderRadius:20, padding:"36px 40px",
        maxWidth:620, width:"100%", maxHeight:"82vh", overflowY:"auto",
        animation:"scaleIn 0.25s ease",
      }} onClick={e => e.stopPropagation()}>

        {/* Title */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <div style={{ fontSize:22, fontWeight:800, color:C.text }}>📊 Interview Summary</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted2, fontSize:22, cursor:"pointer", lineHeight:1 }}>×</button>
        </div>

        {/* Score cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
          {[
            { label:"Avg Score", value: scores.length ? `${avgScore}/10` : "N/A", color:scoreColor },
            { label:"Questions",  value: totalQs,  color:C.amber },
            { label:"Answered",   value: totalAns, color:C.green },
          ].map(s => (
            <div key={s.label} style={{
              textAlign:"center", padding:"18px 12px", borderRadius:14,
              background:C.bg3, border:`1px solid ${C.border}`,
            }}>
              <div style={{ fontSize:26, fontWeight:800, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:12, color:C.muted2, marginTop:5, fontWeight:600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Score per question */}
        {scores.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.muted2, marginBottom:12, textTransform:"uppercase", letterSpacing:"1px" }}>
              Score Breakdown
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {scores.map((s,i) => (
                <div key={i} style={{
                  padding:"6px 14px", borderRadius:20, fontWeight:700, fontSize:13,
                  background: s >= 8 ? C.greenDim : s >= 6 ? C.amberDim2 : "rgba(224,82,82,0.12)",
                  color:      s >= 8 ? C.green     : s >= 6 ? C.amber     : C.danger,
                  border:`1px solid ${s>=8?"rgba(62,207,142,0.25)":s>=6?C.border2:"rgba(224,82,82,0.25)"}`,
                }}>Q{i+1}: {s}/10</div>
              ))}
            </div>
          </div>
        )}

        {/* Q&A recap */}
        {qaPairs.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.muted2, marginBottom:12, textTransform:"uppercase", letterSpacing:"1px" }}>
              Q&A Recap
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {qaPairs.map((pair, i) => (
                <div key={i} style={{ background:C.bg3, borderRadius:12, padding:"14px 16px", border:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:12, color:C.amber, fontWeight:700, marginBottom:6 }}>Q{i+1}: {pair.q}</div>
                  <div style={{ fontSize:12, color:C.muted2, lineHeight:1.6 }}>{pair.a.length > 180 ? pair.a.slice(0,180)+"…" : pair.a}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Level + tip */}
        <div style={{
          background:C.amberDim, border:`1px solid ${C.border2}`,
          borderRadius:12, padding:"14px 18px", marginBottom:24,
          fontSize:13, color:C.muted2, lineHeight:1.6,
        }}>
          <strong style={{ color:C.amber }}>Level:</strong> {level.charAt(0).toUpperCase()+level.slice(1)} &nbsp;·&nbsp;
          <strong style={{ color:C.amber }}>Tip:</strong> {
            avgScore >= 8 ? "Excellent work! You're well-prepared for this level." :
            avgScore >= 6 ? "Good answers overall. Practice STAR format for behavioural questions." :
            "Keep practicing! Focus on structuring your answers more clearly."
          }
        </div>

        <div style={{ display:"flex", gap:12 }}>
          <button onClick={onClose} style={{
            flex:1, padding:"13px", borderRadius:10, background:C.gradBtn,
            border:"none", color:"white", fontWeight:700, fontSize:14,
            cursor:"pointer", fontFamily:"inherit",
            boxShadow:`0 4px 18px rgba(245,166,35,0.3)`,
          }}>
            Done ✓
          </button>
          <button onClick={async () => {
            try {
              const scoreValue = avgScore === "N/A" ? 0 : parseFloat(avgScore);
              console.log("Downloading PDF with:", { user_name: userName, level: level, qaPairs, avgScore: scoreValue });
              
              const res = await fetch(`${API}/download-pdf/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                  user_name: userName, 
                  level: level,
                  questions_answers: qaPairs,
                  avg_score: scoreValue
                })
              });
              
              console.log("Response status:", res.status);
              console.log("Response headers:", res.headers.get("content-type"));
              
              if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Server ${res.status}: ${errText}`);
              }
              
              const blob = await res.blob();
              console.log("Blob size:", blob.size, "Type:", blob.type);
              
              if (blob.size === 0) {
                throw new Error("PDF file is empty");
              }
              
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "interview-summary.pdf";
              a.click();
              
              console.log("PDF download triggered successfully");
            } catch (err) {
              console.error("Download error:", err);
              alert(`❌ Download failed: ${err.message}\n\nPlease check console for details.`);
            }
          }} style={{
            padding:"13px 20px", borderRadius:10,
            background:C.bg3, border:`1px solid ${C.border}`,
            color:C.muted2, fontWeight:600, fontSize:14,
            cursor:"pointer", fontFamily:"inherit",
          }}>
            ⬇ Download
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [mode, setMode]   = useState("login");
  const [form, setForm]   = useState({ name:"", email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [oauthModal, setOauthModal] = useState(null);
  const [quoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));

  const handleSubmit = async () => {
    if (!form.email)                      return setToast({ msg:"⚠️ Please enter your email",    type:"warn" });
    if (mode !== "forgot" && !form.password) return setToast({ msg:"⚠️ Please enter your password", type:"warn" });
    setLoading(true);
    
    try {
      let endpoint = "";
      let payload = {};
      
      if (mode === "signup") {
        endpoint = `${API}/signup/`;
        payload = { email: form.email, password: form.password, name: form.name };
      } else if (mode === "login") {
        endpoint = `${API}/login/`;
        payload = { email: form.email, password: form.password };
      } else {
        endpoint = `${API}/reset-password/`;
        payload = { email: form.email, new_password: form.password };
      }
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      setLoading(false);
      
      if (data.success) {
        if (mode === "signup") {
          setToast({ msg:`✅ Account created! Please sign in`, type:"success" });
          setTimeout(() => setMode("login"), 1500);
          setForm({ name:"", email:"", password:"" });
        } else if (mode === "login") {
          setToast({ msg:`✅ Signed in! Welcome ${data.user.name}`, type:"success" });
          setTimeout(() => onLogin(data.user), 1500);
        } else {
          setToast({ msg:`✅ Password reset! Please sign in with your new password`, type:"success" });
          setTimeout(() => setMode("login"), 1500);
          setForm({ name:"", email:"", password:"" });
        }
      } else {
        setToast({ msg:`❌ ${data.error}`, type:"error" });
      }
    } catch (err) {
      setLoading(false);
      setToast({ msg:`❌ Network error: ${err.message}`, type:"error" });
    }
  };

  const q = QUOTES[quoteIdx];

  return (
    <div style={{ minHeight:"100vh", display:"flex", fontFamily:"'Sora',sans-serif", background:C.bg, position:"relative", overflow:"hidden" }}>
      <style>{GLOBAL_CSS}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      {oauthModal && <OAuthModal provider={oauthModal} onClose={() => setOauthModal(null)}/>}

      {/* Ambient orbs */}
      {[
        { w:480, h:480, top:"-12%",  left:"-8%",  c:"rgba(245,166,35,0.07)"  },
        { w:380, h:380, bottom:"-8%",right:"-4%",  c:"rgba(232,130,26,0.06)"  },
        { w:260, h:260, top:"42%",   left:"33%",  c:"rgba(62,207,142,0.04)"  },
      ].map((o,i) => (
        <div key={i} style={{
          position:"absolute", width:o.w, height:o.h,
          top:o.top, left:o.left, bottom:o.bottom, right:o.right,
          borderRadius:"50%", background:`radial-gradient(circle,${o.c},transparent)`,
          animation:`float ${7+i*2}s ease-in-out infinite alternate`, pointerEvents:"none",
        }}/>
      ))}

      {/* LEFT panel */}
      <div className="auth-left" style={{
        flex:1, display:"flex", flexDirection:"column", justifyContent:"center",
        alignItems:"flex-start", padding:"60px 72px",
        borderRight:`1px solid ${C.border}`,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:60 }}>
          <Logo size={48}/>
          <div>
            <div style={{ fontSize:26, fontWeight:800, color:C.text, letterSpacing:"-0.5px" }}>InterviewIQ</div>
            <div style={{ fontSize:11, color:C.amber, letterSpacing:"3px", textTransform:"uppercase", marginTop:2 }}>AI Career Coach</div>
          </div>
        </div>
        <div style={{ maxWidth:420 }}>
          <div style={{ fontSize:11, letterSpacing:"2.5px", textTransform:"uppercase", color:C.amber, marginBottom:20, fontWeight:700 }}>
            Today's Motivation
          </div>
          <blockquote style={{
            fontSize:26, fontWeight:700, color:C.text, lineHeight:1.4,
            margin:"0 0 20px", fontStyle:"italic",
            borderLeft:`3px solid ${C.amber}`, paddingLeft:24,
          }}>"{q.text}"</blockquote>
          <div style={{ color:C.muted2, fontSize:14 }}>— {q.author}</div>
        </div>
        <div style={{ marginTop:80, display:"flex", gap:40 }}>
          {["10K+ Users","50K+ Interviews","4.9★ Rating"].map(t => (
            <div key={t} style={{ color:C.muted, fontSize:13, fontWeight:600 }}>{t}</div>
          ))}
        </div>
      </div>

      {/* RIGHT panel */}
      <div style={{ width:480, display:"flex", flexDirection:"column", justifyContent:"center", padding:"56px 52px" }}>
        <div style={{ marginBottom:36 }}>
          <h2 style={{ color:C.text, fontSize:28, fontWeight:800, margin:"0 0 8px", letterSpacing:"-0.5px" }}>
            {mode==="login" ? "Welcome back 👋" : mode==="signup" ? "Create account ✨" : "Reset password 🔑"}
          </h2>
          <p style={{ color:C.muted2, margin:0, fontSize:14 }}>
            {mode==="login" ? "Sign in to continue your interview prep" :
             mode==="signup" ? "Start your AI-powered interview journey" : "We'll send a recovery link to your email"}
          </p>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {mode==="signup" && (
            <div>
              <label style={{ color:C.muted2, fontSize:11, letterSpacing:"1px", textTransform:"uppercase", fontWeight:600 }}>Full Name</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Alex Johnson" style={IS}
                onFocus={e=>e.target.style.borderColor=C.amber} onBlur={e=>e.target.style.borderColor=C.border}/>
            </div>
          )}
          <div>
            <label style={{ color:C.muted2, fontSize:11, letterSpacing:"1px", textTransform:"uppercase", fontWeight:600 }}>Email</label>
            <input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="you@example.com" type="email" style={IS}
              onFocus={e=>e.target.style.borderColor=C.amber} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
          {mode!=="forgot" && (
            <div>
              <label style={{ color:C.muted2, fontSize:11, letterSpacing:"1px", textTransform:"uppercase", fontWeight:600 }}>Password</label>
              <input value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="••••••••" type="password" style={IS}
                onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                onFocus={e=>e.target.style.borderColor=C.amber} onBlur={e=>e.target.style.borderColor=C.border}/>
            </div>
          )}
        </div>

        {mode==="login" && (
          <div style={{ textAlign:"right", marginTop:8 }}>
            <button onClick={()=>setMode("forgot")} style={LB}>Forgot password?</button>
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{
          marginTop:24, padding:"14px", borderRadius:12,
          background: loading ? C.bg3 : C.gradBtn,
          border:`1px solid ${loading ? C.border : "transparent"}`,
          color:"white", fontSize:15, fontWeight:700,
          cursor: loading ? "not-allowed" : "pointer", width:"100%",
          boxShadow: loading ? "none" : `0 8px 28px rgba(245,166,35,0.28)`,
          transition:"all 0.2s", fontFamily:"inherit",
        }}>
          {loading ? "⏳ Please wait..." : mode==="login" ? "Sign In →" : mode==="signup" ? "Create Account →" : "Send Reset Link →"}
        </button>

        <div style={{ marginTop:20, textAlign:"center" }}>
          {mode==="login" ? (
            <span style={{ color:C.muted2, fontSize:13 }}>No account yet?{" "}<button onClick={()=>setMode("signup")} style={LB}>Sign up free</button></span>
          ) : (
            <span style={{ color:C.muted2, fontSize:13 }}>Already have an account?{" "}<button onClick={()=>setMode("login")} style={LB}>Sign in</button></span>
          )}
        </div>

        {/* OAuth buttons — open setup modal */}
        <div style={{ marginTop:32, borderTop:`1px solid ${C.border}`, paddingTop:24 }}>
          <div style={{ textAlign:"center", color:C.muted, fontSize:11, marginBottom:16, letterSpacing:"1.5px", textTransform:"uppercase" }}>
            Or continue with
          </div>
          <div style={{ display:"flex", gap:10 }}>
            {[
              { name:"Google",   icon:(
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )},
              { name:"LinkedIn", icon:(
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              )},
              { name:"GitHub",   icon:(
                <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              )},
            ].map(p => (
              <button key={p.name} onClick={() => setOauthModal(p.name)} style={{
                flex:1, padding:"10px 8px", borderRadius:10,
                background:C.bg3, border:`1px solid ${C.border}`,
                color:C.text, fontSize:12, cursor:"pointer", fontWeight:600,
                transition:"all 0.2s", display:"flex", alignItems:"center",
                justifyContent:"center", gap:7, fontFamily:"inherit",
              }}
                onMouseEnter={e=>{e.currentTarget.style.border=`1px solid ${C.border2}`; e.currentTarget.style.background=C.amberDim;}}
                onMouseLeave={e=>{e.currentTarget.style.border=`1px solid ${C.border}`; e.currentTarget.style.background=C.bg3;}}>
                {p.icon}{p.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, onStartInterview, onLogout }) {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [toast, setToast] = useState({ msg:`✅ Signed in! Notification sent to ${user.email}`, type:"success" });

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx(i => (i+1) % QUOTES.length), 8000);
    return () => clearInterval(t);
  }, []);

  const q = QUOTES[quoteIdx];

  return (
    <div style={{ minHeight:"100vh", fontFamily:"'Sora',sans-serif", background:C.bg, color:C.text }}>
      <style>{GLOBAL_CSS}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

      {/* Navbar */}
      <nav style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"16px 40px", borderBottom:`1px solid ${C.border}`,
        backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:100,
        background:"rgba(15,14,11,0.88)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Logo size={34}/><div style={{ fontSize:20, fontWeight:800, letterSpacing:"-0.5px" }}>InterviewIQ</div>
        </div>
        <div style={{ display:"flex", gap:28 }}>
          {["Dashboard","Practice","History","Resources"].map((item,i) => (
            <button key={item} style={{
              background:"none", border:"none", color: i===0 ? C.amber : C.muted2,
              fontSize:14, cursor:"pointer", fontWeight: i===0 ? 700 : 400,
              fontFamily:"inherit", padding:0, transition:"color 0.2s",
            }}
              onMouseEnter={e=>e.target.style.color=C.amber}
              onMouseLeave={e=>e.target.style.color=i===0?C.amber:C.muted2}>
              {item}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{
            width:36, height:36, borderRadius:"50%", background:C.gradBtn,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:15, fontWeight:700, color:"white",
          }}>{user.name[0].toUpperCase()}</div>
          <div>
            <div style={{ fontSize:13, fontWeight:700 }}>{user.name}</div>
            <div style={{ fontSize:11, color:C.muted }}>{user.email}</div>
          </div>
          <button onClick={onLogout} style={{
            padding:"7px 14px", borderRadius:8,
            background:"rgba(224,82,82,0.1)", border:"1px solid rgba(224,82,82,0.2)",
            color:"#E05252", fontSize:12, cursor:"pointer", fontWeight:600, fontFamily:"inherit",
          }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(224,82,82,0.18)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(224,82,82,0.1)"}>
            Sign Out
          </button>
        </div>
      </nav>

      <main style={{ padding:"36px 40px 60px", maxWidth:1180, margin:"0 auto" }}>
        {/* Hero */}
        <div style={{
          borderRadius:20, padding:"44px 52px", background:C.gradCard,
          border:`1px solid ${C.border2}`, marginBottom:32,
          position:"relative", overflow:"hidden", animation:"fadeUp 0.5s ease",
        }}>
          <div style={{ position:"absolute", right:-80, top:-80, width:320, height:320, borderRadius:"50%", background:`radial-gradient(circle,rgba(245,166,35,0.07),transparent)`, pointerEvents:"none" }}/>
          <div style={{ fontSize:11, letterSpacing:"2.5px", textTransform:"uppercase", color:C.amber, fontWeight:700, marginBottom:10 }}>Welcome back</div>
          <h1 style={{ fontSize:36, fontWeight:800, margin:"0 0 12px", letterSpacing:"-1px" }}>Hello, {user.name} 👋</h1>
          <p style={{ color:C.muted2, fontSize:16, margin:"0 0 28px", maxWidth:500, lineHeight:1.65 }}>
            Your AI coach <strong style={{ color:C.amber }}>Aria</strong> is online, powered by Ollama and ready with tailored questions.
          </p>
          <div style={{ display:"flex", gap:14 }}>
            <button onClick={onStartInterview} style={{
              padding:"13px 32px", borderRadius:12, background:C.gradBtn,
              border:"none", color:"white", fontSize:15, fontWeight:700,
              cursor:"pointer", boxShadow:`0 8px 28px rgba(245,166,35,0.3)`,
              transition:"all 0.2s", fontFamily:"inherit",
            }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 12px 36px rgba(245,166,35,0.4)`;}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=`0 8px 28px rgba(245,166,35,0.3)`;}}>
              🎯 Start Interview
            </button>
            <button style={{
              padding:"13px 24px", borderRadius:12,
              background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`,
              color:C.text, fontSize:15, fontWeight:600,
              cursor:"pointer", transition:"all 0.2s", fontFamily:"inherit",
            }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.07)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"}>
              📄 Upload Resume
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18, marginBottom:28 }}>
          {STATS.map((s,i) => (
            <div key={s.label} style={{
              borderRadius:16, padding:"22px", textAlign:"center",
              background:C.bg2, border:`1px solid ${C.border}`,
              animation:`fadeUp 0.5s ease ${i*0.08+0.15}s both`, transition:"all 0.2s", cursor:"default",
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.border2;e.currentTarget.style.transform="translateY(-3px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="none";}}>
              <div style={{ fontSize:26, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:24, fontWeight:800, color:C.amber }}>{s.value}</div>
              <div style={{ fontSize:12, color:C.muted2, marginTop:4, fontWeight:600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:22 }}>
          {/* Recent */}
          <div style={{ borderRadius:20, padding:"26px 28px", background:C.bg2, border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Recent Sessions</div>
            {RECENT.map((r,i) => (
              <div key={i} style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"14px 18px", borderRadius:12, background:C.bg3,
                border:`1px solid ${C.border}`, marginBottom:10,
                transition:"all 0.2s", cursor:"pointer",
              }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.border2;e.currentTarget.style.background=C.amberDim;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.bg3;}}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{r.role}</div>
                  <div style={{ fontSize:11, color:C.muted2, marginTop:3 }}>{r.date} · {r.level}</div>
                </div>
                <div style={{
                  padding:"5px 13px", borderRadius:20, fontWeight:700, fontSize:13,
                  background: r.score>=9 ? C.greenDim : r.score>=8 ? C.amberDim2 : "rgba(224,82,82,0.1)",
                  color:      r.score>=9 ? C.green     : r.score>=8 ? C.amber     : C.danger,
                }}>{r.score}/10</div>
              </div>
            ))}
          </div>

          {/* Right col */}
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <div style={{ borderRadius:20, padding:"24px", background:`linear-gradient(135deg,rgba(245,166,35,0.07),rgba(62,207,142,0.04))`, border:`1px solid ${C.border2}`, flex:1 }}>
              <div style={{ fontSize:10, letterSpacing:"2px", textTransform:"uppercase", color:C.amber, fontWeight:700, marginBottom:14 }}>✨ Daily Fuel</div>
              <div key={quoteIdx} style={{ fontSize:15, fontStyle:"italic", lineHeight:1.65, fontWeight:600, color:C.text, marginBottom:14, animation:"fadeIn 0.5s ease" }}>"{q.text}"</div>
              <div style={{ fontSize:12, color:C.muted2 }}>— {q.author}</div>
            </div>
            <div style={{ borderRadius:20, padding:"22px", background:C.amberDim, border:`1px solid ${C.border2}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                <div style={{ width:46, height:46, borderRadius:"50%", background:C.gradBtn, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, boxShadow:`0 4px 18px rgba(245,166,35,0.3)` }}>🤖</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:15 }}>Meet Aria</div>
                  <div style={{ fontSize:11, color:C.green, marginTop:2 }}>● Online · AI Interviewer</div>
                </div>
              </div>
              <p style={{ color:C.muted2, fontSize:12, lineHeight:1.65, margin:"0 0 14px" }}>
                Aria adapts to your level, asks sharp follow-ups, and gives instant feedback powered by Ollama.
              </p>
              <button onClick={onStartInterview} style={{
                width:"100%", padding:"11px", borderRadius:10, background:C.gradBtn,
                border:"none", color:"white", fontWeight:700, fontSize:13,
                cursor:"pointer", fontFamily:"inherit", boxShadow:`0 4px 16px rgba(245,166,35,0.25)`,
              }}>Chat with Aria →</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── INTERVIEW PAGE ────────────────────────────────────────────────────────────
function InterviewPage({ user, onBack }) {
  const [messages, setMessages] = useState([
    { role:"bot", text:"Hi! I'm Aria, your AI interviewer powered by Ollama 🤖\n\nPlease upload your resume first so I can tailor questions to your experience. Then we'll get started!" }
  ]);
  const [input, setInput]     = useState("");
  const [level, setLevel]     = useState("mid");
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [typing, setTyping]   = useState(false);
  const [toast, setToast]     = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const fileRef  = useRef(null);
  const chatRef  = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, typing]);

  // ── Resume upload ──────────────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") return setToast({ msg:"❌ Only PDF files accepted", type:"error" });
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API}/upload-resume/`, { method:"POST", body:fd });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      setUploadDone(true);
      setMessages(m => [...m, {
        role:"bot",
        text:`📄 Resume uploaded and analyzed!\n\nLet's begin your ${level}-level interview. Tell me about yourself and your most recent role.`,
      }]);
      setToast({ msg:"✅ Resume uploaded successfully!", type:"success" });
    } catch (err) {
      setToast({ msg:`❌ Upload failed: ${err.message}. Is your FastAPI running?`, type:"error" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // ── Send message to Ollama via FastAPI ────────────────────────────────────
  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || typing) return;
    setInput("");
    const newMessages = [...messages, { role:"user", text:msg }];
    setMessages(newMessages);
    setTyping(true);

    try {
      const res = await fetch(`${API}/chat/`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ 
          message: msg, 
          level: level
        }),
      });
      
      if (!res.ok) {
        throw new Error(`Server error ${res.status}`);
      }
      
      const data = await res.json();
      setTyping(false);

      // Handle error responses
      if (data.error) {
        setMessages(m => [...m, { role:"bot", text:`⚠️ ${data.error}\n\n${data.question || ""}` }]);
        setToast({ msg:`❌ ${data.error}`, type:"error" });
        return;
      }

      // Build response message
      let botReply = "";
      
      if (data.score !== undefined && data.feedback) {
        // This is answer evaluation with feedback
        botReply = `📊 Score: ${data.score}/10\n\n${data.feedback}`;
      }
      
      if (data.question) {
        // Add the question (either first question or next question)
        if (botReply) {
          botReply += `\n\n${data.question}`;
        } else {
          botReply = data.question;
        }
      }
      
      if (!botReply) {
        botReply = "No response received. Please try again.";
      }
      
      setMessages(m => [...m, { role:"bot", text:botReply }]);
      
    } catch (err) {
      setTyping(false);
      const errorMsg = err.message || "Unknown error";
      setMessages(m => [...m, { 
        role:"bot", 
        text:`⚠️ Error: ${errorMsg}\n\n🔧 Troubleshooting:\n- Is Ollama running? (http://localhost:11434)\n- Is FastAPI running? (${API})\n- Try refreshing the page and uploading resume again.`
      }]);
      setToast({ msg:`❌ Error communicating with server`, type:"error" });
    }
  };

  return (
    <div style={{ minHeight:"100vh", fontFamily:"'Sora',sans-serif", background:C.bg, color:C.text, display:"flex", flexDirection:"column" }}>
      <style>{GLOBAL_CSS}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      {showSummary && <SummaryModal messages={messages} level={level} userName={user.name} onClose={() => setShowSummary(false)}/>}

      {/* Navbar */}
      <nav style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"14px 36px", borderBottom:`1px solid ${C.border}`,
        backdropFilter:"blur(12px)", background:"rgba(15,14,11,0.9)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <button onClick={onBack} style={{
            background:C.bg3, border:`1px solid ${C.border}`,
            color:C.muted2, fontSize:13, cursor:"pointer",
            padding:"7px 14px", borderRadius:8, fontFamily:"inherit", transition:"all 0.2s",
          }}
            onMouseEnter={e=>e.currentTarget.style.color=C.text}
            onMouseLeave={e=>e.currentTarget.style.color=C.muted2}>
            ← Back
          </button>
          <Logo size={30}/>
          <span style={{ fontWeight:700, fontSize:17 }}>InterviewIQ</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <select value={level} onChange={e=>setLevel(e.target.value)} style={{
            background:C.bg3, border:`1px solid ${C.border}`,
            color:C.text, padding:"7px 13px", borderRadius:8,
            fontSize:13, fontFamily:"inherit", cursor:"pointer",
          }}>
            <option value="junior">Junior</option>
            <option value="mid">Mid-Level</option>
            <option value="senior">Senior</option>
          </select>
          <div style={{
            display:"flex", alignItems:"center", gap:8,
            background:C.amberDim, border:`1px solid ${C.border}`,
            padding:"5px 12px 5px 6px", borderRadius:20,
          }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:C.gradBtn, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, color:"white" }}>
              {user.name[0].toUpperCase()}
            </div>
            <span style={{ fontSize:13, fontWeight:600 }}>{user.name}</span>
          </div>
        </div>
      </nav>

      <div style={{ display:"flex", flex:1, maxWidth:1100, margin:"0 auto", width:"100%", padding:"22px 28px", gap:22 }}>
        {/* Sidebar */}
        <div style={{ width:252, display:"flex", flexDirection:"column", gap:16, flexShrink:0 }}>
          {/* Aria */}
          <div style={{ borderRadius:16, padding:"18px", background:C.amberDim, border:`1px solid ${C.border2}` }}>
            <div style={{ textAlign:"center", marginBottom:10 }}>
              <div style={{ width:58, height:58, borderRadius:"50%", margin:"0 auto 10px", background:C.gradBtn, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, boxShadow:`0 6px 24px rgba(245,166,35,0.25)` }}>🤖</div>
              <div style={{ fontWeight:700, fontSize:15 }}>Aria</div>
              <div style={{ fontSize:11, color:C.green, marginTop:3 }}>● Live Interview Mode</div>
            </div>
            <div style={{ fontSize:11, color:C.muted2, lineHeight:1.6, textAlign:"center" }}>
              {level.charAt(0).toUpperCase()+level.slice(1)}-level · Powered by Ollama
            </div>
          </div>

          {/* Resume */}
          <div style={{ borderRadius:16, padding:"18px", background:C.bg2, border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:11, fontWeight:700, marginBottom:12, color:C.muted2, textTransform:"uppercase", letterSpacing:"1px" }}>Resume</div>
            {!uploadDone ? (
              <>
                <div onClick={() => !uploading && fileRef.current?.click()} style={{
                  border:`2px dashed ${C.border2}`, borderRadius:10,
                  padding:"20px 14px", textAlign:"center", marginBottom:10,
                  cursor: uploading ? "not-allowed" : "pointer", transition:"all 0.2s",
                }}
                  onMouseEnter={e => !uploading && (e.currentTarget.style.borderColor=C.amber)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor=C.border2)}>
                  <div style={{ fontSize:24, marginBottom:6 }}>{uploading ? "⏳" : "📄"}</div>
                  <div style={{ fontSize:11, color:C.muted2 }}>{uploading ? "Uploading..." : "Click to select PDF"}</div>
                </div>
                <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileChange} style={{ display:"none" }}/>
                <button onClick={() => !uploading && fileRef.current?.click()} disabled={uploading} style={{
                  width:"100%", padding:"9px", borderRadius:8,
                  background: uploading ? C.bg3 : C.amberDim,
                  border:`1px solid ${uploading ? C.border : C.border2}`,
                  color: uploading ? C.muted : C.amber,
                  fontSize:12, cursor: uploading ? "not-allowed" : "pointer",
                  fontWeight:600, fontFamily:"inherit",
                }}>
                  {uploading ? "⏳ Uploading..." : "Upload Resume (PDF)"}
                </button>
              </>
            ) : (
              <div style={{ padding:"14px", borderRadius:10, textAlign:"center", background:C.greenDim, border:`1px solid rgba(62,207,142,0.25)` }}>
                <div style={{ fontSize:20 }}>✅</div>
                <div style={{ fontSize:11, color:C.green, marginTop:6, fontWeight:700 }}>Resume analyzed!</div>
              </div>
            )}
          </div>

          {/* Tips */}
          <div style={{ borderRadius:16, padding:"18px", background:C.bg2, border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:11, fontWeight:700, marginBottom:12, color:C.amber, textTransform:"uppercase", letterSpacing:"1px" }}>💡 Tips</div>
            {["Use STAR format","Keep answers 1–2 min","Ask clarifying questions","Show enthusiasm & energy"].map(tip => (
              <div key={tip} style={{ fontSize:11, color:C.muted2, marginBottom:9, paddingLeft:10, borderLeft:`2px solid rgba(245,166,35,0.28)`, lineHeight:1.5 }}>{tip}</div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
          {/* Messages */}
          <div ref={chatRef} style={{
            flex:1, borderRadius:16, padding:"20px",
            background:C.bg2, border:`1px solid ${C.border}`,
            overflowY:"auto", minHeight:460, maxHeight:460,
            marginBottom:14, display:"flex", flexDirection:"column", gap:14,
          }}>
            {messages.map((m,i) => (
              <div key={i} style={{ display:"flex", justifyContent: m.role==="user"?"flex-end":"flex-start", animation:"fadeUp 0.3s ease" }}>
                {m.role==="bot" && (
                  <div style={{ width:30, height:30, borderRadius:"50%", marginRight:9, flexShrink:0, background:C.gradBtn, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🤖</div>
                )}
                <div style={{
                  maxWidth:"76%", padding:"11px 15px",
                  borderRadius: m.role==="user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
                  background: m.role==="user" ? `linear-gradient(135deg,rgba(245,166,35,0.14),rgba(232,130,26,0.10))` : C.bg3,
                  border: m.role==="user" ? `1px solid ${C.border2}` : `1px solid ${C.border}`,
                  fontSize:13, lineHeight:1.7, color:C.text, whiteSpace:"pre-wrap",
                }}>
                  {m.text}
                </div>
                {m.role==="user" && (
                  <div style={{ width:30, height:30, borderRadius:"50%", marginLeft:9, flexShrink:0, background:C.gradBtn, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:12, color:"white" }}>
                    {user.name[0].toUpperCase()}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                <div style={{ width:30, height:30, borderRadius:"50%", background:C.gradBtn, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🤖</div>
                <div style={{ padding:"12px 16px", borderRadius:"4px 16px 16px 16px", background:C.bg3, border:`1px solid ${C.border}` }}>
                  <div style={{ display:"flex", gap:5 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:C.amber, animation:`pulse 1s ease ${i*0.2}s infinite` }}/>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ display:"flex", gap:10, marginBottom:10 }}>
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMessage()}
              placeholder="Type your answer and press Enter..."
              disabled={typing}
              style={{
                flex:1, padding:"13px 18px", borderRadius:12,
                background:C.bg2, border:`1px solid ${C.border}`,
                color:C.text, fontSize:14, fontFamily:"inherit", outline:"none",
                transition:"border-color 0.2s", opacity: typing ? 0.6 : 1,
              }}
              onFocus={e=>e.target.style.borderColor=C.amber}
              onBlur={e=>e.target.style.borderColor=C.border}/>
            <button onClick={sendMessage} disabled={typing} style={{
              padding:"13px 22px", borderRadius:12,
              background: typing ? C.bg3 : C.gradBtn,
              border:`1px solid ${typing ? C.border : "transparent"}`,
              color:"white", fontSize:14, fontWeight:700,
              cursor: typing ? "not-allowed" : "pointer", fontFamily:"inherit",
              boxShadow: typing ? "none" : `0 4px 18px rgba(245,166,35,0.3)`,
              transition:"all 0.2s", minWidth:90,
            }}>
              {typing ? "···" : "Send →"}
            </button>
          </div>

          {/* End Interview button */}
          <button onClick={() => setShowSummary(true)} style={{
            padding:"13px", borderRadius:10, width:"100%",
            background:`linear-gradient(135deg,rgba(62,207,142,0.1),rgba(62,207,142,0.06))`,
            border:`1px solid rgba(62,207,142,0.3)`,
            color:C.green, fontSize:14, fontWeight:700,
            cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
          }}
            onMouseEnter={e=>{e.currentTarget.style.background=`rgba(62,207,142,0.16)`;e.currentTarget.style.boxShadow=`0 4px 18px rgba(62,207,142,0.15)`;}}
            onMouseLeave={e=>{e.currentTarget.style.background=`linear-gradient(135deg,rgba(62,207,142,0.1),rgba(62,207,142,0.06))`;e.currentTarget.style.boxShadow="none";}}>
            📊 End Interview & View Summary
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("auth");
  const [user, setUser] = useState(null);
  return page==="auth"      ? <AuthPage onLogin={u=>{setUser(u);setPage("dashboard");}}/> :
         page==="dashboard" ? <Dashboard user={user} onStartInterview={()=>setPage("interview")} onLogout={()=>{setUser(null);setPage("auth");}}/> :
                              <InterviewPage user={user} onBack={()=>setPage("dashboard")}/>;
}
