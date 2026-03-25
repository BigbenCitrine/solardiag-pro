import { NextResponse } from "next/server";
import OpenAI from "openai";
import { errorCodes } from "@/data/error-codes";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function normalizeText(text: string) {
  return text.toLowerCase().trim();
}

function findLocalMatchFromImage(brand: string, code: string, message: string) {
  const combined = `${brand} ${code} ${message}`.toLowerCase();

  for (const item of errorCodes) {
    const brandOk =
      item.brand === "general" || combined.includes(item.brand.toLowerCase());

    const codeOk =
      combined.includes(item.code.toLowerCase()) ||
      code.toLowerCase().includes(item.code.toLowerCase()) ||
      message.toLowerCase().includes(item.code.toLowerCase());

    if (brandOk && codeOk) {
      return item;
    }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    if (process.env.APP_ENABLED === "false") {
      return NextResponse.json({
        result: "Aplicația este dezactivată.",
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        result: "Lipsește cheia OpenAI din fișierul .env.local",
      });
    }

    const body = await req.json();
    const imageBase64 = body.imageBase64;

    if (!imageBase64) {
      return NextResponse.json({
        result: "Nu a fost trimisă nicio imagine.",
      });
    }

    const visionPrompt = `
Analizează această imagine cu display de invertor sau echipament fotovoltaic.

Extrage cât mai corect următoarele:
- brand
- model
- cod eroare
- mesaj eroare complet
- alte indicii utile vizibile
- nivel de încredere

Răspunde în format JSON valid.

Dacă nu ești sigur de un câmp, lasă-l gol.
Nu inventa.
NU adăuga explicații în afara JSON-ului.

Format obligatoriu:
{
  "brand": "",
  "model": "",
  "errorCode": "",
  "message": "",
  "otherVisibleText": "",
  "confidence": "scăzut"
}

Dacă ceva nu se vede clar, lasă șir gol.
Nu inventa.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: visionPrompt },
            {
              type: "image_url",
              image_url: {
                url: imageBase64,
              },
            },
          ],
        },
      ],
    });

   const raw = completion.choices[0]?.message?.content || "";

let extracted = {
  brand: "",
  model: "",
  errorCode: "",
  message: "",
  otherVisibleText: "",
  confidence: "scăzut",
};

const cleanedRaw = raw
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

try {
  extracted = JSON.parse(cleanedRaw);
} catch {
  return NextResponse.json({
    result:
      "Nu am putut structura clar rezultatul din poză.\n\nText brut primit:\n" +
      raw +
      "\n\nÎncearcă o poză mai clară, mai aproape și fără reflexii.",
  });
}
    const localMatch = findLocalMatchFromImage(
      extracted.brand || "",
      extracted.errorCode || "",
      extracted.message || ""
    );

    if (localMatch) {
      const result = `
Analiză imagine:
- reușită

Brand detectat:
- ${extracted.brand || "necunoscut"}

Model detectat:
- ${extracted.model || "necunoscut"}

Cod detectat:
- ${extracted.errorCode || "necunoscut"}

Mesaj detectat:
- ${extracted.message || "necunoscut"}

Încredere citire imagine:
- ${extracted.confidence || "scăzut"}

Bază internă găsită:
- Da

Titlu:
- ${localMatch.title}

Semnificație:
- ${localMatch.meaning}

Verificări rapide:
- ${localMatch.checks.join("\n- ")}

Acțiune recomandată:
- ${localMatch.action.join("\n- ")}

Când chemi service:
- ${localMatch.service.join("\n- ")}

Ce informații mai trebuie:
- ${localMatch.ask.join("\n- ")}
      `.trim();

      return NextResponse.json({ result });
    }

    const fallbackPrompt = `
Ești expert pragmatic în sisteme fotovoltaice.

Avem o imagine din care s-au extras următoarele:
- brand: ${extracted.brand}
- model: ${extracted.model}
- cod: ${extracted.errorCode}
- mesaj: ${extracted.message}
- alt text: ${extracted.otherVisibleText}
- încredere OCR/vision: ${extracted.confidence}

Nu există potrivire sigură în baza internă.

Răspunde în română, scurt și practic, în formatul:

Bază internă găsită:
- Nu

Interpretare probabilă:
- ...

Verificări rapide:
- ...
- ...
- ...

Acțiune recomandată:
- ...
- ...

Ce informații mai trebuie:
- ...
- ...
`;

    const fallback = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: fallbackPrompt,
        },
      ],
    });

    const fallbackResult =
      fallback.choices[0]?.message?.content ||
      "Nu s-a putut genera analiza imaginii.";

    return NextResponse.json({ result: fallbackResult });
  } catch (error: any) {
    console.error("EROARE ANALYZE IMAGE:", error);

    return NextResponse.json({
      result: "Eroare backend imagine: " + (error?.message || "necunoscută"),
    });
  }
}