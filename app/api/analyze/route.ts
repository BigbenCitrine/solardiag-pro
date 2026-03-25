import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { errorCodes } from "@/data/error-codes";

type DbProfile = {
  uuid: string;
  email: string;
  role: "master" | "admin" | "installer" | "pro" | "free" | "trusted";
  status: "active" | "suspended" | "banned";
  can_use_image: boolean;
  monthly_text_limit: number;
  monthly_image_limit: number;
  text_used_this_month: number;
  image_used_this_month: number;
  monthly_spend_cap: number | string;
  estimated_spend_this_month: number | string;
  billing_period_reset_at: string;
};

type ErrorCodeItem = {
  brand: string;
  model: string;
  code: string;
  title: string;
  confidence: string;
  meaning: string;
  checks: string[];
  action: string[];
  service: string[];
  ask: string[];
};

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const ESTIMATED_TEXT_AI_COST = 0.01;

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function formatLocalResult(item: ErrorCodeItem) {
  return [
    `${item.title}`,
    "",
    `Încredere: ${item.confidence}`,
    "",
    `Semnificație: ${item.meaning}`,
    "",
    `Verificări:`,
    ...item.checks.map((x) => `- ${x}`),
    "",
    `Acțiuni recomandate:`,
    ...item.action.map((x) => `- ${x}`),
    "",
    `Când chemi service:`,
    ...item.service.map((x) => `- ${x}`),
    "",
    `Întrebări utile:`,
    ...item.ask.map((x) => `- ${x}`),
  ].join("\n");
}

function findLocalError(input: string): ErrorCodeItem | null {
  const q = normalizeText(input);

  for (const item of errorCodes as ErrorCodeItem[]) {
    const brand = normalizeText(item.brand || "");
    const code = normalizeText(item.code || "");
    const title = normalizeText(item.title || "");

    if (brand && code && q.includes(brand) && q.includes(code)) {
      return item;
    }

    if (brand && title && q.includes(brand) && q.includes(title)) {
      return item;
    }
  }

  for (const item of errorCodes as ErrorCodeItem[]) {
    const code = normalizeText(item.code || "");
    const title = normalizeText(item.title || "");

    if (code && q === code) return item;
    if (title && q === title) return item;
    if (code && q.includes(code) && item.brand === "general") return item;
    if (title && q.includes(title)) return item;
  }

  for (const item of errorCodes as ErrorCodeItem[]) {
    const brand = normalizeText(item.brand || "");
    const title = normalizeText(item.title || "");

    if (!title) continue;

    const titleWords = title.split(/\s+/).filter((w) => w.length >= 4);
    const hits = titleWords.filter((w) => q.includes(w)).length;

    if ((brand && q.includes(brand) && hits >= 1) || hits >= 2) {
      return item;
    }
  }

  return null;
}

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

async function resetMonthlyUsageIfNeeded(
  supabase: ReturnType<typeof createSupabaseClientWithUserToken>,
  profile: DbProfile
): Promise<DbProfile> {
  const resetAt = profile.billing_period_reset_at
    ? new Date(profile.billing_period_reset_at).getTime()
    : 0;

  const now = Date.now();

  if (!resetAt || now - resetAt > MONTH_MS) {
    const newReset = new Date().toISOString();

    const { error } = await supabase
      .from("profiles")
      .update({
        text_used_this_month: 0,
        image_used_this_month: 0,
        estimated_spend_this_month: 0,
        billing_period_reset_at: newReset,
      })
      .eq("uuid", profile.uuid);

    if (!error) {
      return {
        ...profile,
        text_used_this_month: 0,
        image_used_this_month: 0,
        estimated_spend_this_month: 0,
        billing_period_reset_at: newReset,
      };
    }
  }

  return profile;
}

export async function POST(req: Request) {
  try {
    if (process.env.APP_ENABLED === "false") {
      return NextResponse.json({
        result: "Aplicația este dezactivată.",
      });
    }

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
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { data: rawProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("uuid", user.id)
      .single();

    if (profileError || !rawProfile) {
      return NextResponse.json(
        {
          error: `No profile found pentru userul ${user.email || user.id}`,
        },
        { status: 404 }
      );
    }

    let profile = (await resetMonthlyUsageIfNeeded(
      supabase,
      rawProfile as DbProfile
    )) as DbProfile;

    if (profile.status !== "active") {
      return NextResponse.json(
        { result: "Contul tău nu este activ." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const input = String(body?.text || "").trim();

    if (!input) {
      return NextResponse.json(
        { result: "Introdu un cod de eroare sau o descriere." },
        { status: 400 }
      );
    }

    const localMatch = findLocalError(input);
    if (localMatch) {
      return NextResponse.json({
        result: formatLocalResult(localMatch),
        source: "database",
      });
    }

    if (profile.role === "free") {
      return NextResponse.json({
        result: "Disponibil în PRO",
        source: "plan-gate",
      });
    }

    const aiAllowedRoles = ["master", "admin", "installer", "pro", "trusted"];
    if (!aiAllowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { result: "Rol invalid pentru analiză AI." },
        { status: 403 }
      );
    }

    const isUnlimitedRole =
      profile.role === "master" || profile.role === "admin";

    if (!isUnlimitedRole) {
      if (profile.text_used_this_month >= profile.monthly_text_limit) {
        return NextResponse.json({
          result: "Ai atins limita lunară de utilizare.",
          source: "plan-limit",
        });
      }

      if (
        Number(profile.estimated_spend_this_month) >=
        Number(profile.monthly_spend_cap)
      ) {
        return NextResponse.json({
          result: "Ai atins limita de consum.",
          source: "spend-limit",
        });
      }
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        result:
          "OPENAI_API_KEY lipsește din .env.local. Pentru FREE trebuie să vezi «Disponibil în PRO». Pentru rolurile plătite, AI nu poate răspunde până nu pui cheia.",
        source: "missing-openai-key",
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
Ești un asistent tehnic pentru diagnoză de invertoare fotovoltaice.

Userul a introdus:
"${input}"

Răspunde în limba română, clar și practic.

Structură obligatorie:
1. Interpretare probabilă
2. Ce verifici
3. Ce faci mai departe
4. Când chemi service

Nu inventa modele sau coduri dacă nu sunt sigure.
Dacă inputul este vag, spune ce informații mai trebuie.
`.trim();

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Ești un expert tehnic în diagnoza invertoarelor fotovoltaice.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const finalResult =
      aiResponse.choices?.[0]?.message?.content?.trim() ||
      "AI nu a returnat text.";

    if (!isUnlimitedRole) {
      await supabase
        .from("profiles")
        .update({
          text_used_this_month: profile.text_used_this_month + 1,
          estimated_spend_this_month:
            Number(profile.estimated_spend_this_month) + ESTIMATED_TEXT_AI_COST,
        })
        .eq("uuid", user.id);
    }

    return NextResponse.json({
      result: finalResult,
      source: "ai",
    });
  } catch (error) {
    console.error("EROARE REALĂ ANALYZE:", error);

    return NextResponse.json(
      { error: `Eroare server: ${String(error)}` },
      { status: 500 }
    );
  }
}