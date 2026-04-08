import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const ESTIMATED_IMAGE_AI_COST = 0.03;

function createSupabaseClientWithUserToken(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    // 1. Auth
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return NextResponse.json({ error: "Token lipsă" }, { status: 401 });
    }

    const supabase = createSupabaseClientWithUserToken(token);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
    }

    // 2. Profil
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("uuid", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profil negăsit" }, { status: 404 });
    }

    if (profile.status !== "active") {
      return NextResponse.json(
        { error: "Contul nu este activ." },
        { status: 403 }
      );
    }

    // 3. Verifică dacă are drept la poză
    const allowedRoles = ["master", "admin", "installer", "pro", "trusted"];
    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: "Analiza după poză este disponibilă doar în planul PRO sau INSTALLER." },
        { status: 403 }
      );
    }

    const isUnlimited = profile.role === "master" || profile.role === "admin";

    // 4. Verifică limita de imagini
    if (!isUnlimited) {
      if (profile.image_used_this_week >= profile.weekly_image_limit) {
        return NextResponse.json(
          { error: "Ai atins limita săptămânală de analize după poză." },
          { status: 429 }
        );
      }

      if (
        Number(profile.estimated_spend_this_month) >=
        Number(profile.monthly_spend_cap)
      ) {
        return NextResponse.json(
          { error: "Ai atins limita de consum lunar." },
          { status: 429 }
        );
      }
    }

    // 5. Citește imaginea
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: "Imaginea lipsește." }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        { error: "Imaginea este prea mare. Maxim 10MB." },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: "Format neacceptat. Folosește JPG, PNG sau WebP." },
        { status: 400 }
      );
    }

    // 6. Convertește în base64
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = imageFile.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif";

    // 7. Trimite la OpenAI Vision
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY lipsește din configurație." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content:
            "Ești un expert tehnic în diagnoza invertoarelor fotovoltaice. Analizezi imaginile cu ecrane de invertoare, coduri de eroare, etichete tehnice și dai diagnostice clare în limba română.",
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
                detail: "high",
              },
            },
            {
              type: "text",
              text: `Analizează această imagine cu invertorul fotovoltaic și răspunde în română cu structura:

1. Ce vezi în imagine (ecran, cod eroare, indicator LED, etc.)
2. Interpretare probabilă a problemei
3. Ce trebuie verificat
4. Pași de rezolvare
5. Când este necesar service-ul

Fii clar și practic. Dacă imaginea nu este clară sau nu conține un invertor, spune ce vezi și ce informații ar fi utile.`,
            },
          ],
        },
      ],
    });

    const result =
      aiResponse.choices?.[0]?.message?.content?.trim() ||
      "AI nu a putut analiza imaginea.";

    // 8. Actualizează contoarele
    if (!isUnlimited) {
      await supabase
        .from("profiles")
        .update({
          image_used_this_week: profile.image_used_this_week + 1,
          image_used_this_month: profile.image_used_this_month + 1,
          estimated_spend_this_month:
            Number(profile.estimated_spend_this_month) + ESTIMATED_IMAGE_AI_COST,
        })
        .eq("uuid", user.id);
    }

    return NextResponse.json({ result, source: "ai-vision" });
  } catch (error) {
    console.error("EROARE ANALYZE-IMAGE:", error);
    return NextResponse.json(
      { error: `Eroare server: ${String(error)}` },
      { status: 500 }
    );
  }
}