"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type HistoryItem = {
  id: number;
  text: string;
  result: string;
};

type RawProfile = {
  uuid: string;
  email: string;
  role: "master" | "admin" | "trusted" | "pro" | "installer" | "free";
  status: "active" | "suspended" | "banned";
  can_use_image: boolean;
  weekly_text_limit: number;
  weekly_image_limit: number;
  text_used_this_week: number;
  image_used_this_week: number;
  usage_reset_at: string;
  monthly_text_limit: number;
  monthly_image_limit: number;
  text_used_this_month: number;
  image_used_this_month: number;
  monthly_spend_cap: number;
  estimated_spend_this_month: number;
  billing_period_reset_at: string;
};

type EffectiveProfile = RawProfile & {
  effectiveCanUseImage: boolean;
  effectiveWeeklyTextLimit: number;
  effectiveWeeklyImageLimit: number | null;
  unlimitedText: boolean;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const IBAN = "RO44 REVO 0000 1558 9943 9674";

function getRolePolicy(role: RawProfile["role"]) {
  switch (role) {
    case "master":
      return {
        effectiveCanUseImage: true,
        effectiveWeeklyTextLimit: Number.MAX_SAFE_INTEGER,
        effectiveWeeklyImageLimit: null,
        unlimitedText: true,
      };
    case "admin":
      return {
        effectiveCanUseImage: true,
        effectiveWeeklyTextLimit: Number.MAX_SAFE_INTEGER,
        effectiveWeeklyImageLimit: null,
        unlimitedText: true,
      };
    case "installer":
      return {
        effectiveCanUseImage: true,
        effectiveWeeklyTextLimit: 300,
        effectiveWeeklyImageLimit: 100,
        unlimitedText: false,
      };
    case "pro":
      return {
        effectiveCanUseImage: true,
        effectiveWeeklyTextLimit: 100,
        effectiveWeeklyImageLimit: 30,
        unlimitedText: false,
      };
    case "trusted":
      return {
        effectiveCanUseImage: true,
        effectiveWeeklyTextLimit: 20,
        effectiveWeeklyImageLimit: 10,
        unlimitedText: false,
      };
    case "free":
    default:
      return {
        effectiveCanUseImage: false,
        effectiveWeeklyTextLimit: 2,
        effectiveWeeklyImageLimit: 0,
        unlimitedText: false,
      };
  }
}

function applyRolePolicy(profile: RawProfile): EffectiveProfile {
  return {
    ...profile,
    ...getRolePolicy(profile.role),
  };
}

// 🔧 MODAL PENTRU UPGRADE CU IBAN
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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: 24,
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
            Activează {planName}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 700,
              color: "#64748b",
            }}
          >
            ✕
          </button>
        </div>
        <div
          style={{
            background: isPro
              ? "linear-gradient(135deg,#1d4ed8,#3b82f6)"
              : "linear-gradient(135deg,#059669,#10b981)",
            color: "white",
            borderRadius: 12,
            padding: "10px 16px",
            fontSize: 22,
            fontWeight: 800,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          {price}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {features.map((f, i) => (
            <div key={i} style={{ fontSize: 15, color: "#334155", fontWeight: 600 }}>
              ✓ {f}
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: "#e2e8f0", margin: "16px 0" }} />
        <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, margin: "0 0 16px" }}>
          Trimite plata prin transfer bancar la IBAN-ul de mai jos.{" "}
          <b>Menționează emailul tău</b> în descrierea plății. Contul va fi activat în maxim 24 ore
          lucrătoare.
        </p>
        <div
          style={{
            background: "#f8fafc",
            border: "1.5px solid #e2e8f0",
            borderRadius: 14,
            padding: "12px 14px",
            marginBottom: 12,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#94a3b8",
              textTransform: "uppercase",
            }}
          >
            IBAN (RON / EUR) · Revolut
          </span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: 0.5,
            }}
          >
            {IBAN}
          </span>
          <button
            onClick={copyIBAN}
            style={{
              background: isPro ? "#1d4ed8" : "#059669",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              alignSelf: "flex-start",
            }}
          >
            {copied ? "✓ Copiat!" : "Copiază IBAN"}
          </button>
        </div>
        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>
          💡 După confirmarea plății, contul va fi activat în maxim 24h.
        </p>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            background: isPro ? "#1d4ed8" : "#059669",
            color: "white",
            border: "none",
            borderRadius: 14,
            padding: "14px 16px",
            fontSize: 16,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Am efectuat plata
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const supabase = useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

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

  // 🔧 STARE PENTRU MODAL
  const [upgradeModal, setUpgradeModal] = useState<"pro" | "installer" | null>(null);

  const remainingTextAnalyses =
    profile && !profile.unlimitedText
      ? Math.max(
          profile.effectiveWeeklyTextLimit - profile.text_used_this_week,
          0
        )
      : null;

  useEffect(() => {
    const init = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        window.location.href = "/login";
        return;
      }

      setUserEmail(userData.user.email || "");

      const loadedProfile = await loadProfile(userData.user.id);

      if (!loadedProfile) {
        setAuthorized(false);
        setCheckingAuth(false);
        return;
      }

      if (loadedProfile.status !== "active") {
        setAuthorized(false);
        setCheckingAuth(false);
        return;
      }

      setProfile(loadedProfile);
      setAuthorized(true);
      setCheckingAuth(false);

      const saved = localStorage.getItem("solardiag-history");
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch {
          setHistory([]);
        }
      }
    };

    init();
  }, [supabase]);

  async function loadProfile(
    userUuid: string
  ): Promise<EffectiveProfile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "uuid,email,role,status,can_use_image,weekly_text_limit,weekly_image_limit,text_used_this_week,image_used_this_week,usage_reset_at,monthly_text_limit,monthly_image_limit,text_used_this_month,image_used_this_month,monthly_spend_cap,estimated_spend_this_month,billing_period_reset_at"
      )
      .eq("uuid", userUuid)
      .single();

    if (error || !data) {
      return null;
    }

    const normalized = await normalizeWeeklyUsage(data as RawProfile);
    return applyRolePolicy(normalized);
  }

  async function normalizeWeeklyUsage(
    rawProfile: RawProfile
  ): Promise<RawProfile> {
    const lastReset = rawProfile.usage_reset_at
      ? new Date(rawProfile.usage_reset_at).getTime()
      : 0;

    const now = Date.now();

    if (!lastReset || now - lastReset > WEEK_MS) {
      const { error } = await supabase
        .from("profiles")
        .update({
          text_used_this_week: 0,
          image_used_this_week: 0,
          usage_reset_at: new Date().toISOString(),
        })
        .eq("uuid", rawProfile.uuid);

      if (!error) {
        return {
          ...rawProfile,
          text_used_this_week: 0,
          image_used_this_week: 0,
          usage_reset_at: new Date().toISOString(),
        };
      }
    }

    return rawProfile;
  }

  async function resetWeeklyUsageForCurrentUser() {
    if (!profile) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        text_used_this_week: 0,
        image_used_this_week: 0,
        usage_reset_at: new Date().toISOString(),
      })
      .eq("uuid", profile.uuid);

    if (error) {
      setResult("Resetarea limitei a eșuat.");
      return;
    }

    setProfile({
      ...profile,
      text_used_this_week: 0,
      image_used_this_week: 0,
      usage_reset_at: new Date().toISOString(),
    });

    setResult("Limita săptămânală a fost resetată.");
  }

  const analyze = async () => {
    if (!text.trim()) {
      setResult("Introdu un cod de eroare sau o descriere.");
      return;
    }

    if (!profile) {
      setResult("Profilul utilizatorului nu este disponibil.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken = session?.access_token;

      if (!accessToken) {
        setResult("Nu există sesiune activă. Fă logout și login din nou.");
        return;
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ text }),
      });

      const raw = await res.text();

      let data: { result?: string; error?: string; source?: string } | null =
        null;
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }

      if (!res.ok) {
        setResult(`Eroare backend (${res.status})\n\n${raw || "gol"}`);
        return;
      }

      if (!data) {
        setResult(`Backend-ul a răspuns, dar nu cu JSON valid.\n\n${raw || "gol"}`);
        return;
      }

      if (data.result) {
        setResult(data.result);
      } else if (data.error) {
        setResult(`Backend error:\n${data.error}`);
      } else {
        setResult(`Răspuns neașteptat:\n${raw || "gol"}`);
      }

      if (data.result) {
        const newItem = { id: Date.now(), text, result: data.result };
        const updated = [newItem, ...history].slice(0, 20);
        setHistory(updated);
        localStorage.setItem("solardiag-history", JSON.stringify(updated));
      }
    } catch (err) {
      setResult(`Eroare fetch:\n${String(err)}`);
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
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!imageFile || !profile) return;

    if (!profile.effectiveCanUseImage) {
      setImageResult("Analiza după poză este disponibilă doar în planul PRO sau INSTALLER.");
      return;
    }

    setImageLoading(true);
    setImageResult("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken = session?.access_token;
      if (!accessToken) {
        setImageResult("Sesiune expirată. Fă logout și login din nou.");
        return;
      }

      const formData = new FormData();
      formData.append("image", imageFile);

      const res = await fetch("/api/analyze-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const raw = await res.text();
      let data: { result?: string; error?: string } | null = null;
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }

      if (!res.ok || !data) {
        setImageResult(`Eroare: ${raw || "necunoscută"}`);
        return;
      }

      if (data.result) {
        setImageResult(data.result);
      } else if (data.error) {
        setImageResult(`Eroare: ${data.error}`);
      }
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

  if (checkingAuth) {
    return (
      <main style={styles.centerScreen}>
        <div style={styles.statusCard}>
          <h2 style={{ marginTop: 0 }}>Se verifică accesul...</h2>
          <p style={{ marginBottom: 0 }}>Așteaptă o secundă.</p>
        </div>
      </main>
    );
  }

  if (!authorized || !profile) {
    return (
      <main style={styles.centerScreen}>
        <div style={styles.statusCard}>
          <h2 style={{ marginTop: 0 }}>Acces restricționat</h2>
          <p>Acest cont nu are acces la aplicație.</p>
          <button onClick={handleLogout} style={styles.primarySmallButton}>
            Logout
          </button>
        </div>
      </main>
    );
  }

  const canUseImage = profile.effectiveCanUseImage;

  return (
    <>
      {upgradeModal && (
        <UpgradeModal plan={upgradeModal} onClose={() => setUpgradeModal(null)} />
      )}

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
        textarea { font-size: 16px !important; }
        input { font-size: 16px !important; }
        @media (max-width: 480px) {
          .tab-btn { padding: 10px 8px !important; font-size: 13px !important; }
        }
      `}</style>

      <main style={styles.page}>
        <div style={styles.phoneShell}>

          <header style={styles.headerCard}>
            <div style={styles.logoCircle}>⚡</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={styles.title}>SolarDiag Pro</h1>
              <p style={styles.subtitle}>
                Diagnostic inteligent pentru invertoare fotovoltaice
              </p>
              <p style={styles.userLine}>
                <b>{userEmail}</b> · <b>{profile.role}</b>
              </p>
            </div>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Ieșire
            </button>
          </header>

          <section style={styles.freeCard}>
            <div style={styles.freeTop}>
              <span style={styles.freeBadge}>
                {profile.role.toUpperCase()}
              </span>
              <span style={styles.freeCount}>
                {profile.unlimitedText
                  ? "nelimitat"
                  : `${profile.text_used_this_week} / ${profile.effectiveWeeklyTextLimit} / săpt.`}
              </span>
            </div>
            <p style={styles.freeText}>
              {profile.unlimitedText
                ? "Acces extins, fără limită practică."
                : `Îți mai rămân ${remainingTextAnalyses} analize text în această săptămână.`}
            </p>
          </section>

          <section style={styles.proCard}>
            <div style={styles.proTop}>
              <div>
                <div style={styles.proBadge}>CONT ACTIV</div>
                <h2 style={styles.proTitle}>
                  {profile.role === "master" ? "Control total" :
                   profile.role === "admin" ? "Administrator" :
                   profile.role === "installer" ? "Plan INSTALLER" :
                   profile.role === "pro" ? "Plan PRO" :
                   profile.role === "trusted" ? "Plan TRUSTED" :
                   "Plan FREE"}
                </h2>
              </div>
              <div style={styles.proIcon}>
                {canUseImage ? "📷" : "🔒"}
              </div>
            </div>

            <div style={styles.proFeatures}>
              <div style={styles.proFeature}>
                📝 Text: {profile.unlimitedText ? "nelimitat" : `${profile.effectiveWeeklyTextLimit}/săpt.`}
              </div>
              <div style={styles.proFeature}>
                📷 Poză: {canUseImage ? "activă ✓" : "indisponibil – upgrade la PRO"}
              </div>
              <div style={styles.proFeature}>
                🤖 AI: {profile.role === "free" ? "indisponibil – upgrade la PRO" : "activ ✓"}
              </div>
            </div>

            {profile.role === "free" && (
  <div style={styles.upgradeBox}>
    <p style={{ margin: "0 0 10px", fontSize: 14, color: "#fff" }}>
      🚀 Alege planul potrivit pentru tine:
    </p>
    <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
      <button
        style={{ ...styles.upgradeButton, background: "#3b82f6", color: "white" }}
        onClick={() => setUpgradeModal("pro")}
      >
        ⚡ Activează PRO — 5€/lună
      </button>
      <button
        style={{ ...styles.upgradeButton, background: "#10b981", color: "white" }}
        onClick={() => setUpgradeModal("installer")}
      >
        🔧 Activează INSTALLER — 20€/lună
      </button>
    </div>
  </div>
)}

          </section>

          <div style={styles.tabBar}>
            <button
              className="tab-btn"
              style={{
                ...styles.tabBtn,
                ...(activeTab === "text" ? styles.tabBtnActive : {}),
              }}
              onClick={() => setActiveTab("text")}
            >
              📝 Analiză text
            </button>
            <button
              className="tab-btn"
              style={{
                ...styles.tabBtn,
                ...(activeTab === "image" ? styles.tabBtnActive : {}),
                ...(canUseImage ? {} : styles.tabBtnLocked),
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
            <section style={styles.card}>
              <div style={styles.sectionTop}>
                <h2 style={styles.sectionTitle}>Analiză text</h2>
                <span style={styles.sectionTag}>Activ</span>
              </div>

              <textarea
                placeholder="Ex: Growatt 202, Deye F04, utility loss, over temperature..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={styles.textarea}
                rows={5}
              />

              <button
                onClick={analyze}
                disabled={loading}
                style={{
                  ...styles.primaryButton,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "⏳ Se analizează..." : "🔍 Analizează eroarea"}
              </button>

              {result ? (
                <div style={styles.resultBox}>
                  <pre style={styles.resultText}>{result}</pre>
                </div>
              ) : null}
            </section>
          )}

          {activeTab === "image" && canUseImage && (
            <section style={styles.card}>
              <div style={styles.sectionTop}>
                <h2 style={styles.sectionTitle}>Analiză poză</h2>
                <span style={styles.sectionTag}>PRO</span>
              </div>

              <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 14px" }}>
                Fotografiază ecranul invertorului sau etichetele de eroare.
              </p>

              <label style={styles.uploadLabel}>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelect}
                  style={{ display: "none" }}
                />
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={styles.imagePreview}
                  />
                ) : (
                  <div style={styles.uploadPlaceholder}>
                    <span style={{ fontSize: 40 }}>📷</span>
                    <span style={{ fontSize: 14, color: "#64748b", marginTop: 8 }}>
                      Apasă pentru a face o poză sau a alege din galerie
                    </span>
                  </div>
                )}
              </label>

              {imageFile && (
                <button
                  onClick={analyzeImage}
                  disabled={imageLoading}
                  style={{
                    ...styles.primaryButton,
                    marginTop: 14,
                    opacity: imageLoading ? 0.7 : 1,
                  }}
                >
                  {imageLoading ? "⏳ Se analizează poza..." : "🔍 Analizează poza"}
                </button>
              )}

              {imageResult ? (
                <div style={{ ...styles.resultBox, marginTop: 14 }}>
                  <pre style={styles.resultText}>{imageResult}</pre>
                </div>
              ) : null}
            </section>
          )}

          <section style={styles.card}>
            <div style={styles.sectionTop}>
              <h2 style={styles.sectionTitle}>Istoric</h2>
              <span style={styles.sectionTag}>{history.length}</span>
            </div>

            <div style={styles.actionsRow}>
              <button onClick={clearHistory} style={styles.dangerButton}>
                Șterge istoric
              </button>

              {(profile.role === "master" || profile.role === "admin") && (
                <button
                  onClick={resetWeeklyUsageForCurrentUser}
                  style={styles.warningButton}
                >
                  Reset limită
                </button>
              )}
            </div>

            <div style={styles.historyList}>
              {history.length === 0 ? (
                <p style={styles.placeholderText}>
                  Nu există analize salvate încă.
                </p>
              ) : (
                history.map((item) => (
                  <div key={item.id} style={styles.historyCard}>
                    <div style={styles.historyLabel}>Input</div>
                    <div style={styles.historyInput}>{item.text}</div>
                    <div style={styles.historyLabel}>Rezultat</div>
                    <div style={styles.historyResult}>{item.result}</div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </main>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #0b1220 0%, #111827 15%, #e9f1fb 15%, #f4f8fc 100%)",
    padding: "16px 12px 48px",
    fontFamily:
      'Inter, Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  centerScreen: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f172a",
    padding: 20,
    fontFamily: 'Inter, Arial, sans-serif',
  },
  statusCard: {
    background: "#1e293b",
    color: "white",
    padding: 24,
    borderRadius: 16,
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  },
  phoneShell: {
    width: "100%",
    maxWidth: 480,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  headerCard: {
    background: "linear-gradient(135deg, #1d4ed8, #0f766e)",
    color: "white",
    borderRadius: 22,
    padding: "16px 16px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.28)",
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: 22,
    lineHeight: 1.1,
    fontWeight: 800,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  subtitle: {
    margin: "4px 0 0 0",
    fontSize: 12,
    color: "rgba(255,255,255,0.88)",
    lineHeight: 1.3,
  },
  userLine: {
    margin: "6px 0 0 0",
    fontSize: 11,
    color: "rgba(255,255,255,0.9)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  logoutButton: {
    background: "rgba(255,255,255,0.16)",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "10px 10px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  freeCard: {
    background: "#ffffff",
    borderRadius: 18,
    padding: 14,
    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e2e8f0",
  },
  freeTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  freeBadge: {
    display: "inline-block",
    background: "#fef3c7",
    color: "#92400e",
    borderRadius: 999,
    padding: "5px 10px",
    fontSize: 11,
    fontWeight: 800,
  },
  freeCount: {
    fontSize: 12,
    fontWeight: 700,
    color: "#475569",
  },
  freeText: {
    margin: 0,
    color: "#334155",
    fontSize: 13,
    lineHeight: 1.5,
  },
  proCard: {
    background: "linear-gradient(135deg, #312e81, #7c3aed)",
    borderRadius: 22,
    padding: 16,
    color: "white",
    boxShadow: "0 14px 32px rgba(76, 29, 149, 0.28)",
  },
  proTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  proBadge: {
    display: "inline-block",
    background: "rgba(255,255,255,0.18)",
    color: "#f8fafc",
    borderRadius: 999,
    padding: "5px 10px",
    fontSize: 11,
    fontWeight: 800,
    marginBottom: 8,
  },
  proTitle: {
    margin: 0,
    fontSize: 20,
    lineHeight: 1.2,
    fontWeight: 800,
  },
  proIcon: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.16)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    flexShrink: 0,
  },
  proFeatures: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginTop: 12,
    marginBottom: 14,
  },
  proFeature: {
    fontSize: 13,
    color: "rgba(255,255,255,0.95)",
    fontWeight: 600,
  },
  upgradeBox: {
    background: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: "12px 14px",
    marginTop: 4,
  },
  upgradeButton: {
    width: "100%",
    background: "#facc15",
    color: "#1e1b4b",
    border: "none",
    borderRadius: 12,
    padding: "13px 16px",
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer",
  },
  tabBar: {
    display: "flex",
    gap: 10,
    background: "#ffffff",
    borderRadius: 18,
    padding: 8,
    boxShadow: "0 4px 14px rgba(15,23,42,0.07)",
  },
  tabBtn: {
    flex: 1,
    padding: "12px 10px",
    border: "none",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    background: "transparent",
    color: "#64748b",
    transition: "all 0.2s",
  },
  tabBtnActive: {
    background: "#1d4ed8",
    color: "#ffffff",
    boxShadow: "0 4px 12px rgba(29,78,216,0.25)",
  },
  tabBtnLocked: {
    color: "#94a3b8",
    cursor: "not-allowed",
  },
  card: {
    background: "#ffffff",
    borderRadius: 20,
    padding: 16,
    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.08)",
  },
  sectionTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 18,
    color: "#0f172a",
    fontWeight: 700,
  },
  sectionTag: {
    background: "#e2e8f0",
    color: "#334155",
    borderRadius: 999,
    padding: "5px 10px",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },
  textarea: {
    width: "100%",
    borderRadius: 14,
    border: "1.5px solid #cbd5e1",
    padding: "12px 14px",
    fontSize: 16,
    lineHeight: 1.5,
    outline: "none",
    resize: "vertical",
    background: "#f8fafc",
    color: "#0f172a",
    boxSizing: "border-box",
    marginBottom: 12,
    touchAction: "manipulation",
  },
  primaryButton: {
    width: "100%",
    background: "#1d4ed8",
    color: "#ffffff",
    border: "none",
    borderRadius: 14,
    padding: "15px 16px",
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(29, 78, 216, 0.25)",
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent",
  },
  primarySmallButton: {
    background: "#1d4ed8",
    color: "#ffffff",
    border: "none",
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
  },
  uploadLabel: {
    display: "block",
    cursor: "pointer",
    borderRadius: 16,
    overflow: "hidden",
    border: "2px dashed #cbd5e1",
    background: "#f8fafc",
    touchAction: "manipulation",
  },
  uploadPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    gap: 4,
    textAlign: "center",
  },
  imagePreview: {
    width: "100%",
    maxHeight: 280,
    objectFit: "cover",
    display: "block",
  },
  resultBox: {
    background: "#0f172a",
    borderRadius: 16,
    padding: 14,
    minHeight: 80,
    marginTop: 12,
  },
  resultText: {
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    color: "#e2e8f0",
    fontSize: 14,
    lineHeight: 1.6,
    fontFamily: "inherit",
  },
  placeholderText: {
    margin: 0,
    color: "#64748b",
    fontSize: 13,
    lineHeight: 1.5,
  },
  actionsRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 14,
  },
  dangerButton: {
    flex: 1,
    minWidth: 130,
    background: "#dc2626",
    color: "#ffffff",
    border: "none",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    touchAction: "manipulation",
  },
  warningButton: {
    flex: 1,
    minWidth: 130,
    background: "#f59e0b",
    color: "#111827",
    border: "none",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    touchAction: "manipulation",
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  historyCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 12,
  },
  historyLabel: {
    fontSize: 11,
    fontWeight: 800,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  historyInput: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 10,
    wordBreak: "break-word",
  },
  historyResult: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
};
