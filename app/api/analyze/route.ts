import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { errors } from "../../data/error-codes";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// 🔍 FUNCȚIE DE FUZZY SEARCH
function fuzzyMatch(search: string, target: string): number {
  if (!search || !target) return 0;
  
  search = search.toLowerCase().trim();
  target = target.toLowerCase().trim();
  
  if (target.includes(search)) return 1.0; // potrivire exactă
  if (search.includes(target)) return 0.9;
  
  // Verifică dacă toate caracterele din search apar în ordine în target
  let searchIndex = 0;
  for (let i = 0; i < target.length && searchIndex < search.length; i++) {
    if (target[i] === search[searchIndex]) {
      searchIndex++;
    }
  }
  
  if (searchIndex === search.length) {
    return 0.7; // toate caracterele găsite în ordine
  }
  
  // Verifică potrivire parțială (cuvinte)
  const searchWords = search.split(/\s+/);
  const targetWords = target.split(/\s+/);
  let matchedWords = 0;
  
  for (const sw of searchWords) {
    if (sw.length < 2) continue; // ignoră cuvinte foarte scurte
    for (const tw of targetWords) {
      if (tw.includes(sw) || sw.includes(tw)) {
        matchedWords++;
        break;
      }
    }
  }
  
  if (matchedWords > 0) {
    return (matchedWords / searchWords.length) * 0.5;
  }
  
  // Verifică similaritate Levenshtein simplificată (primele 3 caractere)
  if (search.length >= 3 && target.length >= 3) {
    const searchPrefix = search.substring(0, 3);
    const targetPrefix = target.substring(0, 3);
    if (searchPrefix === targetPrefix) return 0.4;
  }
  
  return 0;
}

