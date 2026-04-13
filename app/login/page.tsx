"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type HistoryItem = { id: number; text: string; result: string; };

type RawProfile = {
  uuid: string; email: string;
  role: "master" | "admin" | "trusted" | "pro" | "installer" | "free";
  status: "active" | "suspended" | "banned";
  can_use_image: boolean;
  weekly_text_limit: number; weekly_image_limit: number;
  text_used_this_week: number; image_used_this_week: number;
  usage_reset_at: string;
  monthly_text_limit: number; monthly_image_limit: number;
  text_used_this_month: number; image_used_this_month: number;
  monthly_spend_cap: number; estimated_spend_this_month: number;
  billing_period_reset_at: string;
};

type EffectiveProfile = RawProfile & {
  effectiveCanUseImage: boolean;
  effectiveWeeklyTextLimit: number;
  effectiveWeeklyImageLimit: number | null;
  effectiveMonthlyTextLimit: number;
  effectiveMonthlyImageLimit: number | null;
  unlimitedText: boolean;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const IBAN = "RO44 REVO 0000 1558 9943 9674";

function getRolePolicy(role: RawProfile["role"]) {
  switch (role) {
    case "master": return { effectiveCanUseImage: true, effectiveWeeklyTextLimit: Number.MAX_SAFE_INTEGER, effectiveWeeklyImageLimit: null, effectiveMonthlyTextLimit: Number.MAX_SAFE_INTEGER, effectiveMonthlyImageLimit: null, unlimitedText: true };
    case "admin": return { effectiveCanUseImage: true, effectiveWeeklyTextLimit: Number.MAX_SAFE_INTEGER, effectiveWeeklyImageLimit: null, effectiveMonthlyTextLimit: Number.MAX_SAFE_INTEGER, effectiveMonthlyImageLimit: null, unlimitedText: true };
    case "installer": return { effectiveCanUseImage: true, effectiveWeeklyTextLimit: Number.MAX_SAFE_INTEGER, effectiveWeeklyImageLimit: null, effectiveMonthlyTextLimit: 400, effectiveMonthlyImageLimit: 100, unlimitedText: false };
    case "pro": return { effectiveCanUseImage: true, effectiveWeeklyTextLimit: Number.MAX_SAFE_INTEGER, effectiveWeeklyImageLimit: null, effectiveMonthlyTextLimit: 100, effectiveMonthlyImageLimit: 20, unlimitedText: false };
    case "trusted": return { effectiveCanUseImage: true, effectiveWeeklyTextLimit: 20, effectiveWeeklyImageLimit: 10, effectiveMonthlyTextLimit: 80, effectiveMonthlyImageLimit: 40, unlimitedText: false };
    case "free": default: return { effectiveCanUseImage: false, effectiveWeeklyTextLimit: 2, effectiveWeeklyImageLimit: 0, effectiveMonthlyTextLimit: 8, effectiveMonthlyImageLimit: 0, unlimitedText: false };
  }
}

function applyRolePolicy(profile: RawProfile): EffectiveProfile {
  return { ...profile, ...getRolePolicy(profile.role) };
}

function UpgradeModal({ plan, onClose }: { plan: "pro" | "installer"; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const isPro = plan === "pro";
  const planName = isPro ? "PRO" : "INSTALLER";
  const price = isPro ? "5€/lună" : "20€/lună";
  const features = isPro
    ? ["100 analize text/lună", "20 analize poze/lună", "Acces AI complet", "Diagnoză rapidă"]
    : ["400 analize text/lună", "100 analize poze/lună", "Acces AI complet", "Volum profesional"];

  const copyIBAN = () => {
    navigator.clipboard.writeText(IBAN);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 24, padding: 24, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" }}>Activează {planName}</h2>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#64748b" }}>✕</button>
        </div>
        <div style={{ background: isPro ? "linear-gradient(135deg,#1d4ed8,#3b82f6)" : "linear-gradient(135deg,#059669,#10b981)", color: "white", borderRadius: 12, padding: "10px 16px", fontSize: 22, fontWeight: 800, textAlign: "center", marginBottom: 16 }}>
          {price}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {features.map((f, i) => <div key={i} style={{ fontSize: 15, color: "#334155", fontWeight: 600 }}>✓ {f}</div>)}
        </div>
        <div style={{ height: 1, background: "#e2e8f0", margin: "16px 0" }} />
        <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, margin: "0 0 16px" }}>
          Trimite plata prin transfer bancar la IBAN-ul de mai jos. <b>Menționează emailul tău</b> în descrierea plății. Contul va fi activat în maxim 24 ore lucrătoare.
        </p>
        <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "12px 14px", marginBottom: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>IBAN (RON / EUR) · Revolut</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", letterSpacing: 0.5 }}>{IBAN}</span>
          <button onClick={copyIBAN} style={{ background: isPro ? "#1d4ed8" : "#059669", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", alignSelf: "flex-start" }}>
            {copied ? "✓ Copiat!" : "Copiază IBAN"}
          </button>
        </div>
        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>💡 După confirmarea plății, contul va fi activat în maxim 24h.</p>
        <button onClick={onClose} style={{ width: "100%", background: isPro ? "#1d4ed8" : "#059669", color: "white", border: "none", borderRadius: 14, padding: "14px 16px", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
          Am efectuat plata
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const supabase = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState<EffectiveProfile | null>(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageResult, setImageResult] = useState("");
  const [activeTab, setActiveTab] = useState<"text" | "image">("text");
  const [upgradeModal, setUpgradeModal] = useState<"pro" | "installer" | null>(null);

  const remainingTextMonth = profile && !profile.unlimitedText ? Math.max(profile.effectiveMonthlyTextLimit - profile.text_used_this_month, 0) : null;
  const remainingTextWeek = profile && !profile.unlimitedText && profile.role === "free" ? Math.max(profile.effectiveWeeklyTextLimit - profile.text_used_this_week, 0) : null;

  useEffect(() => {
    const init = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      // 🔧 CORECTARE: Nu mai facem redirect automat la /login
      // În schimb, setăm starea și lăsăm componenta să redea ecranul de acces restricționat
      if (userError || !userData.user) {
        setCheckingAuth(false);
        setAuthorized(false);
        return;
      }
      
      setUserEmail(userData.user.email || "");
      const loadedProfile = await loadProfile(userData.user.id);
      if (!loadedProfile || loadedProfile.status !== "active") {
        setAuthorized(false);
        setCheckingAuth(false);
        return;
      }
      setProfile(loadedProfile);
      setAuthorized(true);
      setCheckingAuth(false);
      
      const saved = localStorage.getItem("solardiag-history");
      if (saved) {
        try { setHistory(JSON.parse(saved)); } catch { setHistory([]); }
      }
    };
    init();
  }, [supabase]);

  async function loadProfile(userUuid: string): Promise<EffectiveProfile | null> {
    const { data, error } = await supabase.from("profiles").select("*").eq("uuid", userUuid).single();
    if (error || !data) return null;
    const normalized = await normalizeWeeklyUsage(data as RawProfile);
    return applyRolePolicy(normalized);
  }

  async function normalizeWeeklyUsage(rawProfile: RawProfile): Promise<RawProfile> {
    const lastReset = rawProfile.usage_reset_at ? new Date(rawProfile.usage_reset_at).getTime() : 0;
    if (!lastReset || Date.now() - lastReset > WEEK_MS) {
      const { error } = await supabase.from("profiles").update({
        text_used_this_week: 0,
        image_used_this_week: 0,
        usage_reset_at: new Date().toISOString()
      }).eq("uuid", rawProfile.uuid);
      if (!error) return { ...rawProfile, text_used_this_week: 0, image_used_this_week: 0, usage_reset_at: new Date().toISOString() };
    }
    return rawProfile;
  }

  async function resetWeeklyUsageForCurrentUser() {
    if (!profile) return;
    const { error } = await supabase.from("profiles").update({
      text_used_this_week: 0,
      image_used_this_week: 0,
      usage_reset_at: new Date().toISOString()
    }).eq("uuid", profile.uuid);
    if (error) {
      setResult("Resetarea limitei a eșuat.");
      return;
    }
    setProfile({
      ...profile,
      text_used_this_week: 0,
      image_used_this_week: 0,
      usage_reset_at: new Date().toISOString()
    });
    setResult("Limita săptămânală a fost resetată.");
  }

  const analyze = async () => {
    if (!text.trim()) {
      setResult("Introdu un cod de eroare sau o descriere.");
      return;
    }
    if (!profile) return;
    
    setLoading(true);
    setResult("");
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setResult("Nu există sesiune activă.");
        return;
      }
      
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ text })
      });
      
      const raw = await res.text();
      let data: { result?: string; error?: string } | null = null;
      try { data = JSON.parse(raw); } catch { data = null; }
      
      if (!res.ok) {
        setResult(`Eroare backend (${res.status})\n${raw}`);
        return;
      }
      
      if (data?.result) {
        setResult(data.result);
        const newItem = { id: Date.now(), text, result: data.result };
        const updated = [newItem, ...history].slice(0, 20);
        setHistory(updated);
        localStorage.setItem("solardiag-history", JSON.stringify(updated));
      } else if (data?.error) {
        setResult(`Eroare: ${data.error}`);
      }
    } catch (err) {
      setResult(`Eroare: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImageResult("");
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!imageFile || !profile) return;
    if (!profile.effectiveCanUseImage) {
      setImageResult("Disponibil doar în planul PRO sau INSTALLER.");
      return;
    }
    
    setImageLoading(true);
    setImageResult("");
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setImageResult("Sesiune expirată.");
        return;
      }
      
      const formData = new FormData();
      formData.append("image", imageFile);
      
      const res = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData
      });
      
      const raw = await res.text();
      let data: { result?: string; error?: string } | null = null;
      try { data = JSON.parse(raw); } catch { data = null; }
      
      if (data?.result) setImageResult(data.result);
      else if (data?.error) setImageResult(`Eroare: ${data.error}`);
    } catch (err) {
      setImageResult(`Eroare: ${String(err)}`);
    } finally {
      setImageLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("solardiag-history");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  // 🔧 Ecran de încărcare
  if (checkingAuth) {
    return (
      <main style={s.centerScreen}>
        <div style={s.statusCard}>
          <h2 style={{ marginTop: 0 }}>Se verifică accesul...</h2>
          <p style={{ marginBottom: 0 }}>Așteaptă o secundă.</p>
        </div>
      </main>
    );
  }

  // 🔧 CORECTARE: Ecran pentru utilizatori neautentificați
  if (!authorized || !profile) {
    return (
      <main style={s.centerScreen}>
        <div style={s.statusCard}>
          <h2 style={{ marginTop: 0 }}>Acces restricționat</h2>
          <p>Trebuie să te autentifici pentru a accesa aplicația.</p>
          <button onClick={() => window.location.href = "/login"} style={s.primarySmallBtn}>
            Mergi la Login
          </button>
        </div>
      </main>
    );
  }

  const canUseImage = profile.effectiveCanUseImage;
  const isFree = profile.role === "free";

  return (
    <>
      <style>{`* { box-sizing: border-box; } body { margin: 0; padding: 0; } textarea, input { font-size: 16px !important; }`}</style>
      {upgradeModal && <UpgradeModal plan={upgradeModal} onClose={() => setUpgradeModal(null)} />}

      <main style={s.page}>
        <div style={s.shell}>
          <header style={s.header}>
            <div style={s.logo}>⚡</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={s.title}>SolarDiag Pro</h1>
              <p style={s.subtitle}>Diagnostic inteligent pentru invertoare fotovoltaice</p>
              <p style={s.userLine}><b>{userEmail}</b> · <b>{profile.role}</b></p>
            </div>
            <button onClick={handleLogout} style={s.logoutBtn}>Ieșire</button>
          </header>

          <section style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={s.badge}>{profile.role.toUpperCase()}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                {profile.unlimitedText
                  ? "nelimitat"
                  : profile.role === "free"
                    ? `${profile.text_used_this_week} / ${profile.effectiveWeeklyTextLimit} / săpt.`
                    : `${profile.text_used_this_month} / ${profile.effectiveMonthlyTextLimit} / lună`
                }
              </span>
            </div>
            <p style={{ margin: 0, color: "#334155", fontSize: 13 }}>
              {profile.unlimitedText
                ? "Acces extins, fără limită practică."
                : profile.role === "free"
                  ? `Îți mai rămân ${remainingTextWeek} analize text în această săptămână.`
                  : `Îți mai rămân ${remainingTextMonth} analize text în această lună.`
              }
            </p>
          </section>

          {isFree && (
            <section style={s.card}>
              <p style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>🚀 Upgrade pentru mai multe funcții</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setUpgradeModal("pro")} style={s.btnPro}>
                  <span style={{ fontSize: 22 }}>⚡</span>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>PRO</span>
                  <span style={{ fontSize: 16, fontWeight: 800 }}>5€/lună</span>
                  <span style={{ fontSize: 10, opacity: 0.9, textAlign: "center" }}>100 text · 20 poze · AI</span>
                </button>
                <button onClick={() => setUpgradeModal("installer")} style={s.btnInstaller}>
                  <span style={{ fontSize: 22 }}>🔧</span>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>INSTALLER</span>
                  <span style={{ fontSize: 16, fontWeight: 800 }}>20€/lună</span>
                  <span style={{ fontSize: 10, opacity: 0.9, textAlign: "center" }}>400 text · 100 poze · AI</span>
                </button>
              </div>
            </section>
          )}

          <section style={s.proCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div>
                <div style={s.proBadge}>CONT ACTIV</div>
                <h2 style={s.proTitle}>
                  {profile.role === "master" ? "Control total" :
                   profile.role === "admin" ? "Administrator" :
                   profile.role === "installer" ? "Plan INSTALLER" :
                   profile.role === "pro" ? "Plan PRO" :
                   profile.role === "trusted" ? "Plan TRUSTED" : "Plan FREE"}
                </h2>
              </div>
              <div style={s.proIcon}>{canUseImage ? "📷" : "🔒"}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12, marginBottom: 14 }}>
              <div style={s.proFeature}>
                📝 Text: {profile.unlimitedText
                  ? "nelimitat"
                  : profile.role === "free"
                    ? `${profile.effectiveWeeklyTextLimit}/săpt.`
                    : `${profile.effectiveMonthlyTextLimit}/lună`
                }
              </div>
              <div style={s.proFeature}>
                📷 Poză: {canUseImage
                  ? `activă ✓${profile.effectiveMonthlyImageLimit ? ` (${profile.effectiveMonthlyImageLimit}/lună)` : ""}`
                  : "indisponibil – upgrade la PRO"
                }
              </div>
              <div style={s.proFeature}>
                🤖 AI: {profile.role === "free" ? "indisponibil – upgrade la PRO" : "activ ✓"}
              </div>
            </div>
            {!isFree && (
              <button style={s.proBtn} onClick={() => setResult(`Contul tău are rolul ${profile.role}.`)}>
                Vezi status cont
              </button>
            )}
          </section>

          <div style={s.tabBar}>
            <button
              style={{ ...s.tab, ...(activeTab === "text" ? s.tabActive : {}) }}
              onClick={() => setActiveTab("text")}
            >
              📝 Analiză text
            </button>
            <button
              style={{
                ...s.tab,
                ...(activeTab === "image" ? s.tabActive : {}),
                ...(!canUseImage ? { color: "#94a3b8" } : {})
              }}
              onClick={() => {
                if (!canUseImage) {
                  setUpgradeModal("pro");
                  return;
                }
                setActiveTab("image");
              }}
            >
              📷 Analiză poză {!canUseImage && "🔒"}
            </button>
          </div>

          {activeTab === "text" && (
            <section style={s.card}>
              <div style={s.sectionTop}>
                <h2 style={s.sectionTitle}>Analiză text</h2>
                <span style={s.tag}>Activ</span>
              </div>
              <textarea
                placeholder="Ex: Growatt 202, Deye F04, utility loss, over temperature..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={s.textarea}
                rows={5}
              />
              <button onClick={analyze} disabled={loading} style={{ ...s.primaryBtn, opacity: loading ? 0.7 : 1 }}>
                {loading ? "⏳ Se analizează..." : "🔍 Analizează eroarea"}
              </button>
              {result && (
                <div style={s.resultBox}>
                  <pre style={s.resultText}>{result}</pre>
                </div>
              )}
            </section>
          )}

          {activeTab === "image" && canUseImage && (
            <section style={s.card}>
              <div style={s.sectionTop}>
                <h2 style={s.sectionTitle}>Analiză poză</h2>
                <span style={s.tag}>PRO</span>
              </div>
              <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 14px" }}>
                Fotografiază ecranul invertorului sau etichetele de eroare.
              </p>
              <label style={s.uploadLabel}>
                <input type="file" accept="image/*" capture="environment" onChange={handleImageSelect} style={{ display: "none" }} />
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "32px 16px",
                    gap: 4,
                    textAlign: "center",
                    background: "#f8fafc",
                    borderRadius: 16,
                    border: "1.5px dashed #cbd5e1",
                    cursor: "pointer"
                  }}>
                    <span style={{ fontSize: 32 }}>📸</span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>Atinge pentru a selecta o poză</span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>sau fă o fotografie acum</span>
                  </div>
                )}
              </label>
              {imagePreview && (
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  style={{
                    marginTop: 10,
                    background: "none",
                    border: "1px solid #e2e8f0",
                    borderRadius: 20,
                    padding: "6px 14px",
                    fontSize: 13,
                    cursor: "pointer"
                  }}
                >
                  Șterge poza
                </button>
              )}
              <button
                onClick={analyzeImage}
                disabled={imageLoading || !imageFile}
                style={{ ...s.primaryBtn, marginTop: 20, opacity: imageLoading || !imageFile ? 0.5 : 1 }}
              >
                {imageLoading ? "⏳ Se procesează..." : "🤖 Analizează imaginea"}
              </button>
              {imageResult && (
                <div style={s.resultBox}>
                  <pre style={s.resultText}>{imageResult}</pre>
                </div>
              )}
            </section>
          )}

          <section style={s.card}>
            <div style={s.sectionTop}>
              <h2 style={s.sectionTitle}>Istoric recent</h2>
              {history.length > 0 && (
                <button onClick={clearHistory} style={s.clearBtn}>Șterge tot</button>
              )}
            </div>
            {history.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: 14 }}>Nicio analiză efectuată încă.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {history.slice(0, 5).map((item) => (
                  <div key={item.id} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 12 }}>
                    <p style={{ fontWeight: 600, margin: "0 0 4px", fontSize: 14 }}>{item.text}</p>
                    <p style={{ margin: 0, fontSize: 13, color: "#475569", whiteSpace: "pre-wrap" }}>
                      {item.result.length > 200 ? item.result.slice(0, 200) + "..." : item.result}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {(profile.role === "admin" || profile.role === "master") && (
            <section style={s.card}>
              <div style={s.sectionTop}>
                <h2 style={s.sectionTitle}>🔧 Panou Admin</h2>
              </div>
              <button onClick={resetWeeklyUsageForCurrentUser} style={{ ...s.primaryBtn, background: "#475569", marginBottom: 8 }}>
                Resetează limita săptămânală (debug)
              </button>
              <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Vizibil doar pentru admin/master.</p>
            </section>
          )}

          <footer style={{ marginTop: 32, textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
            SolarDiag Pro © 2025 · Toate drepturile rezervate
          </footer>
        </div>
      </main>
    </>
  );
}

// 🔧 OBIECTUL DE STILURI - COMPLET
const s: Record<string, React.CSSProperties> = {
  centerScreen: {
    display: "flex",
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
    padding: 16
  },
  statusCard: {
    background: "white",
    borderRadius: 24,
    padding: 32,
    maxWidth: 480,
    width: "100%",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    textAlign: "center" as const
  },
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "16px 16px 40px"
  },
  shell: {
    maxWidth: 680,
    margin: "0 auto"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    flexWrap: "wrap" as const
  },
  logo: {
    width: 48,
    height: 48,
    background: "#1d4ed8",
    color: "white",
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
    fontWeight: 700,
    boxShadow: "0 6px 14px rgba(29,78,216,0.25)"
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.2
  },
  subtitle: {
    margin: 0,
    fontSize: 13,
    color: "#64748b"
  },
  userLine: {
    margin: "2px 0 0",
    fontSize: 12,
    color: "#64748b"
  },
  logoutBtn: {
    background: "#fee2e2",
    border: "none",
    borderRadius: 40,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 600,
    color: "#b91c1c",
    cursor: "pointer"
  },
  card: {
    background: "white",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
    border: "1px solid #eef2f6",
    marginBottom: 16
  },
  badge: {
    background: "#e2e8f0",
    padding: "4px 10px",
    borderRadius: 40,
    fontSize: 11,
    fontWeight: 700,
    color: "#1e293b"
  },
  btnPro: {
    flex: 1,
    background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
    border: "none",
    borderRadius: 20,
    padding: "14px 6px",
    color: "white",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 2
  },
  btnInstaller: {
    flex: 1,
    background: "linear-gradient(135deg,#059669,#10b981)",
    border: "none",
    borderRadius: 20,
    padding: "14px 6px",
    color: "white",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 2
  },
  proCard: {
    background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    boxShadow: "0 15px 30px -8px rgba(0,0,0,0.2)"
  },
  proBadge: {
    background: "#fbbf24",
    padding: "3px 12px",
    borderRadius: 40,
    fontSize: 11,
    fontWeight: 800,
    color: "#0f172a",
    display: "inline-block",
    marginBottom: 8
  },
  proTitle: {
    margin: "0 0 4px",
    fontSize: 22,
    fontWeight: 800,
    color: "white"
  },
  proIcon: {
    fontSize: 28,
    background: "#334155",
    width: 52,
    height: 52,
    borderRadius: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  proFeature: {
    fontSize: 14,
    color: "#cbd5e1",
    fontWeight: 500
  },
  proBtn: {
    background: "#3b82f6",
    border: "none",
    borderRadius: 40,
    padding: "10px 0",
    width: "100%",
    color: "white",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer"
  },
  tabBar: {
    display: "flex",
    gap: 6,
    marginBottom: 12
  },
  tab: {
    flex: 1,
    padding: "12px 8px",
    background: "white",
    border: "1px solid #eef2f6",
    borderRadius: 40,
    fontSize: 14,
    fontWeight: 600,
    color: "#334155",
    cursor: "pointer"
  },
  tabActive: {
    background: "#0f172a",
    color: "white",
    borderColor: "#0f172a"
  },
  sectionTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14
  },
  sectionTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "#0f172a"
  },
  tag: {
    background: "#dcfce7",
    color: "#15803d",
    fontSize: 11,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 40
  },
  textarea: {
    width: "100%",
    padding: 14,
    border: "1.5px solid #e2e8f0",
    borderRadius: 18,
    fontSize: 15,
    fontFamily: "inherit",
    resize: "vertical" as const,
    marginBottom: 16
  },
  primaryBtn: {
    background: "#1d4ed8",
    border: "none",
    borderRadius: 40,
    padding: "14px 16px",
    width: "100%",
    color: "white",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer"
  },
  primarySmallBtn: {
    background: "#1d4ed8",
    border: "none",
    borderRadius: 40,
    padding: "12px 24px",
    color: "white",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer"
  },
  resultBox: {
    marginTop: 18,
    padding: 18,
    background: "#f8fafc",
    borderRadius: 18,
    border: "1px solid #eef2f6"
  },
  resultText: {
    margin: 0,
    fontSize: 14,
    whiteSpace: "pre-wrap" as const,
    fontFamily: "inherit",
    color: "#1e293b",
    lineHeight: 1.5
  },
  uploadLabel: {
    display: "block",
    cursor: "pointer"
  },
  clearBtn: {
    background: "none",
    border: "none",
    color: "#ef4444",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer"
  }
};