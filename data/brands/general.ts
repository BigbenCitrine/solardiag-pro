import type { ErrorCodeEntry } from "../types";

export const generalErrorCodes: ErrorCodeEntry[] = [
  {
    brand: "general",
    model: "",
    code: "grid overvoltage",
    title: "Supratensiune rețea",
    confidence: "mediu",
    meaning:
      "Invertorul detectează tensiune prea mare pe rețeaua AC și se protejează.",
    checks: [
      "măsoară tensiunea AC la bornele invertorului",
      "verifică dacă problema apare la prânz sau când producția este mare",
      "verifică secțiunea cablului AC și conexiunile",
      "verifică dacă și alți consumatori sau invertoare din zonă au probleme",
    ],
    action: [
      "verifică strângerea bornelor AC",
      "verifică traseul și căderea de tensiune pe cablu",
      "discută cu distribuitorul dacă tensiunea din rețea e peste limite",
    ],
    service: [
      "cheamă service dacă măsurătorile sunt normale, dar invertorul raportează în continuare eroarea",
      "oprește echipamentul dacă apar și alte alarme AC",
    ],
    ask: [
      "ce tensiune ai măsurat pe AC?",
      "în ce interval orar apare eroarea?",
      "ce model de invertor este?",
    ],
  },
];