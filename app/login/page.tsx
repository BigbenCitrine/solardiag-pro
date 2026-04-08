"use client";

import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function LoginPage() {
  const supabase = useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { alert(error.message); } 
      else { alert("Cont creat cu succes."); }
    } catch (err) { alert("Eroare signup: " + String(err)); }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { alert(error.message); } 
      else { window.location.href = "/"; }
    } catch (err) { alert("Eroare login: " + String(err)); }
    setLoading(false);
  };

  return (
    <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0f172a", color:"white" }}>
      <div style={{ background:"#1e293b", padding:30, borderRadius:12, width:320, boxShadow:"0 10px 30px rgba(0,0,0,0.4)" }}>
        <h2 style={{ marginBottom:20, textAlign:"center" }}>SolarDiag Login</h2>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ width:"100%", padding:10, marginBottom:10, borderRadius:6, border:"1px solid #334155", background:"#0f172a", color:"white" }} />
        <input type="password" placeholder="Parola" value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ width:"100%", padding:10, marginBottom:20, borderRadius:6, border:"1px solid #334155", background:"#0f172a", color:"white" }} />
        <button onClick={handleLogin} disabled={loading}
          style={{ width:"100%", padding:10, background:"#3b82f6", border:"none", borderRadius:6, color:"white", marginBottom:10, cursor:"pointer" }}>
          Login
        </button>
        <button onClick={handleSignup} disabled={loading}
          style={{ width:"100%", padding:10, background:"#10b981", border:"none", borderRadius:6, color:"white", cursor:"pointer" }}>
          Creează cont
        </button>
      </div>
    </div>
  );
}