export async function POST(req: NextRequest) {
  try {
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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("uuid", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profil negăsit" }, { status: 403 });
    }

    if (profile.status !== "active") {
      return NextResponse.json({ error: "Cont inactiv sau suspendat" }, { status: 403 });
    }

    const isFree = profile.role === "free";
    const isProOrAbove = ["pro", "installer", "trusted", "admin", "master"].includes(profile.role);
    
    let currentWeekUsage = profile.text_used_this_week || 0;
    const lastReset = profile.usage_reset_at ? new Date(profile.usage_reset_at).getTime() : 0;
    const needsReset = !lastReset || (Date.now() - lastReset) > WEEK_MS;

    // Reset săptămânal dacă e nevoie
    if (needsReset) {
      await supabase
        .from("profiles")
        .update({
          text_used_this_week: 0,
          image_used_this_week: 0,
          usage_reset_at: new Date().toISOString()
        })
        .eq("uuid", user.id);
      currentWeekUsage = 0;
    }

    // Verifică limita pentru FREE
    if (isFree) {
      const weeklyLimit = profile.weekly_text_limit || 2;
      if (currentWeekUsage >= weeklyLimit) {
        return NextResponse.json({
          error: `Ai atins limita săptămânală de ${weeklyLimit} analize pentru contul FREE. Upgradează la PRO (100 analize/lună) sau INSTALLER (400 analize/lună) pentru mai multe.`
        }, { status: 429 });
      }
    }

    // Verifică limita lunară pentru PRO/INSTALLER
    if (isProOrAbove && profile.role !== "admin" && profile.role !== "master") {
      const monthlyLimit = profile.monthly_text_limit || 100;
      const currentMonthUsage = profile.text_used_this_month || 0;
      
      if (currentMonthUsage >= monthlyLimit) {
        return NextResponse.json({
          error: `Ai atins limita lunară de ${monthlyLimit} analize pentru contul ${profile.role.toUpperCase()}. Contactează suportul pentru mărirea limitei.`
        }, { status: 429 });
      }
    }

    // 🔍 CAUTĂ ÎN BAZA DE DATE LOCALĂ (error-codes.ts) CU FUZZY SEARCH
    const searchTerm = text.trim();
    const matches: Array<{ error: any; score: number }> = [];

    for (const error of errors) {
      // Caută în toate câmpurile relevante
      const codeScore = fuzzyMatch(searchTerm, error.code || "");
      const descScore = fuzzyMatch(searchTerm, error.description || "");
      const brandScore = fuzzyMatch(searchTerm, error.brand || "");
      
      // Caută și în array-ul de întrebări alternative (ask)
      let askScore = 0;
      if (error.ask && Array.isArray(error.ask)) {
        for (const ask of error.ask) {
          askScore = Math.max(askScore, fuzzyMatch(searchTerm, ask));
        }
      }
      
      const bestScore = Math.max(codeScore, descScore, brandScore, askScore);
      
      // Prag minim de similaritate: 30%
      if (bestScore > 0.3) {
        matches.push({ error, score: bestScore });
      }
    }

    // Sortează după scor și ia primele 5 rezultate
    matches.sort((a, b) => b.score - a.score);
    const topMatches = matches.slice(0, 5).map(m => m.error);

    let finalResult = "";

    if (topMatches.length > 0) {
      // ✅ AM GĂSIT ÎN BAZA DE DATE LOCALĂ
      const errors = topMatches.map((e: any) => 
        `📋 **${e.code}**: ${e.description}\n   🔧 Soluție: ${e.solution || "Contactează suportul tehnic."}`
      ).join("\n\n");
      
      finalResult = errors;
      
      // Incrementează contorul
      await supabase
        .from("profiles")
        .update({
          text_used_this_week: currentWeekUsage + 1,
          text_used_this_month: (profile.text_used_this_month || 0) + 1
        })
        .eq("uuid", user.id);
        
      return NextResponse.json({ result: finalResult });
    }

    // 🔥 Dacă nu s-a găsit în DB și utilizatorul este PRO/INSTALLER, folosește AI
    if (isProOrAbove && openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Ești un inginer specialist în service pentru invertoare fotovoltaice de toate mărcile (SMA, Fronius, Huawei, Growatt, Deye, Solis, GoodWe, Victron, Schneider, ABB, SolarEdge, Enphase, Delta, Kostal, Sungrow și altele). Răspunde în limba română tehnică, clar și structurat. Oferă: 1) Codul erorii și semnificația, 2) Cauze probabile, 3) Pași concreți de diagnostic și remediere, 4) Recomandări de siguranță electrică."
            },
            {
              role: "user",
              content: `Diagnostichează următoarea eroare de invertor fotovoltaic: "${text}"`
            }
          ],
          max_tokens: 800,
          temperature: 0.3,
        });

        const aiResponse = completion.choices[0].message.content || "Nu s-a putut genera un răspuns AI.";
        finalResult = `🤖 **ANALIZĂ AI (${profile.role.toUpperCase()}):**\n\n${aiResponse}`;
        
        if (completion.usage) {
          const costEstimat = (completion.usage.prompt_tokens / 1000000) * 0.15 + 
                              (completion.usage.completion_tokens / 1000000) * 0.60;
          await supabase
            .from("profiles")
            .update({
              estimated_spend_this_month: (profile.estimated_spend_this_month || 0) + costEstimat
            })
            .eq("uuid", user.id);
        }
      } catch (aiError) {
        console.error("OpenAI Error:", aiError);
        finalResult = "⚠️ Eroare la analiza AI. Încercați din nou sau contactați suportul.";
      }
      
      await supabase
        .from("profiles")
        .update({
          text_used_this_month: (profile.text_used_this_month || 0) + 1
        })
        .eq("uuid", user.id);
        
      return NextResponse.json({ result: finalResult });
    }

    // Pentru FREE - dacă nu s-a găsit în DB
    if (isFree) {
      await supabase
        .from("profiles")
        .update({
          text_used_this_week: currentWeekUsage + 1,
          text_used_this_month: (profile.text_used_this_month || 0) + 1
        })
        .eq("uuid", user.id);
        
      return NextResponse.json({
        result: "❌ Eroarea nu a fost găsită în baza de date.\n\n💡 **Upgrade la PRO** (100 analize/lună, 20 poze/lună, AI) sau **INSTALLER** (400 analize/lună, 100 poze/lună, AI) pentru diagnostic avansat."
      });
    }

    return NextResponse.json({
      result: "❌ Eroarea nu a putut fi analizată. Contactați suportul."
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}