"use client";

import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function LoginPage() {
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    return createClient(url, key);
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { alert(error.message); }
      else { window.location.href = "/"; }
    } catch (err) { alert("Eroare: " + String(err)); }
    setLoading(false);
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { alert(error.message); }
      else { alert("Cont creat cu succes."); }
    } catch (err) { alert("Eroare: " + String(err)); }
    setLoading(false);
  };

  return (
    <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0f172a", color:"white" }}>
      <div style={{ background:"#1e293b", padding:30, borderRadius:12, width:320, boxShadow:"0 10px 30px rgba(0,0,0,0.4)" }}>
        <h2 style={{ marginBottom:20, textAlign:"center" }}>SolarDiag Login</h2>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ width:"100%", padding:10, marginBottom:10, borderRadius:6, border:"1px solid #334155", background:"#0f172a", color:"white", fontSize:16 }} />
        <input type="password" placeholder="Parola" value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ width:"100%", padding:10, marginBottom:20, borderRadius:6, border:"1px solid #334155", background:"#0f172a", color:"white", fontSize:16 }} />
        <button onClick={handleLogin} disabled={loading}
          style={{ width:"100%", padding:12, background:"#3b82f6", border:"none", borderRadius:8, color:"white", marginBottom:10, cursor:"pointer", fontSize:16, fontWeight:700 }}>
          {loading ? "Se procesează..." : "Login"}
        </button>
        <button onClick={handleSignup} disabled={loading}
          style={{ width:"100%", padding:12, background:"#10b981", border:"none", borderRadius:8, color:"white", cursor:"pointer", fontSize:16, fontWeight:700 }}>
          Creează cont
        </button>
      </div>
    </div>
  );
}