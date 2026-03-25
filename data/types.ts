export type ErrorCodeEntry = {
  brand: string;
  model: string;
  code: string;
  title: string;
  confidence: "scăzut" | "mediu" | "ridicat";
  meaning: string;
  checks: string[];
  action: string[];
  service: string[];
  ask: string[];
};