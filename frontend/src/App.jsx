const OAUTH_GOOGLE_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;



import { useState, useEffect, useRef } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API = "http://127.0.0.1:8000";
const GITHUB_URL = "https://github.com/Shrutibhavsar20";

// ─── THEME ───────────────────────────────────────────────────────────────────
const C = {
  bg:         "#080810",
  bg2:        "#0E0E1A",
  bg3:        "#13131F",
  bg4:        "#1A1A2E",
  border:     "rgba(139,92,246,0.12)",
  border2:    "rgba(139,92,246,0.3)",
  purple:     "#8B5CF6",
  purpleBright:"#A78BFA",
  violet:     "#7C3AED",
  amber:      "#F59E0B",
  amberBright:"#FCD34D",
  green:      "#10B981",
  greenDim:   "rgba(16,185,129,0.12)",
  pink:       "#EC4899",
  cyan:       "#06B6D4",
  purpleDim:  "rgba(139,92,246,0.09)",
  purpleDim2: "rgba(139,92,246,0.17)",
  text:       "#F1F0FF",
  muted:      "#6B6B8A",
  muted2:     "#9999BB",
  danger:     "#EF4444",
  gradBtn:    "linear-gradient(135deg, #8B5CF6, #EC4899)",
  gradBtnHover: "linear-gradient(135deg, #7C3AED, #DB2777)",
  gradCard:   "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.04))",
  gradGithub: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { width: 100%; height: 100%; }
  body { background: ${C.bg}; font-family: 'Outfit', sans-serif; overflow-x: hidden; }
  ::selection { background: rgba(139,92,246,0.32); }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.22); border-radius: 4px; }
  input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px #13131F inset !important;
    -webkit-text-fill-color: #F1F0FF !important;
  }
  @keyframes float    { 0%{transform:translateY(0) scale(1);} 100%{transform:translateY(-24px) scale(1.06);} }
  @keyframes slideDown{ from{opacity:0;transform:translateY(-14px);} to{opacity:1;transform:translateY(0);} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
  @keyframes fadeIn   { from{opacity:0;} to{opacity:1;} }
  @keyframes scaleIn  { from{opacity:0;transform:scale(0.93);} to{opacity:1;transform:scale(1);} }
  @keyframes pulse    { 0%,100%{opacity:0.3;transform:scale(0.75);} 50%{opacity:1;transform:scale(1);} }
  @keyframes shimmer  { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
  @keyframes glow     { 0%,100%{box-shadow: 0 0 20px rgba(139,92,246,0.3);} 50%{box-shadow: 0 0 40px rgba(236,72,153,0.5), 0 0 60px rgba(139,92,246,0.3);} }
  @keyframes rotateBorder { 0%{background-position:0% 50%;} 50%{background-position:100% 50%;} 100%{background-position:0% 50%;} }
  @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
  @keyframes countup { from{transform:scale(0.5);opacity:0;} to{transform:scale(1);opacity:1;} }
  @media (max-width:860px){ .auth-left{ display:none !important; } }
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
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
  { label: "Mock Interviews", value: "12", icon: "🎯", change: "+3" },
  { label: "Avg Score",       value: "8.4", icon: "⭐", change: "+0.6" },
  { label: "Hours Practiced", value: "5.2", icon: "⏱️", change: "+1.2" },
  { label: "Skills Improved", value: "7",   icon: "📈", change: "+2" },
];
const RECENT = [
  { role: "Frontend Developer",  date: "Feb 14, 2026", score: 8.7, level: "Senior" },
  { role: "Full Stack Engineer", date: "Feb 10, 2026", score: 7.9, level: "Mid"    },
  { role: "React Developer",     date: "Feb 5, 2026",  score: 9.1, level: "Senior" },
];

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const IS = {
  width:"100%", marginTop:8, padding:"13px 16px", borderRadius:10,
  border:`1px solid ${C.border}`, background:"rgba(255,255,255,0.03)",
  color:C.text, fontSize:15, outline:"none", fontFamily:"inherit", transition:"border-color 0.2s",
};
const LB = {
  background:"none", border:"none", color:C.purpleBright, cursor:"pointer",
  fontSize:"inherit", fontWeight:700, padding:0, fontFamily:"inherit",
};

// ─── LOGO ─────────────────────────────────────────────────────────────────────
function Logo({ size = 36 }) {
  const id = `lg${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6"/>
          <stop offset="100%" stopColor="#EC4899"/>
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill={`url(#${id})`}/>
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
    success: { bg: "rgba(16,185,129,0.11)",   bd: "#10B98144" },
    error:   { bg: "rgba(239,68,68,0.11)",     bd: "#EF444444" },
    warn:    { bg: "rgba(245,158,11,0.17)",    bd: `rgba(245,158,11,0.44)` },
    info:    { bg: "rgba(139,92,246,0.09)",    bd: `rgba(139,92,246,0.33)` },
  };
  const { bg, bd } = colors[type] || colors.info;
  return (
    <div style={{
      position:"fixed", top:18, right:18, zIndex:9999,
      background:bg, border:`1px solid ${bd}`, borderRadius:14,
      padding:"13px 18px", color:C.text, fontSize:13,
      backdropFilter:"blur(18px)", animation:"slideDown 0.32s ease",
      maxWidth:380, display:"flex", alignItems:"center", gap:10,
      boxShadow:"0 8px 32px rgba(0,0,0,0.5)", fontFamily:"'Outfit',sans-serif",
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
      position:"fixed", inset:0, background:"rgba(0,0,0,0.82)",
      zIndex:8888, display:"flex", alignItems:"center", justifyContent:"center", padding:24,
    }} onClick={onClose}>
      <div style={{
        background:C.bg2, border:`1px solid ${C.border2}`, borderRadius:22,
        padding:"36px 40px", maxWidth:520, width:"100%",
        animation:"scaleIn 0.25s ease",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24 }}>
          <div style={{
            width:52, height:52, borderRadius:14,
            background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}`,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>{info.icon}</div>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:C.text }}>Connect {provider}</div>
            <div style={{ fontSize:12, color:C.muted2, marginTop:3 }}>Setup takes ~3 minutes</div>
          </div>
          <button onClick={onClose} style={{ marginLeft:"auto", background:"none", border:"none", color:C.muted2, fontSize:22, cursor:"pointer", lineHeight:1 }}>×</button>
        </div>
        <div style={{ background:C.bg3, borderRadius:14, padding:"20px 22px", border:`1px solid ${C.border}`, marginBottom:20 }}>
          <div style={{ fontSize:11, color:C.purpleBright, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:14 }}>Setup Steps</div>
          {info.steps.map((s, i) => (
            <div key={i} style={{ display:"flex", gap:12, marginBottom: i < info.steps.length-1 ? 12 : 0 }}>
              <div style={{ width:22, height:22, borderRadius:"50%", flexShrink:0, background:C.gradBtn, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"white" }}>{i+1}</div>
              <div style={{ fontSize:13, color:C.muted2, lineHeight:1.55, paddingTop:2 }}>{s}</div>
            </div>
          ))}
        </div>
        <div style={{ background:"#0A0910", borderRadius:10, padding:"14px 16px", border:`1px solid ${C.border}`, marginBottom:20, fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:"#9999BB", lineHeight:1.7 }}>
          <span style={{ color:C.muted }}>// In App.jsx top — replace YOUR_CLIENT_ID:</span><br/>
          <span style={{ color:C.purpleBright }}>const</span> OAUTH_{provider.toUpperCase()}_ID = <span style={{ color:C.green }}>"paste-your-client-id-here"</span>;
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <a href={info.url} target="_blank" rel="noreferrer" style={{ flex:1, display:"block", padding:"12px", borderRadius:10, textAlign:"center", background:C.gradBtn, color:"white", fontWeight:700, fontSize:14, textDecoration:"none", boxShadow:`0 4px 18px rgba(139,92,246,0.3)` }}>
            Open {provider} Console ↗
          </a>
          <button onClick={onClose} style={{ padding:"12px 20px", borderRadius:10, background:C.bg3, border:`1px solid ${C.border}`, color:C.muted2, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── SUMMARY MODAL ────────────────────────────────────────────────────────────
function SummaryModal({ messages, level, onClose, userName }) {
  const botMsgs  = messages.filter(m => m.role === "bot");
  const userMsgs = messages.filter(m => m.role === "user");
  const scores = botMsgs.map(m => { const match = m.text.match(/Score[:\s]+(\d+(?:\.\d+)?)\s*\/\s*10/i); return match ? parseFloat(match[1]) : null; }).filter(Boolean);
  const avgScore  = scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1) : "N/A";
  const totalQs   = botMsgs.filter(m => m.text.endsWith("?")).length;
  const totalAns  = userMsgs.length;
  const scoreColor = avgScore >= 8 ? C.green : avgScore >= 6 ? C.amber : C.danger;
  const qaPairs = [];
  let lastQ = null;
  messages.forEach(m => {
    if (m.role === "bot" && m.text.trim().endsWith("?")) { lastQ = m.text; }
    else if (m.role === "user" && lastQ) { qaPairs.push({ q: lastQ, a: m.text }); lastQ = null; }
  });

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:9000, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={onClose}>
      <div style={{ background:C.bg2, border:`1px solid ${C.border2}`, borderRadius:22, padding:"36px 40px", maxWidth:640, width:"100%", maxHeight:"84vh", overflowY:"auto", animation:"scaleIn 0.25s ease" }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <div style={{ fontSize:22, fontWeight:800, color:C.text }}>📊 Interview Summary</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted2, fontSize:22, cursor:"pointer", lineHeight:1 }}>×</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
          {[
            { label:"Avg Score", value: scores.length ? `${avgScore}/10` : "N/A", color:scoreColor },
            { label:"Questions",  value: totalQs,  color:C.purpleBright },
            { label:"Answered",   value: totalAns, color:C.green },
          ].map(s => (
            <div key={s.label} style={{ textAlign:"center", padding:"18px 12px", borderRadius:14, background:C.bg3, border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:12, color:C.muted2, marginTop:5, fontWeight:600 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {scores.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.muted2, marginBottom:12, textTransform:"uppercase", letterSpacing:"1px" }}>Score Breakdown</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {scores.map((s,i) => (
                <div key={i} style={{ padding:"6px 14px", borderRadius:20, fontWeight:700, fontSize:13, background: s>=8?C.greenDim:s>=6?"rgba(245,158,11,0.15)":"rgba(239,68,68,0.12)", color: s>=8?C.green:s>=6?C.amber:C.danger, border:`1px solid ${s>=8?"rgba(16,185,129,0.25)":s>=6?"rgba(245,158,11,0.3)":"rgba(239,68,68,0.25)"}` }}>Q{i+1}: {s}/10</div>
              ))}
            </div>
          </div>
        )}
        {qaPairs.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.muted2, marginBottom:12, textTransform:"uppercase", letterSpacing:"1px" }}>Q&A Recap</div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {qaPairs.map((pair, i) => (
                <div key={i} style={{ background:C.bg3, borderRadius:12, padding:"14px 16px", border:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:12, color:C.purpleBright, fontWeight:700, marginBottom:6 }}>Q{i+1}: {pair.q}</div>
                  <div style={{ fontSize:12, color:C.muted2, lineHeight:1.6 }}>{pair.a.length > 180 ? pair.a.slice(0,180)+"…" : pair.a}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ background:"rgba(139,92,246,0.09)", border:`1px solid ${C.border2}`, borderRadius:12, padding:"14px 18px", marginBottom:24, fontSize:13, color:C.muted2, lineHeight:1.6 }}>
          <strong style={{ color:C.purpleBright }}>Level:</strong> {level.charAt(0).toUpperCase()+level.slice(1)} &nbsp;·&nbsp;
          <strong style={{ color:C.purpleBright }}>Tip:</strong> {avgScore >= 8 ? "Excellent work! You're well-prepared for this level." : avgScore >= 6 ? "Good answers. Practice STAR format for behavioural questions." : "Keep practicing! Focus on structuring your answers more clearly."}
        </div>
        <button onClick={onClose} style={{ width:"100%", padding:"13px", borderRadius:10, background:C.gradBtn, border:"none", color:"white", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 4px 18px rgba(139,92,246,0.35)` }}>
          Done ✓
        </button>
      </div>
    </div>
  );
}

