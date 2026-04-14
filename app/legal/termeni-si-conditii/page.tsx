export default function TermeniSiConditii() {
  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Termeni și Condiții SolarDiag Pro</h1>
        <p style={styles.date}><strong>Ultima actualizare:</strong> 14 Aprilie 2026</p>

        <h2 style={styles.h2}>1. Informații Generale</h2>
        <p style={styles.p}>SolarDiag Pro ("Aplicația") este un serviciu oferit de PFA/Cabinet Individual, având adresa de contact: <strong>solardiagpro@gmail.com</strong>. Acest document stabilește termenii de utilizare ai aplicației web accesibilă la adresa https://solardiag-pro.vercel.app.</p>

        <h2 style={styles.h2}>2. Descrierea Serviciului</h2>
        <p style={styles.p}>SolarDiag Pro oferă un instrument digital de diagnosticare a erorilor pentru invertoare fotovoltaice, utilizând o bază de date dedicată și, pentru anumite planuri, tehnologie de Inteligență Artificială (AI). Serviciul este disponibil în mai multe niveluri de abonament: Free, PRO și INSTALLER.</p>

        <h2 style={styles.h2}>3. Limitarea Răspunderii (⚠️ CRITIC)</h2>
        <p style={styles.p}><strong>SERVICIUL ESTE OFERIT "CA ATARE".</strong></p>
        <p style={styles.p}>Informațiile furnizate de SolarDiag Pro (fie din baza de date, fie generate de AI) au <strong>caracter strict orientativ și educațional</strong>.</p>
        <ul style={styles.ul}>
          <li>Instalațiile electrice și invertoarele fotovoltaice implică <strong>riscuri de electrocutare și incendiu</strong>.</li>
          <li><strong>Diagnosticul AI poate conține erori. Verificați întotdeauna cu un specialist.</strong></li>
          <li>Utilizatorul este <strong>singurul responsabil</strong> pentru interpretarea diagnosticului și pentru orice acțiune întreprinsă (reparații, resetări, deconectări).</li>
          <li><strong>NU NE ASUMĂM NICIO RĂSPUNDERE</strong> pentru daune materiale, pierderi financiare, vătămări corporale sau deces rezultate din utilizarea informațiilor din această aplicație.</li>
          <li>Înainte de orice intervenție fizică, utilizatorul este obligat să consulte un <strong>electrician autorizat</strong>.</li>
        </ul>

        <h2 style={styles.h2}>4. Abonamente și Plăți</h2>
        <ul style={styles.ul}>
          <li><strong>Planul FREE:</strong> Oferă 2 analize text pe săptămână, fără acces la analiză poze sau AI.</li>
          <li><strong>Planul PRO (5€/lună):</strong> Oferă 100 analize text/lună și 20 analize poze/lună.</li>
          <li><strong>Planul INSTALLER (20€/lună):</strong> Oferă 400 analize text/lună și 100 analize poze/lună.</li>
        </ul>
        <p style={styles.p}>Plățile se efectuează exclusiv prin transfer bancar în contul specificat în aplicație. Activarea contului se face în termen de <strong>maxim 24 de ore lucrătoare</strong> de la confirmarea încasării.</p>
        <p style={styles.p}><strong>Politica de Rambursare:</strong> Sumele plătite pentru upgrade <strong>nu sunt rambursabile</strong>, decât în cazul unei erori tehnice din partea noastră care face aplicația inutilizabilă.</p>

        <h2 style={styles.h2}>5. Date Personale</h2>
        <p style={styles.p}>Prin utilizarea aplicației, ești de acord cu colectarea și procesarea datelor tale conform Politicii de Confidențialitate. Nu vindem și nu distribuim datele tale către terți.</p>

        <h2 style={styles.h2}>6. Modificări ale Serviciului</h2>
        <p style={styles.p}>Ne rezervăm dreptul de a modifica sau întrerupe temporar serviciul pentru mentenanță, fără notificare prealabilă. Limitele planurilor se pot modifica, caz în care vei fi notificat cu 14 zile înainte.</p>

        <h2 style={styles.h2}>7. Legea Aplicabilă</h2>
        <p style={styles.p}>Prezentul acord este guvernat de legile din România. Orice litigiu va fi soluționat pe cale amiabilă sau, în caz contrar, de instanțele competente din România.</p>

        <h2 style={styles.h2}>8. Vârsta Minimă</h2>
        <p style={styles.p}>Serviciul este destinat persoanelor cu vârsta de minimum 18 ani. Prin crearea unui cont, confirmați că aveți cel puțin 18 ani împliniți.</p>

        <p style={{ ...styles.p, marginTop: 32 }}><em>Contact pentru probleme legale: solardiagpro@gmail.com</em></p>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "#0f172a",
    padding: "20px",
    display: "flex",
    justifyContent: "center",
    fontFamily: "Inter, Arial, sans-serif",
  },
  card: {
    maxWidth: 800,
    width: "100%",
    background: "#1e293b",
    borderRadius: 24,
    padding: 32,
    color: "#f1f5f9",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
  },
  h1: {
    fontSize: 28,
    marginBottom: 8,
    color: "white",
  },
  date: {
    color: "#94a3b8",
    marginBottom: 32,
    fontSize: 14,
  },
  h2: {
    fontSize: 20,
    marginTop: 28,
    marginBottom: 12,
    color: "#e2e8f0",
    borderBottom: "1px solid #334155",
    paddingBottom: 8,
  },
  p: {
    fontSize: 15,
    lineHeight: 1.7,
    color: "#cbd5e1",
    marginBottom: 12,
  },
  ul: {
    paddingLeft: 24,
    marginBottom: 16,
  },
};