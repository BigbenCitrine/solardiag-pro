import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Verifică autentificarea
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Sesiune invalidă" }, { status: 401 });
    }

    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Text lipsă" }, { status: 400 });
    }

    // Verifică profilul utilizatorului
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("uuid", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profil negăsit" }, { status: 403 });
    }

    // Verifică statusul contului
    if (profile.status !== "active") {
      return NextResponse.json({ error: "Cont suspendat sau inactiv" }, { status: 403 });
    }

    const isFree = profile.role === "free";
    const isProOrAbove = ["pro", "installer", "trusted", "admin", "master"].includes(profile.role);

    let finalResult = "";

    // 🔍 PASUL 1: Caută în baza de date locală (PENTRU TOȚI UTILIZATORII)
    const { data: errorDb, error: dbError } = await supabase
      .from("error_codes")
      .select("*")
      .or(`code.ilike.%${text}%,description.ilike.%${text}%,brand.ilike.%${text}%`)
      .limit(3);

    if (errorDb && errorDb.length > 0) {
      // Am găsit în baza de date
      const errors = errorDb.map((e: any) => 
        `📋 ${e.brand ? `[${e.brand}] ` : ""}${e.code}: ${e.description}\n   🔧 Soluție: ${e.solution || "Contactează suportul tehnic."}`
      ).join("\n\n");
      
      finalResult = errors;
      
      // Pentru utilizatorii FREE, ne oprim aici
      if (isFree) {
        // Incrementează contorul pentru FREE
        await supabase
          .from("profiles")
          .update({
            text_used_this_week: profile.text_used_this_week + 1,
            text_used_this_month: profile.text_used_this_month + 1
          })
          .eq("uuid", user.id);
          
        return NextResponse.json({ result: finalResult });
      }
    }

    // 🔥 PASUL 2: Pentru PRO/INSTALLER - dacă nu s-a găsit în DB sau vrem analiză AI suplimentară
    if (isProOrAbove) {
      // Verifică limitele lunare
      const monthlyLimit = profile.monthly_text_limit || 100;
      const usedThisMonth = profile.text_used_this_month || 0;
      
      if (usedThisMonth >= monthlyLimit) {
        return NextResponse.json({ 
          error: `Ai atins limita lunară de ${monthlyLimit} analize text. Upgrade pentru mai multe.` 
        }, { status: 429 });
      }

      // Dacă nu am găsit nimic în DB sau vrem analiză AI
      if (!errorDb || errorDb.length === 0) {
        // Apelează OpenAI cu prompt specializat pentru TOATE mărcile
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Ești un inginer specialist în service pentru invertoare fotovoltaice de toate mărcile (SMA, Fronius, Huawei, Growatt, Deye, Solis, GoodWe, Victron, Schneider, ABB, SolarEdge, Enphase, Delta, Kostal, Sungrow ș.a.). Răspunde în limba română tehnică, clar și structurat. Oferă: 1) Codul erorii și semnificația, 2) Cauze probabile, 3) Pași concreți de diagnostic și remediere, 4) Recomandări de siguranță. Dacă eroarea indică o defecțiune hardware gravă, recomandă contactarea unui electrician autorizat."
            },
            {
              role: "user",
              content: `Diagnostichează următoarea eroare de invertor fotovoltaic: "${text}"`
            }
          ],
          max_tokens: 800,
          temperature: 0.3,
        });

        const aiResponse = completion.choices[0].message.content || "Nu s-a putut genera un răspuns.";
        finalResult = finalResult 
          ? `${finalResult}\n\n---\n\n🤖 **ANALIZĂ AI SUPLIMENTARĂ:**\n\n${aiResponse}`
          : `🤖 **ANALIZĂ AI:**\n\n${aiResponse}`;

        // Calculează costul estimat (GPT-4o-mini ~ $0.15/1M input, $0.60/1M output)
        const inputTokens = completion.usage?.prompt_tokens || 0;
        const outputTokens = completion.usage?.completion_tokens || 0;
        const costEstimat = (inputTokens / 1000000) * 0.15 + (outputTokens / 1000000) * 0.60;
        
        // Actualizează costul estimat lunar
        await supabase
          .from("profiles")
          .update({
            estimated_spend_this_month: (profile.estimated_spend_this_month || 0) + costEstimat
          })
          .eq("uuid", user.id);
      } else {
        // Am găsit în DB, dar adăugăm o notă că e din baza de date
        finalResult = `📚 **DIN BAZA DE DATE:**\n\n${finalResult}`;
      }

      // Incrementează contorul de utilizare
      await supabase
        .from("profiles")
        .update({
          text_used_this_week: profile.text_used_this_week + 1,
          text_used_this_month: profile.text_used_this_month + 1
        })
        .eq("uuid", user.id);

      return NextResponse.json({ result: finalResult });
    }

    // Pentru FREE - dacă nu s-a găsit nimic în DB
    if (isFree) {
      if (!errorDb || errorDb.length === 0) {
        finalResult = "❌ Eroarea nu a fost găsită în baza de date.\n\n💡 **Upgrade la PRO** pentru analiză AI avansată și diagnostic precis pentru orice eroare.";
      }
      
      // Incrementează contorul pentru FREE
      await supabase
        .from("profiles")
        .update({
          text_used_this_week: profile.text_used_this_week + 1,
          text_used_this_month: profile.text_used_this_month + 1
        })
        .eq("uuid", user.id);
        
      return NextResponse.json({ result: finalResult });
    }

    return NextResponse.json({ error: "Rol necunoscut" }, { status: 403 });

  } catch (error) {
    console.error("API Analyze Error:", error);
    return NextResponse.json({ 
      error: "Eroare internă. Verifică consola pentru detalii." 
    }, { status: 500 });
  }
}