// ─── GITHUB CARD ──────────────────────────────────────────────────────────────
function GitHubCard() {
  const [hovered, setHovered] = useState(false);
  const contributions = [4,7,2,9,5,11,3,8,6,10,1,7,4,9,12,3,6,8,2,11,5,7,3,10,4,8,6,9,2,7,5,11,3,9,7,4,10,2,6,8,3,11,5,9,4,7];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => window.open(GITHUB_URL, "_blank")}
      style={{
        position:"relative", borderRadius:22, cursor:"pointer",
        overflow:"hidden", transition:"all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        transform: hovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
        animation: hovered ? "glow 2s ease infinite" : "none",
      }}
    >
      {/* Animated gradient border */}
      <div style={{
        position:"absolute", inset:-2, borderRadius:24, zIndex:0,
        background: hovered
          ? "linear-gradient(135deg, #8B5CF6, #EC4899, #06B6D4, #8B5CF6)"
          : "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.2))",
        backgroundSize:"300% 300%",
        animation: hovered ? "rotateBorder 3s ease infinite" : "none",
      }}/>

      {/* Main card */}
      <div style={{
        position:"relative", zIndex:1,
        background: hovered ? "linear-gradient(135deg, #0d1117 0%, #0d1117 100%)" : C.gradGithub,
        borderRadius:22, padding:"28px 28px 22px",
        border:"2px solid transparent",
        transition:"background 0.4s",
      }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
          {/* GitHub avatar placeholder */}
          <div style={{
            width:56, height:56, borderRadius:"50%",
            background:"linear-gradient(135deg, #8B5CF6, #EC4899)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:22, fontWeight:900, color:"white",
            border:"3px solid rgba(139,92,246,0.4)",
            boxShadow: hovered ? "0 0 20px rgba(139,92,246,0.5)" : "none",
            transition:"all 0.3s",
            flexShrink:0,
          }}>S</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <div style={{ fontSize:18, fontWeight:800, color:"#e6edf3" }}>Shrutibhavsar20</div>
              <div style={{
                fontSize:10, padding:"2px 8px", borderRadius:20,
                background:"rgba(139,92,246,0.2)", border:"1px solid rgba(139,92,246,0.4)",
                color:C.purpleBright, fontWeight:700, letterSpacing:"0.5px", textTransform:"uppercase",
              }}>Developer</div>
            </div>
            <div style={{ fontSize:12, color:"#8b949e", marginTop:3, display:"flex", alignItems:"center", gap:6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#8b949e"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              github.com/Shrutibhavsar20
            </div>
          </div>
          {/* Visit arrow */}
          <div style={{
            width:36, height:36, borderRadius:10,
            background: hovered ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.05)",
            border:"1px solid rgba(139,92,246,0.3)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:18, color: hovered ? C.purpleBright : "#8b949e",
            transition:"all 0.3s", flexShrink:0,
          }}>↗</div>
        </div>

        {/* Contribution-like grid */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, color:"#8b949e", marginBottom:8, textTransform:"uppercase", letterSpacing:"1px", fontWeight:600 }}>Contribution Activity</div>
          <div style={{ display:"flex", gap:3, flexWrap:"wrap" }}>
            {contributions.map((val, i) => {
              const opacity = val / 12;
              const color = val > 8 ? C.purple : val > 5 ? "#7C3AED" : val > 2 ? "#6D28D9" : "#1E1B2E";
              return (
                <div key={i} style={{
                  width:10, height:10, borderRadius:2,
                  background: val > 0 ? color : "#161b22",
                  opacity: val > 0 ? 0.4 + opacity * 0.6 : 1,
                  transition:"all 0.2s",
                  transform: hovered && val > 8 ? "scale(1.3)" : "scale(1)",
                  boxShadow: hovered && val > 8 ? `0 0 6px ${C.purple}` : "none",
                }}/>
              );
            })}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display:"flex", gap:16, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          {[
            { icon:"⭐", label:"Stars", value:"24" },
            { icon:"🍴", label:"Forks", value:"8" },
            { icon:"📦", label:"Repos", value:"15" },
          ].map(stat => (
            <div key={stat.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:13 }}>{stat.icon}</span>
              <span style={{ fontSize:13, fontWeight:700, color:"#e6edf3" }}>{stat.value}</span>
              <span style={{ fontSize:11, color:"#8b949e" }}>{stat.label}</span>
            </div>
          ))}
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:C.green, boxShadow:`0 0 6px ${C.green}` }}/>
            <span style={{ fontSize:11, color:"#8b949e" }}>Active</span>
          </div>
        </div>

        {/* Hover CTA */}
        {hovered && (
          <div style={{
            position:"absolute", inset:0, borderRadius:22,
            background:"linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.05))",
            display:"flex", alignItems:"center", justifyContent:"center",
            animation:"fadeIn 0.2s ease", pointerEvents:"none",
          }}>
            <div style={{
              background:"linear-gradient(135deg, #8B5CF6, #EC4899)",
              borderRadius:12, padding:"10px 22px",
              fontSize:13, fontWeight:800, color:"white",
              boxShadow:"0 8px 24px rgba(139,92,246,0.5)",
              letterSpacing:"0.5px",
            }}>View GitHub Profile ↗</div>
          </div>
        )}
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
    if (!form.email)                          return setToast({ msg:"⚠️ Please enter your email",    type:"warn" });
    if (mode !== "forgot" && !form.password)  return setToast({ msg:"⚠️ Please enter your password", type:"warn" });
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
      const response = await fetch(endpoint, { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(payload) });
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
          setToast({ msg:`✅ Password reset! Please sign in`, type:"success" });
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
    <div style={{ width:"100vw", minHeight:"100vh", display:"flex", fontFamily:"'Outfit',sans-serif", background:C.bg, position:"relative", overflow:"hidden" }}>
      <style>{GLOBAL_CSS}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      {oauthModal && <OAuthModal provider={oauthModal} onClose={() => setOauthModal(null)}/>}

      {/* Ambient orbs */}
      {[
        { w:500, h:500, top:"-12%",  left:"-8%",  c:"rgba(139,92,246,0.07)"  },
        { w:400, h:400, bottom:"-8%",right:"-4%",  c:"rgba(236,72,153,0.06)"  },
        { w:280, h:280, top:"42%",   left:"33%",  c:"rgba(6,182,212,0.04)"   },
      ].map((o,i) => (
        <div key={i} style={{ position:"absolute", width:o.w, height:o.h, top:o.top, left:o.left, bottom:o.bottom, right:o.right, borderRadius:"50%", background:`radial-gradient(circle,${o.c},transparent)`, animation:`float ${7+i*2}s ease-in-out infinite alternate`, pointerEvents:"none" }}/>
      ))}

      {/* LEFT panel */}
      <div className="auth-left" style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"flex-start", padding:"60px 72px", borderRight:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:60 }}>
          <Logo size={48}/>
          <div>
            <div style={{ fontSize:26, fontWeight:800, color:C.text, letterSpacing:"-0.5px" }}>InterviewIQ</div>
            <div style={{ fontSize:11, color:C.purpleBright, letterSpacing:"3px", textTransform:"uppercase", marginTop:2 }}>AI Career Coach</div>
          </div>
        </div>
        <div style={{ maxWidth:440 }}>
          <div style={{ fontSize:11, letterSpacing:"2.5px", textTransform:"uppercase", color:C.purpleBright, marginBottom:20, fontWeight:700 }}>Today's Motivation</div>
          <blockquote style={{ fontSize:26, fontWeight:700, color:C.text, lineHeight:1.4, margin:"0 0 20px", fontStyle:"italic", borderLeft:`3px solid ${C.purple}`, paddingLeft:24 }}>"{q.text}"</blockquote>
          <div style={{ color:C.muted2, fontSize:14 }}>— {q.author}</div>
        </div>
        <div style={{ marginTop:80, display:"flex", gap:40 }}>
          {["10K+ Users","50K+ Interviews","4.9★ Rating"].map(t => (
            <div key={t} style={{ color:C.muted, fontSize:13, fontWeight:600 }}>{t}</div>
          ))}
        </div>
      </div>

      {/* RIGHT panel */}
      <div style={{ width:500, display:"flex", flexDirection:"column", justifyContent:"center", padding:"56px 52px" }}>
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
                onFocus={e=>e.target.style.borderColor=C.purple} onBlur={e=>e.target.style.borderColor=C.border}/>
            </div>
          )}
          <div>
            <label style={{ color:C.muted2, fontSize:11, letterSpacing:"1px", textTransform:"uppercase", fontWeight:600 }}>Email</label>
            <input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="you@example.com" type="email" style={IS}
              onFocus={e=>e.target.style.borderColor=C.purple} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
          {mode!=="forgot" && (
            <div>
              <label style={{ color:C.muted2, fontSize:11, letterSpacing:"1px", textTransform:"uppercase", fontWeight:600 }}>Password</label>
              <input value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="••••••••" type="password" style={IS}
                onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                onFocus={e=>e.target.style.borderColor=C.purple} onBlur={e=>e.target.style.borderColor=C.border}/>
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
          boxShadow: loading ? "none" : `0 8px 28px rgba(139,92,246,0.3)`,
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

        <div style={{ marginTop:32, borderTop:`1px solid ${C.border}`, paddingTop:24 }}>
          <div style={{ textAlign:"center", color:C.muted, fontSize:11, marginBottom:16, letterSpacing:"1.5px", textTransform:"uppercase" }}>Or continue with</div>
          <div style={{ display:"flex", gap:10 }}>
            {[
              { name:"Google",   icon:(<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>), action: OAUTH_GOOGLE_ID ? () => {
                const params = new URLSearchParams({
                  client_id: OAUTH_GOOGLE_ID,
                  redirect_uri: `${window.location.origin}/auth/google`,
                  response_type: 'code',
                  scope: 'openid email profile'
                });
                window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
              } : () => setOauthModal("Google") },
              { name:"LinkedIn", icon:(<svg width="15" height="15" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>), action: () => setOauthModal("LinkedIn") },
              { name:"GitHub",   icon:(<svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>), action: () => setOauthModal("GitHub") },
            ].map(p => (
              <button key={p.name} onClick={p.action} style={{
                flex:1, padding:"10px 8px", borderRadius:10,
                background:C.bg3, border:`1px solid ${C.border}`,
                color:C.text, fontSize:12, cursor:"pointer", fontWeight:600,
                transition:"all 0.2s", display:"flex", alignItems:"center",
                justifyContent:"center", gap:7, fontFamily:"inherit",
              }}
                onMouseEnter={e=>{e.currentTarget.style.border=`1px solid ${C.border2}`; e.currentTarget.style.background=C.purpleDim;}}
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
  const [toast, setToast] = useState({ msg:`✅ Welcome back! Ready to ace your next interview?`, type:"success" });

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx(i => (i+1) % QUOTES.length), 8000);
    return () => clearInterval(t);
  }, []);

  const q = QUOTES[quoteIdx];

  return (
    <div style={{ width:"100vw", minHeight:"100vh", fontFamily:"'Outfit',sans-serif", background:C.bg, color:C.text, display:"flex", flexDirection:"column" }}>
      <style>{GLOBAL_CSS}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

      {/* Background mesh */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", width:600, height:600, top:"-15%", right:"-5%", borderRadius:"50%", background:"radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)" }}/>
        <div style={{ position:"absolute", width:500, height:500, bottom:"-10%", left:"-8%", borderRadius:"50%", background:"radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 70%)" }}/>
        <div style={{ position:"absolute", width:300, height:300, top:"40%", left:"50%", borderRadius:"50%", background:"radial-gradient(circle, rgba(6,182,212,0.03) 0%, transparent 70%)" }}/>
      </div>

      {/* Navbar */}
      <nav style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"14px 48px", borderBottom:`1px solid ${C.border}`,
        backdropFilter:"blur(20px)", position:"sticky", top:0, zIndex:100,
        background:"rgba(8,8,16,0.85)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Logo size={32}/>
          <div style={{ fontSize:19, fontWeight:800, letterSpacing:"-0.5px", background:C.gradBtn, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>InterviewIQ</div>
        </div>
        <div style={{ display:"flex", gap:32 }}>
          {["Dashboard","Practice","History","Resources"].map((item,i) => (
            <button key={item} style={{
              background:"none", border:"none", color: i===0 ? C.purpleBright : C.muted2,
              fontSize:14, cursor:"pointer", fontWeight: i===0 ? 700 : 500,
              fontFamily:"inherit", padding:0, transition:"color 0.2s",
            }}
              onMouseEnter={e=>e.target.style.color=C.purpleBright}
              onMouseLeave={e=>e.target.style.color=i===0?C.purpleBright:C.muted2}>
              {item}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          {/* GitHub quick link in nav */}
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" style={{
            display:"flex", alignItems:"center", gap:7, padding:"7px 14px", borderRadius:8,
            background:"rgba(139,92,246,0.1)", border:`1px solid ${C.border2}`,
            color:C.purpleBright, fontSize:12, fontWeight:700, textDecoration:"none",
            transition:"all 0.2s",
          }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(139,92,246,0.2)"; e.currentTarget.style.boxShadow="0 4px 14px rgba(139,92,246,0.25)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(139,92,246,0.1)"; e.currentTarget.style.boxShadow="none";}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill={C.purpleBright}><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            GitHub
          </a>
          <div style={{ width:36, height:36, borderRadius:"50%", background:C.gradBtn, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:800, color:"white" }}>{user.name[0].toUpperCase()}</div>
          <div>
            <div style={{ fontSize:13, fontWeight:700 }}>{user.name}</div>
            <div style={{ fontSize:11, color:C.muted }}>{user.email}</div>
          </div>
          <button onClick={onLogout} style={{ padding:"7px 14px", borderRadius:8, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", color:"#EF4444", fontSize:12, cursor:"pointer", fontWeight:600, fontFamily:"inherit" }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,0.18)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(239,68,68,0.1)"}>
            Sign Out
          </button>
        </div>
      </nav>

      <main style={{ flex:1, padding:"40px 48px 60px", position:"relative", zIndex:1 }}>
        {/* Hero */}
        <div style={{
          borderRadius:24, padding:"48px 56px", background:C.gradCard,
          border:`1px solid ${C.border2}`, marginBottom:36,
          position:"relative", overflow:"hidden", animation:"fadeUp 0.5s ease",
        }}>
          <div style={{ position:"absolute", right:-100, top:-100, width:360, height:360, borderRadius:"50%", background:"radial-gradient(circle,rgba(139,92,246,0.08),transparent)", pointerEvents:"none" }}/>
          <div style={{ position:"absolute", right:60, bottom:-60, width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle,rgba(236,72,153,0.06),transparent)", pointerEvents:"none" }}/>
          <div style={{ fontSize:11, letterSpacing:"3px", textTransform:"uppercase", color:C.purpleBright, fontWeight:700, marginBottom:12 }}>Welcome back</div>
          <h1 style={{ fontSize:42, fontWeight:900, margin:"0 0 14px", letterSpacing:"-1.5px", background:"linear-gradient(135deg, #F1F0FF, #A78BFA)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Hello, {user.name} 👋
          </h1>
          <p style={{ color:C.muted2, fontSize:16, margin:"0 0 32px", maxWidth:540, lineHeight:1.7 }}>
            Your AI coach <strong style={{ color:C.purpleBright }}>Aria</strong> is online, powered by Ollama and ready with tailored interview questions just for you.
          </p>
          <div style={{ display:"flex", gap:14 }}>
            <button onClick={onStartInterview} style={{
              padding:"14px 36px", borderRadius:14, background:C.gradBtn,
              border:"none", color:"white", fontSize:15, fontWeight:700,
              cursor:"pointer", boxShadow:`0 8px 28px rgba(139,92,246,0.38)`,
              transition:"all 0.2s", fontFamily:"inherit",
            }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 14px 38px rgba(139,92,246,0.5)`;}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=`0 8px 28px rgba(139,92,246,0.38)`;}}>
              🎯 Start Interview
            </button>
            <button style={{
              padding:"14px 28px", borderRadius:14,
              background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`,
              color:C.text, fontSize:15, fontWeight:600,
              cursor:"pointer", transition:"all 0.2s", fontFamily:"inherit",
            }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"}>
              📄 Upload Resume
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20, marginBottom:36 }}>
          {STATS.map((s,i) => (
            <div key={s.label} style={{
              borderRadius:18, padding:"24px 22px",
              background:C.bg2, border:`1px solid ${C.border}`,
              animation:`fadeUp 0.5s ease ${i*0.08+0.15}s both`, transition:"all 0.25s", cursor:"default",
              position:"relative", overflow:"hidden",
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.border2; e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow=`0 12px 36px rgba(139,92,246,0.12)`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none";}}>
              <div style={{ fontSize:28, marginBottom:10 }}>{s.icon}</div>
              <div style={{ fontSize:28, fontWeight:900, background:C.gradBtn, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{s.value}</div>
              <div style={{ fontSize:12, color:C.muted2, marginTop:4, fontWeight:600 }}>{s.label}</div>
              <div style={{ position:"absolute", top:16, right:16, fontSize:10, color:C.green, fontWeight:700, background:"rgba(16,185,129,0.12)", padding:"2px 7px", borderRadius:20, border:"1px solid rgba(16,185,129,0.25)" }}>{s.change}</div>
            </div>
          ))}
        </div>

        {/* Main grid — 3 columns */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 360px", gap:24 }}>
          
          {/* Recent Sessions */}
          <div style={{ borderRadius:22, padding:"28px", background:C.bg2, border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:16, fontWeight:800, marginBottom:22, display:"flex", alignItems:"center", gap:10 }}>
              <span>Recent Sessions</span>
              <span style={{ fontSize:10, color:C.purpleBright, background:"rgba(139,92,246,0.15)", padding:"2px 8px", borderRadius:20, fontWeight:700 }}>LIVE</span>
            </div>
            {RECENT.map((r,i) => (
              <div key={i} style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"14px 18px", borderRadius:14, background:C.bg3,
                border:`1px solid ${C.border}`, marginBottom:10,
                transition:"all 0.2s", cursor:"pointer",
              }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.border2; e.currentTarget.style.background=C.purpleDim; e.currentTarget.style.transform="translateX(4px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background=C.bg3; e.currentTarget.style.transform="none";}}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{r.role}</div>
                  <div style={{ fontSize:11, color:C.muted2, marginTop:3 }}>{r.date} · {r.level}</div>
                </div>
                <div style={{
                  padding:"5px 14px", borderRadius:20, fontWeight:800, fontSize:13,
                  background: r.score>=9 ? C.greenDim : r.score>=8 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.1)",
                  color:      r.score>=9 ? C.green     : r.score>=8 ? C.amber           : C.danger,
                  border:`1px solid ${r.score>=9?"rgba(16,185,129,0.3)":r.score>=8?"rgba(245,158,11,0.35)":"rgba(239,68,68,0.3)"}`,
                }}>{r.score}/10</div>
              </div>
            ))}
          </div>

          {/* Aria + Quote */}
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            {/* Aria card */}
            <div style={{ borderRadius:22, padding:"24px", background:C.purpleDim, border:`1px solid ${C.border2}`, flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
                <div style={{ width:50, height:50, borderRadius:"50%", background:C.gradBtn, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:`0 4px 20px rgba(139,92,246,0.4)` }}>🤖</div>
                <div>
                  <div style={{ fontWeight:800, fontSize:16 }}>Meet Aria</div>
                  <div style={{ fontSize:11, color:C.green, marginTop:3, display:"flex", alignItems:"center", gap:5 }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:C.green, boxShadow:`0 0 6px ${C.green}` }}/>
                    Online · AI Interviewer
                  </div>
                </div>
              </div>
              <p style={{ color:C.muted2, fontSize:13, lineHeight:1.7, margin:"0 0 18px" }}>
                Aria adapts to your level, asks sharp follow-ups, and gives instant feedback powered by Ollama.
              </p>
              <button onClick={onStartInterview} style={{
                width:"100%", padding:"12px", borderRadius:12, background:C.gradBtn,
                border:"none", color:"white", fontWeight:700, fontSize:13,
                cursor:"pointer", fontFamily:"inherit", boxShadow:`0 4px 18px rgba(139,92,246,0.3)`, transition:"all 0.2s",
              }}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 8px 28px rgba(139,92,246,0.5)`; e.currentTarget.style.transform="translateY(-1px)";}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow=`0 4px 18px rgba(139,92,246,0.3)`; e.currentTarget.style.transform="none";}}>
                Chat with Aria →
              </button>
            </div>

            {/* Quote */}
            <div style={{ borderRadius:22, padding:"22px", background:`linear-gradient(135deg,rgba(139,92,246,0.07),rgba(6,182,212,0.04))`, border:`1px solid ${C.border2}` }}>
              <div style={{ fontSize:10, letterSpacing:"2px", textTransform:"uppercase", color:C.cyan, fontWeight:700, marginBottom:12 }}>✨ Daily Fuel</div>
              <div key={quoteIdx} style={{ fontSize:14, fontStyle:"italic", lineHeight:1.7, fontWeight:600, color:C.text, marginBottom:10, animation:"fadeIn 0.5s ease" }}>"{q.text}"</div>
              <div style={{ fontSize:12, color:C.muted2 }}>— {q.author}</div>
            </div>
          </div>

          {/* GitHub Card — right column */}
          <div>
            <div style={{ fontSize:11, color:C.muted2, textTransform:"uppercase", letterSpacing:"2px", fontWeight:700, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill={C.purpleBright}><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              Connect
            </div>
            <GitHubCard />

            {/* Floating "Check out my code" badge */}
            <div style={{ marginTop:14, textAlign:"center" }}>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" style={{
                display:"inline-flex", alignItems:"center", gap:8,
                padding:"10px 20px", borderRadius:100,
                background:"linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.1))",
                border:`1px solid ${C.border2}`,
                color:C.text, textDecoration:"none", fontSize:12, fontWeight:700,
                transition:"all 0.3s", letterSpacing:"0.3px",
              }}
                onMouseEnter={e=>{e.currentTarget.style.background="linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.2))"; e.currentTarget.style.boxShadow=`0 8px 24px rgba(139,92,246,0.3)`; e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.1))"; e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="none";}}>
                <span style={{ fontSize:14 }}>✨</span>
                <span>See my projects</span>
                <span style={{ opacity:0.6 }}>→</span>
              </a>
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
      setMessages(m => [...m, { role:"bot", text:`📄 Resume uploaded and analyzed!\n\nLet's begin your ${level}-level interview. Tell me about yourself and your most recent role.` }]);
      setToast({ msg:"✅ Resume uploaded successfully!", type:"success" });
    } catch (err) {
      setToast({ msg:`❌ Upload failed: ${err.message}. Is your FastAPI running?`, type:"error" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || typing) return;
    setInput("");
    const newMessages = [...messages, { role:"user", text:msg }];
    setMessages(newMessages);
    setTyping(true);
    try {
      const res = await fetch(`${API}/chat/`, { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ message:msg, level }) });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setTyping(false);
      if (data.error) {
        setMessages(m => [...m, { role:"bot", text:`⚠️ ${data.error}\n\n${data.question || ""}` }]);
        setToast({ msg:`❌ ${data.error}`, type:"error" });
        return;
      }
      let botReply = "";
      if (data.score !== undefined && data.feedback) {
        botReply = `📊 Score: ${data.score}/10\n\n${data.feedback}`;
      }
      if (data.question) {
        botReply += (botReply ? "\n\n" : "") + data.question;
      }
      if (!botReply && data.response) {
        botReply = data.response;
      }
      if (!botReply) {
        botReply = "I received your message. Could you elaborate more?";
      }
      setMessages(m => [...m, { role:"bot", text:botReply }]);
    } catch (err) {
      setTyping(false);
      const errMsg = `❌ Connection error: ${err.message}\n\nMake sure your FastAPI server is running on ${API}`;
      setMessages(m => [...m, { role:"bot", text:errMsg }]);
      setToast({ msg:`❌ ${err.message}`, type:"error" });
    }
  };

  return (
    <div style={{ width:"100vw", height:"100vh", display:"flex", flexDirection:"column", background:C.bg, color:C.text, fontFamily:"'Outfit',sans-serif" }}>
      <style>{GLOBAL_CSS}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      {showSummary && <SummaryModal messages={messages} level={level} onClose={() => setShowSummary(false)} userName={user.name}/>}

      {/* Navbar */}
      <nav style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 32px", borderBottom:`1px solid ${C.border}`,
        background:"rgba(8,8,16,0.9)", backdropFilter:"blur(20px)", flexShrink:0,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <button onClick={onBack} style={{
            display:"flex", alignItems:"center", gap:8, padding:"7px 14px", borderRadius:8,
            background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`,
            color:C.muted2, fontSize:13, cursor:"pointer", fontWeight:600, fontFamily:"inherit",
            transition:"all 0.2s",
          }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.color=C.text;}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.color=C.muted2;}}>
            ← Back
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <Logo size={28}/>
            <span style={{ fontWeight:800, fontSize:17, background:C.gradBtn, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>InterviewIQ</span>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ fontSize:12, color:C.muted2, fontWeight:600 }}>Difficulty:</div>
          <select value={level} onChange={e=>setLevel(e.target.value)} style={{
            background:C.bg3, border:`1px solid ${C.border}`, color:C.text,
            padding:"6px 12px", borderRadius:8, fontSize:13, cursor:"pointer",
            fontFamily:"inherit", fontWeight:700, outline:"none",
          }}>
            {["junior","mid","senior"].map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase()+l.slice(1)}</option>)}
          </select>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:8, background:"rgba(139,92,246,0.1)", border:`1px solid ${C.border2}` }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:C.green, boxShadow:`0 0 8px ${C.green}` }}/>
            <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{user.name}</span>
          </div>
        </div>
      </nav>

      {/* Interview layout */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {/* Sidebar */}
        <div style={{ width:260, borderRight:`1px solid ${C.border}`, background:C.bg2, padding:"20px 16px", display:"flex", flexDirection:"column", gap:16, overflowY:"auto", flexShrink:0 }}>
          {/* Aria profile */}
          <div style={{ borderRadius:16, padding:"18px", textAlign:"center", background:C.purpleDim, border:`1px solid ${C.border2}` }}>
            <div style={{ width:60, height:60, borderRadius:"50%", background:C.gradBtn, margin:"0 auto 12px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, boxShadow:`0 4px 20px rgba(139,92,246,0.4)` }}>🤖</div>
            <div style={{ fontSize:15, fontWeight:800 }}>Aria</div>
            <div style={{ fontSize:11, color:C.green, marginTop:4, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:C.green, animation:"pulse 2s ease infinite" }}/>
              Live Interview Mode
            </div>
            <div style={{ fontSize:11, color:C.muted2, marginTop:8, lineHeight:1.5 }}>
              {level.charAt(0).toUpperCase()+level.slice(1)}-level · Powered by Ollama
            </div>
          </div>

          {/* Resume */}
          <div style={{ borderRadius:16, padding:"16px", background:C.bg3, border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:10, fontWeight:700, marginBottom:10, color:C.muted2, textTransform:"uppercase", letterSpacing:"1px" }}>Resume</div>
            {!uploadDone ? (
              <>
                <div onClick={() => !uploading && fileRef.current?.click()} style={{
                  border:`2px dashed ${C.border2}`, borderRadius:10,
                  padding:"18px 12px", textAlign:"center", marginBottom:10,
                  cursor: uploading ? "not-allowed" : "pointer", transition:"all 0.2s",
                }}
                  onMouseEnter={e => !uploading && (e.currentTarget.style.borderColor=C.purple)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor=C.border2)}>
                  <div style={{ fontSize:22, marginBottom:5 }}>{uploading ? "⏳" : "📄"}</div>
                  <div style={{ fontSize:11, color:C.muted2 }}>{uploading ? "Uploading..." : "Click to select PDF"}</div>
                </div>
                <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileChange} style={{ display:"none" }}/>
                <button onClick={() => !uploading && fileRef.current?.click()} disabled={uploading} style={{
                  width:"100%", padding:"8px", borderRadius:8,
                  background: uploading ? C.bg2 : C.purpleDim2,
                  border:`1px solid ${uploading ? C.border : C.border2}`,
                  color: uploading ? C.muted : C.purpleBright,
                  fontSize:11, cursor: uploading ? "not-allowed" : "pointer",
                  fontWeight:700, fontFamily:"inherit", transition:"all 0.2s",
                }}>
                  {uploading ? "⏳ Uploading..." : "Upload Resume (PDF)"}
                </button>
              </>
            ) : (
              <div style={{ padding:"12px", borderRadius:10, textAlign:"center", background:C.greenDim, border:"1px solid rgba(16,185,129,0.25)" }}>
                <div style={{ fontSize:20 }}>✅</div>
                <div style={{ fontSize:11, color:C.green, marginTop:5, fontWeight:700 }}>Resume analyzed!</div>
              </div>
            )}
          </div>

          {/* Tips */}
          <div style={{ borderRadius:16, padding:"16px", background:C.bg3, border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:10, fontWeight:700, marginBottom:10, color:C.purpleBright, textTransform:"uppercase", letterSpacing:"1px" }}>💡 Tips</div>
            {["Use STAR format","Keep answers 1–2 min","Ask clarifying questions","Show enthusiasm & energy"].map(tip => (
              <div key={tip} style={{ fontSize:11, color:C.muted2, marginBottom:8, paddingLeft:10, borderLeft:`2px solid ${C.border2}`, lineHeight:1.5 }}>{tip}</div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* Messages */}
          <div ref={chatRef} style={{
            flex:1, padding:"24px", overflowY:"auto",
            display:"flex", flexDirection:"column", gap:16,
          }}>
            {messages.map((m,i) => (
              <div key={i} style={{ display:"flex", justifyContent: m.role==="user"?"flex-end":"flex-start", animation:"fadeUp 0.3s ease" }}>
                {m.role==="bot" && (
                  <div style={{ width:32, height:32, borderRadius:"50%", marginRight:10, flexShrink:0, background:C.gradBtn, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, boxShadow:`0 2px 10px rgba(139,92,246,0.35)` }}>🤖</div>
                )}
                <div style={{
                  maxWidth:"72%", padding:"13px 17px",
                  borderRadius: m.role==="user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                  background: m.role==="user"
                    ? `linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.12))`
                    : C.bg3,
                  border: m.role==="user" ? `1px solid ${C.border2}` : `1px solid ${C.border}`,
                  fontSize:14, lineHeight:1.75, color:C.text, whiteSpace:"pre-wrap",
                  boxShadow: m.role==="user" ? `0 4px 16px rgba(139,92,246,0.15)` : "none",
                }}>
                  {m.text}
                </div>
                {m.role==="user" && (
                  <div style={{ width:32, height:32, borderRadius:"50%", marginLeft:10, flexShrink:0, background:C.gradBtn, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13, color:"white" }}>
                    {user.name[0].toUpperCase()}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:C.gradBtn, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🤖</div>
                <div style={{ padding:"13px 18px", borderRadius:"4px 18px 18px 18px", background:C.bg3, border:`1px solid ${C.border}` }}>
                  <div style={{ display:"flex", gap:5 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:C.purple, animation:`pulse 1s ease ${i*0.2}s infinite` }}/>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input bar */}
          <div style={{ padding:"16px 24px 20px", borderTop:`1px solid ${C.border}`, background:"rgba(8,8,16,0.5)", backdropFilter:"blur(10px)", flexShrink:0 }}>
            <div style={{ display:"flex", gap:10, marginBottom:10 }}>
              <input value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMessage()}
                placeholder="Type your answer and press Enter..."
                disabled={typing}
                style={{
                  flex:1, padding:"14px 20px", borderRadius:14,
                  background:C.bg2, border:`1px solid ${C.border}`,
                  color:C.text, fontSize:14, fontFamily:"inherit", outline:"none",
                  transition:"border-color 0.2s", opacity: typing ? 0.6 : 1,
                }}
                onFocus={e=>e.target.style.borderColor=C.purple}
                onBlur={e=>e.target.style.borderColor=C.border}/>
              <button onClick={sendMessage} disabled={typing} style={{
                padding:"14px 26px", borderRadius:14,
                background: typing ? C.bg3 : C.gradBtn,
                border:`1px solid ${typing ? C.border : "transparent"}`,
                color:"white", fontSize:14, fontWeight:700,
                cursor: typing ? "not-allowed" : "pointer", fontFamily:"inherit",
                boxShadow: typing ? "none" : `0 4px 20px rgba(139,92,246,0.36)`,
                transition:"all 0.2s", minWidth:96,
              }}>
                {typing ? "···" : "Send →"}
              </button>
            </div>
            <button onClick={() => setShowSummary(true)} style={{
              padding:"12px", borderRadius:10, width:"100%",
              background:`linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.06))`,
              border:"1px solid rgba(16,185,129,0.3)",
              color:C.green, fontSize:14, fontWeight:700,
              cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
            }}
              onMouseEnter={e=>{e.currentTarget.style.background=`rgba(16,185,129,0.16)`; e.currentTarget.style.boxShadow=`0 4px 18px rgba(16,185,129,0.15)`;}}
              onMouseLeave={e=>{e.currentTarget.style.background=`linear-gradient(135deg,rgba(16,185,129,0.1),rgba(16,185,129,0.06))`; e.currentTarget.style.boxShadow="none";}}>
              📊 End Interview & View Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("auth");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Handle OAuth callback from Google (or other providers)
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (code) {
      // Extract basic user info from Google token
      // For production, verify the token on the backend
      // For now, we'll use a simplified flow

      // Call backend with placeholder email/name
      // In a real implementation, use Google's token endpoint to get actual user info
      const email = localStorage.getItem("oauth_email") || "user@example.com";
      const name = localStorage.getItem("oauth_name") || "User";

      fetch(`${API}/auth/oauth-callback/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name })
      })
        .then(r => r.json())
        .then(data => {
          if (data.success && data.user) {
            setUser(data.user);
            setPage("dashboard");
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            localStorage.removeItem("oauth_email");
            localStorage.removeItem("oauth_name");
          }
        })
        .catch(err => console.error("OAuth callback error:", err));
    }
  }, []);

  return page==="auth"      ? <AuthPage onLogin={u=>{setUser(u);setPage("dashboard");}}/> :
         page==="dashboard" ? <Dashboard user={user} onStartInterview={()=>setPage("interview")} onLogout={()=>{setUser(null);setPage("auth");}}/> :
                              <InterviewPage user={user} onBack={()=>setPage("dashboard")}/>;
}