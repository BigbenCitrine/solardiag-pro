import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

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

    if (isFree) {
      const weeklyLimit = profile.weekly_text_limit || 2;
      if (currentWeekUsage >= weeklyLimit) {
        return NextResponse.json({
          error: `Ai atins limita săptămânală de ${weeklyLimit} analize pentru contul FREE. Upgradează la PRO (100 analize/lună) sau INSTALLER (400 analize/lună) pentru mai multe.`
        }, { status: 429 });
      }
    }

    if (isProOrAbove && profile.role !== "admin" && profile.role !== "master") {
      const monthlyLimit = profile.monthly_text_limit || 100;
      const currentMonthUsage = profile.text_used_this_month || 0;
      
      if (currentMonthUsage >= monthlyLimit) {
        return NextResponse.json({
          error: `Ai atins limita lunară de ${monthlyLimit} analize pentru contul ${profile.role.toUpperCase()}. Contactează suportul pentru mărirea limitei.`
        }, { status: 429 });
      }
    }

    const searchTerm = text.trim();
    const { data: errorDb, error: dbError } = await supabase
      .from("error_codes")
      .select("*")
      .or(`code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .limit(5);

    let finalResult = "";

    if (errorDb && errorDb.length > 0) {
      const errors = errorDb.map((e: any) => 
        `📋 **${e.code}**: ${e.description}\n   🔧 Soluție: ${e.solution || "Contactează suportul tehnic."}`
      ).join("\n\n");
      
      finalResult = errors;
      
      await supabase
        .from("profiles")
        .update({
          text_used_this_week: currentWeekUsage + 1,
          text_used_this_month: (profile.text_used_this_month || 0) + 1
        })
        .eq("uuid", user.id);
        
      return NextResponse.json({ result: finalResult });
    }

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