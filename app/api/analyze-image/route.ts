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

    // Verifică dacă are acces la analiză de imagini
    const canUseImage = ["pro", "installer", "trusted", "admin", "master"].includes(profile.role);
    if (!canUseImage) {
      return NextResponse.json({ 
        error: "Analiza imaginilor este disponibilă doar pentru conturile PRO și INSTALLER. Upgradează pentru a accesa această funcție." 
      }, { status: 403 });
    }

    // Verifică limitele lunare pentru imagini
    const monthlyImageLimit = profile.monthly_image_limit || 20;
    const imagesUsedThisMonth = profile.image_used_this_month || 0;
    
    if (imagesUsedThisMonth >= monthlyImageLimit) {
      return NextResponse.json({ 
        error: `Ai atins limita lunară de ${monthlyImageLimit} analize de imagini. Upgrade pentru mai multe.` 
      }, { status: 429 });
    }

    // Parsează form data
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json({ error: "Imagine lipsă" }, { status: 400 });
    }

    // Verifică tipul de fișier
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json({ 
        error: "Format invalid. Folosește JPEG, PNG sau WEBP." 
      }, { status: 400 });
    }

    // Verifică dimensiunea (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (imageFile.size > maxSize) {
      return NextResponse.json({ 
        error: "Imaginea este prea mare. Maxim 5MB." 
      }, { status: 400 });
    }

    // Convertește imaginea în base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const mimeType = imageFile.type;

    // Apelează OpenAI Vision cu prompt specializat pentru TOATE mărcile
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Ești un inginer specialist în service pentru invertoare fotovoltaice de toate mărcile (SMA, Fronius, Huawei, Growatt, Deye, Solis, GoodWe, Victron, Schneider, ABB, SolarEdge, Enphase, Delta, Kostal, Sungrow și altele). Analizează imagini cu ecrane de eroare, afișaje LED/LCD, etichete sau panouri de control. Răspunde în limba română tehnică, clar și structurat. Oferă: 1) Identificarea mărcii și modelului (dacă sunt vizibile), 2) Codul erorii și semnificația, 3) Cauze probabile, 4) Pași concreți de diagnostic și remediere, 5) Recomandări de siguranță electrică."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Aceasta este o imagine cu un invertor fotovoltaic sau echipament aferent. Analizează imaginea și identifică: marca, modelul (dacă este vizibil), codul de eroare sau mesajul afișat, și oferă un diagnostic complet în limba română. Dacă imaginea nu este clară sau nu conține informații relevante, solicită o imagine mai bună și specifică ce ar trebui fotografiat."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const aiResponse = completion.choices[0].message.content || "Nu s-a putut analiza imaginea. Te rugăm să încerci din nou cu o imagine mai clară.";

    // Calculează costul estimat (Vision are preț mai mare)
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;
    const costEstimat = (inputTokens / 1000000) * 0.15 + (outputTokens / 1000000) * 0.60 + 0.002; // + cost imagine
    
    // Actualizează contoarele
    await supabase
      .from("profiles")
      .update({
        image_used_this_week: (profile.image_used_this_week || 0) + 1,
        image_used_this_month: (profile.image_used_this_month || 0) + 1,
        estimated_spend_this_month: (profile.estimated_spend_this_month || 0) + costEstimat
      })
      .eq("uuid", user.id);

    return NextResponse.json({ 
      result: `📷 **ANALIZĂ IMAGINE:**\n\n${aiResponse}` 
    });

  } catch (error) {
    console.error("API Analyze Image Error:", error);
    return NextResponse.json({ 
      error: "Eroare internă la procesarea imaginii. Verifică consola pentru detalii." 
    }, { status: 500 });
  }
}