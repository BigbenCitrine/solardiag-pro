import type { ErrorCodeEntry } from "../types";

export const growattErrorCodes: ErrorCodeEntry[] = [
  {
    brand: "growatt",
    model: "",
    code: "11",
    title: "Cod 11 - interpretare dependentă de model",
    confidence: "scăzut",
    meaning:
      "Pentru Growatt, codul 11 nu trebuie tratat ca semnificație certă fără modelul exact al invertorului și mesajul complet din display.",
    checks: [
      "verifică modelul exact al invertorului",
      "verifică mesajul complet afișat, nu doar numărul",
      "verifică dacă există LED roșu, mesaj de rețea, temperatură sau izolație",
      "verifică tensiunea DC din stringuri și starea conexiunilor",
    ],
    action: [
      "identifică seria exactă a invertorului",
      "fotografiază display-ul sau mesajul complet",
      "compară eroarea cu manualul modelului respectiv",
      "dacă nu ai modelul exact, tratează interpretarea ca probabilă, nu certă",
    ],
    service: [
      "oprește echipamentul și cheamă service dacă apare miros de ars, zgomot anormal sau încălzire excesivă",
      "cheamă service dacă eroarea revine imediat după reset",
    ],
    ask: [
      "care este modelul exact Growatt?",
      "ce mesaj complet apare pe display?",
      "invertorul mai produce sau se oprește complet?",
    ],
  },
];