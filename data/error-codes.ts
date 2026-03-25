export const errorCodes = [
  // ===== GROWATT =====

  {
    brand: "growatt",
    model: "",
    code: "11",
    title: "Cod 11 - interpretare dependentă de model",
    confidence: "scăzut",
    meaning:
      "Codul 11 la Growatt nu este universal. Semnificația depinde de modelul exact și mesajul complet din display.",
    checks: [
      "verifică modelul exact al invertorului",
      "verifică mesajul complet, nu doar codul",
      "verifică LED-uri sau alte indicii",
      "verifică tensiunea DC și conexiunile",
    ],
    action: [
      "identifică modelul exact",
      "fotografiază display-ul complet",
      "compară cu manualul oficial",
    ],
    service: ["cheamă service dacă nu poți identifica clar eroarea"],
    ask: ["ce model exact Growatt este?", "ce mesaj complet apare?"],
  },

  {
    brand: "growatt",
    model: "",
    code: "101",
    title: "Error 101 - Communication fault",
    confidence: "mediu",
    meaning: "Eroare de comunicare internă sau externă.",
    checks: [
      "verifică conexiunile de comunicație",
      "verifică cabluri și conectori",
      "verifică dacă eroarea apare constant sau intermitent",
    ],
    action: [
      "repornește invertorul",
      "verifică conexiunile de comunicație",
    ],
    service: ["cheamă service dacă eroarea persistă"],
    ask: [
      "apare constant sau intermitent?",
      "există și probleme de monitorizare sau logger?",
    ],
  },

  {
    brand: "growatt",
    model: "",
    code: "117",
    title: "Error 117 - Relay fault",
    confidence: "mediu",
    meaning: "Defect de releu intern.",
    checks: [
      "verifică tensiunea AC",
      "verifică conexiunile AC",
      "verifică dacă eroarea apare la cuplare",
    ],
    action: [
      "oprește invertorul",
      "verifică partea AC înainte de repornire",
    ],
    service: ["cheamă service dacă eroarea persistă"],
    ask: [
      "apare imediat la conectarea în rețea?",
      "ce tensiune AC ai măsurat?",
    ],
  },

  {
    brand: "growatt",
    model: "",
    code: "122",
    title: "Error 122 - Utility loss",
    confidence: "ridicat",
    meaning: "Invertorul nu detectează rețeaua.",
    checks: [
      "verifică tensiunea AC",
      "verifică siguranțele AC",
      "verifică bornele și conexiunile",
    ],
    action: [
      "confirmă prezența rețelei",
      "verifică protecțiile AC",
    ],
    service: ["cheamă service dacă persistă cu rețea normală"],
    ask: [
      "ai tensiune AC la borne?",
      "au existat fluctuații sau cădere de rețea?",
    ],
  },

  {
    brand: "growatt",
    model: "",
    code: "202",
    title: "Error 202 - PV Voltage High",
    confidence: "ridicat",
    meaning: "Tensiunea DC depășește limita maximă admisă.",
    checks: [
      "măsoară tensiunea stringurilor",
      "verifică numărul de panouri în serie",
      "verifică temperaturile scăzute (Voc mare)",
    ],
    action: [
      "oprește DC dacă e peste limită",
      "corectează dimensionarea stringului",
    ],
    service: ["cheamă service dacă valorile sunt normale dar eroarea persistă"],
    ask: [
      "ce tensiune ai măsurat?",
      "câte panouri sunt în serie?",
    ],
  },

  // ===== DEYE =====

  {
    brand: "deye",
    model: "",
    code: "f01",
    title: "F01 - Reverse polarity",
    confidence: "ridicat",
    meaning: "Polaritate inversată DC.",
    checks: [
      "verifică plus/minus pe string",
      "verifică fiecare string separat",
    ],
    action: [
      "corectează polaritatea",
      "repornește doar după verificarea polarității",
    ],
    service: ["cheamă service dacă persistă"],
    ask: ["ai verificat polaritatea direct pe string?"],
  },

  {
    brand: "deye",
    model: "",
    code: "f02",
    title: "F02 - DC insulation fault",
    confidence: "ridicat",
    meaning: "Problemă de izolație DC.",
    checks: [
      "verifică cabluri PV",
      "verifică umezeală",
      "măsoară izolația stringurilor",
    ],
    action: [
      "izolează stringul defect",
      "repornește doar după remediere",
    ],
    service: ["oprește dacă persistă"],
    ask: ["ai măsurat izolația?"],
  },

  {
    brand: "deye",
    model: "",
    code: "f03",
    title: "F03 - DC leakage",
    confidence: "ridicat",
    meaning: "Curent de scurgere DC.",
    checks: [
      "verifică izolația",
      "inspectează conectorii și traseele",
    ],
    action: [
      "izolează circuitul afectat",
      "remediază scurgerea înainte de repornire",
    ],
    service: ["cheamă service dacă persistă"],
    ask: ["apare intermitent sau pe umezeală?"],
  },

  {
    brand: "deye",
    model: "",
    code: "f04",
    title: "F04 - Ground fault GFDI",
    confidence: "ridicat",
    meaning: "Defect de punere la pământ.",
    checks: [
      "verifică cabluri PV",
      "verifică conectori",
      "inspectează cutiile de joncțiune",
    ],
    action: [
      "izolează stringul suspect",
      "repornește doar după eliminarea defectului",
    ],
    service: ["oprește dacă reapare"],
    ask: ["apare pe ploaie?"],
  },

  // ===== GOODWE =====

  {
    brand: "goodwe",
    model: "",
    code: "utility loss",
    title: "Utility Loss",
    confidence: "ridicat",
    meaning:
      "Invertorul nu detectează rețeaua publică sau conexiunea on-grid a eșuat.",
    checks: [
      "verifică dacă AC side are tensiune cu multimetrul",
      "verifică dacă rețeaua este disponibilă",
      "verifică dacă cablurile AC sunt strânse și conectate corect",
      "verifică dacă întrerupătorul AC este pornit",
    ],
    action: [
      "confirmă prezența tensiunii AC înainte de repornire",
      "strânge și verifică toate conexiunile AC",
      "repornește invertorul doar după confirmarea rețelei",
    ],
    service: ["cheamă service dacă ai rețea normală dar eroarea persistă"],
    ask: [
      "ce tensiune AC ai măsurat?",
      "întrerupătorul AC este pornit?",
    ],
  },

  {
    brand: "goodwe",
    model: "",
    code: "grid overvoltage",
    title: "Grid Overvoltage",
    confidence: "ridicat",
    meaning:
      "Tensiunea rețelei depășește domeniul permis sau durata supratensiunii depășește limita admisă.",
    checks: [
      "măsoară tensiunea AC la bornele invertorului",
      "verifică dacă problema apare când producția este mare",
      "verifică secțiunea cablului AC și conexiunile",
      "verifică dacă problema este temporară în rețea",
    ],
    action: [
      "verifică traseul și căderea de tensiune pe cablu",
      "verifică strângerea bornelor AC",
      "dacă problema vine din rețea, discută cu distribuitorul",
    ],
    service: [
      "cheamă service dacă măsurătorile sunt normale dar eroarea rămâne",
    ],
    ask: [
      "ce tensiune ai măsurat pe AC?",
      "apare doar la anumite ore?",
    ],
  },

  {
    brand: "goodwe",
    model: "",
    code: "over temperature",
    title: "Over Temperature",
    confidence: "ridicat",
    meaning:
      "Temperatura internă a invertorului depășește pragul admis.",
    checks: [
      "verifică ventilarea locului de montaj",
      "verifică dacă ventilatoarele funcționează",
      "verifică temperatura ambientală",
      "verifică depunerile de praf",
    ],
    action: [
      "îmbunătățește ventilarea și răcirea",
      "lasă invertorul să se răcească înainte de repornire",
      "curăță traseele de aer și ventilatoarele",
    ],
    service: [
      "cheamă service dacă ventilarea este bună și eroarea persistă",
    ],
    ask: [
      "invertorul este montat într-un spațiu închis sau în soare direct?",
      "ventilatoarele pornesc?",
    ],
  },

  // ===== SOLIS =====

  {
    brand: "solis",
    model: "",
    code: "no-grid",
    title: "NO-GRID",
    confidence: "ridicat",
    meaning: "Invertorul nu detectează tensiune de rețea.",
    checks: [
      "verifică conexiunile AC și întrerupătorul de rețea",
      "măsoară tensiunea AC la bornele invertorului",
      "verifică dacă rețeaua este prezentă și stabilă",
    ],
    action: [
      "confirmă rețeaua înainte de repornire",
      "verifică bornele și siguranțele AC",
    ],
    service: ["cheamă service dacă rețeaua este normală dar alarma persistă"],
    ask: [
      "ce tensiune AC ai măsurat?",
      "apare permanent sau intermitent?",
    ],
  },

  {
    brand: "solis",
    model: "",
    code: "ov-tem",
    title: "OV-TEM",
    confidence: "ridicat",
    meaning: "Invertorul a intrat în supratemperatură.",
    checks: [
      "verifică ventilarea invertorului",
      "verifică dacă este expus direct la soare",
      "verifică dacă există praf sau blocaj al răcirii",
    ],
    action: [
      "îmbunătățește ventilarea",
      "lasă invertorul să se răcească înainte de repornire",
    ],
    service: ["cheamă service dacă apare la temperaturi normale"],
    ask: [
      "invertorul este montat într-un spațiu închis?",
      "apare doar la prânz sau și dimineața?",
    ],
  },

  {
    brand: "solis",
    model: "",
    code: "ov-g-v",
    title: "OV-G-V",
    confidence: "ridicat",
    meaning: "Tensiunea rețelei este prea mare.",
    checks: [
      "măsoară tensiunea AC la borne",
      "verifică dacă rezistența cablului AC este prea mare",
      "verifică dacă problema apare când producția este ridicată",
    ],
    action: [
      "folosește cablu AC dimensionat corect",
      "verifică bornele și conexiunile",
      "modifică pragul doar dacă este permis de operatorul de rețea",
    ],
    service: ["cheamă service dacă tensiunile sunt normale dar alarma persistă"],
    ask: [
      "ce tensiune AC ai măsurat?",
      "ce secțiune are cablul AC?",
    ],
  },

  {
    brand: "solis",
    model: "",
    code: "grid-intf",
    title: "GRID-INTF",
    confidence: "ridicat",
    meaning: "Invertorul detectează interferență sau anomalie pe rețea.",
    checks: [
      "verifică stabilitatea rețelei",
      "verifică bornele și contactele AC",
      "verifică dacă mai apar și alte alarme de rețea",
    ],
    action: [
      "repornește după verificarea rețelei",
      "urmărește dacă alarma reapare în anumite intervale",
    ],
    service: ["cheamă service dacă apare frecvent cu rețea aparent normală"],
    ask: [
      "mai apar și alte alarme AC?",
      "problema apare doar în anumite ore?",
    ],
  },

  {
    brand: "solis",
    model: "",
    code: "reverse-grid",
    title: "Reverse-GRID",
    confidence: "ridicat",
    meaning: "Polaritate AC greșită sau problemă pe conexiunea de rețea.",
    checks: [
      "verifică polaritatea și ordinea conexiunilor AC",
      "verifică bornele și cablurile AC",
      "verifică dacă instalația a fost recent modificată",
    ],
    action: [
      "corectează conexiunea AC",
      "repornește numai după verificarea polarității",
    ],
    service: ["cheamă service dacă eroarea persistă după reconectare corectă"],
    ask: [
      "ai făcut lucrări recente pe partea AC?",
      "ai verificat polaritatea la borne?",
    ],
  },

  {
    brand: "solis",
    model: "",
    code: "dcinj-fault",
    title: "DCinj-FAULT",
    confidence: "ridicat",
    meaning: "Curent de injecție DC ridicat.",
    checks: [
      "verifică conexiunile AC și DC",
      "verifică dacă mai apar și alte alarme asociate",
      "urmărește dacă eroarea apare imediat după pornire",
    ],
    action: [
      "repornește invertorul",
      "dacă reapare, contactează instalatorul sau service-ul",
    ],
    service: ["cheamă service dacă eroarea persistă după restart"],
    ask: [
      "eroarea apare imediat după pornire?",
      "mai apar și alte coduri?",
    ],
  },

  // ===== SUNGROW =====

  {
    brand: "sungrow",
    model: "",
    code: "grid overvoltage",
    title: "Grid Overvoltage",
    confidence: "ridicat",
    meaning:
      "Tensiunea rețelei este peste pragul de protecție detectat de invertor.",
    checks: [
      "măsoară tensiunea AC la bornele invertorului",
      "verifică dacă problema apare la anumite ore",
      "verifică conexiunile și traseul AC",
    ],
    action: [
      "așteaptă revenirea rețelei în limite dacă este eveniment temporar",
      "verifică bornele și conexiunile AC",
      "dacă problema persistă, discută cu distribuitorul",
    ],
    service: [
      "cheamă service dacă tensiunea măsurată este normală dar alarma persistă",
    ],
    ask: [
      "ce tensiune AC ai măsurat?",
      "problema este continuă sau intermitentă?",
    ],
  },

  {
    brand: "sungrow",
    model: "",
    code: "grid underfrequency",
    title: "Grid Underfrequency",
    confidence: "ridicat",
    meaning:
      "Frecvența rețelei este sub limita de protecție detectată de invertor.",
    checks: [
      "verifică frecvența rețelei",
      "verifică dacă există fluctuații de rețea sau alte alarme AC",
      "verifică dacă problema apare în același interval orar",
    ],
    action: [
      "așteaptă stabilizarea rețelei dacă evenimentul este temporar",
      "verifică parametrii rețelei înainte de repornire",
    ],
    service: [
      "cheamă service sau operatorul de rețea dacă problema persistă",
    ],
    ask: [
      "ce frecvență ai măsurat?",
      "mai apar și alte alarme de rețea?",
    ],
  },

  {
    brand: "sungrow",
    model: "",
    code: "grid power outage",
    title: "Grid Power Outage",
    confidence: "ridicat",
    meaning:
      "Rețeaua AC este absentă sau întreruptă; invertorul se reconectează de obicei după revenirea rețelei la normal.",
    checks: [
      "verifică dacă există tensiune AC la borne",
      "verifică întrerupătorul și protecțiile AC",
      "verifică dacă este o întrerupere generală de rețea",
    ],
    action: [
      "confirmă revenirea rețelei înainte de repornire",
      "verifică bornele și conexiunile AC",
    ],
    service: [
      "cheamă service dacă rețeaua este prezentă dar alarma persistă",
    ],
    ask: [
      "ai tensiune AC la borne?",
      "problema apare după căderi de rețea?",
    ],
  },

  // ===== FRONIUS =====

  {
    brand: "fronius",
    model: "",
    code: "102",
    title: "Code 102 - AC voltage too high",
    confidence: "ridicat",
    meaning:
      "Tensiunea AC este prea mare; invertorul reia de obicei alimentarea când condițiile rețelei revin în limite.",
    checks: [
      "măsoară tensiunea AC la bornele invertorului",
      "verifică dacă problema apare la anumite ore",
      "verifică conexiunile și secțiunea cablului AC",
    ],
    action: [
      "verifică conexiunile la rețea",
      "urmărește dacă tensiunea revine în intervalul admis",
      "dacă problema persistă, discută cu operatorul de rețea sau instalatorul",
    ],
    service: [
      "cheamă service dacă statusul revine frecvent cu măsurători AC aparent normale",
    ],
    ask: [
      "ce tensiune AC ai măsurat?",
      "apare doar în anumite intervale?",
    ],
  },

  {
    brand: "fronius",
    model: "",
    code: "103",
    title: "Code 103 - AC voltage too low",
    confidence: "ridicat",
    meaning:
      "Tensiunea AC este sub limita admisă pentru funcționare normală.",
    checks: [
      "măsoară tensiunea AC la bornele invertorului",
      "verifică întrerupătorul și conexiunile AC",
      "verifică dacă există cădere de tensiune pe cablu",
    ],
    action: [
      "confirmă tensiunea rețelei înainte de repornire",
      "verifică traseul și conexiunile AC",
    ],
    service: [
      "cheamă service dacă tensiunea pare normală dar alarma persistă",
    ],
    ask: [
      "ce tensiune AC ai măsurat?",
      "apare cu sarcină mare sau constant?",
    ],
  },

  {
    brand: "fronius",
    model: "",
    code: "105",
    title: "Code 105 - AC frequency too high",
    confidence: "ridicat",
    meaning:
      "Frecvența rețelei este peste limita admisă de invertor.",
    checks: [
      "măsoară frecvența rețelei",
      "verifică dacă mai apar și alte alarme de rețea",
      "verifică dacă problema este temporară",
    ],
    action: [
      "așteaptă stabilizarea rețelei",
      "verifică parametrii AC înainte de repornire",
    ],
    service: [
      "contactează operatorul de rețea sau service dacă problema persistă",
    ],
    ask: [
      "ce frecvență ai măsurat?",
      "alarma apare continuu sau intermitent?",
    ],
  },

  {
    brand: "fronius",
    model: "",
    code: "106",
    title: "Code 106 - AC frequency too low",
    confidence: "ridicat",
    meaning:
      "Frecvența rețelei este sub limita admisă de invertor.",
    checks: [
      "măsoară frecvența rețelei",
      "verifică dacă mai apar și alte alarme AC",
      "verifică dacă problema apare în aceleași intervale",
    ],
    action: [
      "așteaptă stabilizarea rețelei dacă evenimentul este temporar",
      "verifică parametrii rețelei înainte de repornire",
    ],
    service: [
      "contactează operatorul de rețea sau service dacă problema persistă",
    ],
    ask: [
      "ce frecvență ai măsurat?",
      "mai apar și alte erori de rețea?",
    ],
  },

  {
    brand: "fronius",
    model: "",
    code: "107",
    title: "Code 107 - No AC grid detected",
    confidence: "ridicat",
    meaning:
      "Invertorul nu detectează rețeaua AC.",
    checks: [
      "verifică dacă există tensiune AC la borne",
      "verifică protecțiile și întrerupătorul AC",
      "verifică conexiunile AC",
    ],
    action: [
      "confirmă prezența rețelei înainte de repornire",
      "verifică siguranțele și conexiunile AC",
    ],
    service: [
      "cheamă service dacă rețeaua este prezentă dar alarma persistă",
    ],
    ask: [
      "ce tensiune AC ai măsurat?",
      "întrerupătorul AC este pornit?",
    ],
  },

  {
    brand: "fronius",
    model: "",
    code: "463",
    title: "Code 463 - Reversed AC polarity",
    confidence: "ridicat",
    meaning:
      "Polaritate AC inversată sau conector AC introdus incorect.",
    checks: [
      "verifică polaritatea și ordinea conexiunilor AC",
      "verifică dacă a fost modificată recent instalația",
      "verifică bornele și cablurile AC",
    ],
    action: [
      "corectează conexiunea AC",
      "repornește doar după verificarea polarității",
    ],
    service: [
      "cheamă service dacă alarma persistă după reconectare corectă",
    ],
    ask: [
      "ai făcut lucrări recente pe partea AC?",
      "ai verificat polaritatea la borne?",
    ],
  },

  {
    brand: "fronius",
    model: "",
    code: "474",
    title: "Code 474 - RCMU sensor faulty",
    confidence: "ridicat",
    meaning:
      "Senzorul RCMU raportează defect sau funcționare anormală.",
    checks: [
      "verifică dacă mai apar și alte alarme de izolație sau pământ",
      "verifică împământarea și cablurile relevante",
      "repornește și urmărește dacă alarma reapare imediat",
    ],
    action: [
      "efectuează un AC reset și verifică împământarea",
      "dacă revine, evită repornirile repetate",
    ],
    service: ["cheamă service dacă statusul revine frecvent"],
    ask: [
      "mai apar și alte alarme de izolație?",
      "alarma revine imediat după restart?",
    ],
  },

  {
    brand: "fronius",
    model: "",
    code: "475",
    title: "Code 475 - Insulation fault",
    confidence: "ridicat",
    meaning:
      "Defect de izolație între modulul solar și pământ.",
    checks: [
      "verifică izolația stringurilor PV",
      "inspectează cablurile și conectorii pentru umezeală sau deteriorări",
      "măsoară rezistența de izolație dacă ai echipament adecvat",
    ],
    action: [
      "izolează stringul suspect",
      "remediază cablul sau conectorul defect înainte de repornire",
    ],
    service: [
      "cheamă service dacă defectul persistă după verificările de izolație",
    ],
    ask: [
      "ai măsurat rezistența de izolație?",
      "problema apare pe timp umed sau constant?",
    ],
  },

  {
    brand: "fronius",
    model: "",
    code: "517",
    title: "Code 517 - Power derating caused by too high a temperature",
    confidence: "ridicat",
    meaning:
      "Invertorul reduce puterea din cauza temperaturii prea mari.",
    checks: [
      "verifică ventilatoarele și orificiile de răcire",
      "verifică dacă există praf sau blocaj de aer",
      "verifică temperatura ambientală și locul de montaj",
    ],
    action: [
      "curăță traseele de aer și radiatorul",
      "lasă invertorul să se răcească",
      "îmbunătățește ventilarea spațiului",
    ],
    service: [
      "cheamă service dacă derating-ul persistă la temperaturi normale",
    ],
    ask: [
      "ventilatoarele funcționează?",
      "invertorul este montat în soare direct sau spațiu închis?",
    ],
  },

  // ===== HUAWEI =====

  {
    brand: "huawei",
    model: "",
    code: "2031",
    title: "2031 - Phase wire short-circuited to PE",
    confidence: "ridicat",
    meaning:
      "Conductorul de fază este în scurt la PE sau impedanța către PE este prea mică.",
    checks: [
      "verifică dacă există scurt sau impedanță mică între fază și PE",
      "verifică cablul AC și bornele",
      "verifică dacă a fost modificată recent instalația AC",
    ],
    action: [
      "remediază defectul pe partea AC înainte de repornire",
      "repornește doar după verificarea izolării și conexiunilor",
    ],
    service: [
      "cheamă service dacă alarma persistă după verificarea cablajului AC",
    ],
    ask: [
      "ai verificat cablul de fază către PE?",
      "au fost lucrări recente pe partea AC?",
    ],
  },

  {
    brand: "huawei",
    model: "",
    code: "2032",
    title: "2032 - Grid Failed",
    confidence: "ridicat",
    meaning:
      "Invertorul detectează problemă pe rețeaua AC.",
    checks: [
      "verifică dacă tensiunea AC este normală",
      "verifică dacă circuitul AC este întrerupt sau întrerupătorul AC este OFF",
      "verifică bornele și conexiunile AC",
    ],
    action: [
      "confirmă rețeaua și conexiunile AC înainte de repornire",
      "repornește doar după stabilizarea rețelei",
    ],
    service: [
      "cheamă service dacă tensiunea AC este normală dar alarma persistă",
    ],
    ask: [
      "ce tensiune AC ai măsurat?",
      "întrerupătorul AC este pornit?",
    ],
  },

  {
    brand: "huawei",
    model: "",
    code: "2051",
    title: "2051 - Abnormal Residual Current",
    confidence: "ridicat",
    meaning:
      "Invertorul detectează curent rezidual anormal.",
    checks: [
      "verifică dacă există alarmă de scurt la pământ pe string, izolație mică sau fault la pământ",
      "verifică cablurile și conectorii pentru umezeală sau deteriorări",
      "verifică împământarea și starea traseelor PV",
    ],
    action: [
      "elimină cauza externă, apoi repornește",
      "dacă apare ocazional, urmărește dacă sistemul își revine după remedierea cauzei",
    ],
    service: [
      "cheamă service dacă alarma apare frecvent sau persistă",
    ],
    ask: [
      "mai apar și alarme de izolație sau scurt la pământ?",
      "problema apare pe timp umed?",
    ],
  },

  {
    brand: "huawei",
    model: "",
    code: "2062",
    title: "2062 - Low Insulation Resistance",
    confidence: "ridicat",
    meaning:
      "Rezistența de izolație pe partea PV este prea mică.",
    checks: [
      "verifică dacă există scurt între PV și pământ",
      "verifică dacă mediul este umed și a scăzut izolația",
      "măsoară rezistența de izolație a stringurilor",
    ],
    action: [
      "izolează stringul suspect",
      "remediază cablul sau conectorul defect înainte de repornire",
    ],
    service: [
      "cheamă service dacă defectul persistă după verificările de izolație",
    ],
    ask: [
      "ai măsurat rezistența de izolație?",
      "problema apare după ploaie sau umezeală?",
    ],
  },

  {
    brand: "huawei",
    model: "",
    code: "2003",
    title: "2003 - DC Arc Fault",
    confidence: "ridicat",
    meaning:
      "Invertorul detectează arc electric pe partea DC.",
    checks: [
      "identifică stringul PV anormal din informațiile de alarmă",
      "verifică conectorii și cablurile stringului afectat",
      "inspectează îmbinările și bornele pentru urme de încălzire",
    ],
    action: [
      "oprește partea DC și remediază circuitul afectat",
      "repornește doar după eliminarea cauzei",
    ],
    service: [
      "cheamă service dacă nu poți identifica rapid stringul afectat",
    ],
    ask: [
      "ce string este indicat în alarmă?",
      "există urme de încălzire sau conectori slăbiți?",
    ],
  },

  {
    brand: "huawei",
    model: "",
    code: "2009",
    title: "2009 - String Short-Circuited to Ground",
    confidence: "ridicat",
    meaning:
      "Un string PV este în scurt la pământ.",
    checks: [
      "verifică ruta indicată de alarmă",
      "inspectează cablurile și conectorii pentru atingere la masă",
      "măsoară izolația stringului afectat",
    ],
    action: [
      "izolează stringul cu defect",
      "remediază traseul sau conectorul înainte de repornire",
    ],
    service: [
      "cheamă service dacă defectul persistă după verificări",
    ],
    ask: [
      "care este stringul indicat de alarmă?",
      "ai măsurat izolația pe acel string?",
    ],
  },

  {
    brand: "huawei",
    model: "",
    code: "2012",
    title: "2012 - String Current Backfeed",
    confidence: "ridicat",
    meaning:
      "Invertorul detectează curent de backfeed într-un string.",
    checks: [
      "verifică polaritatea și conexiunile stringurilor",
      "verifică dacă există stringuri conectate incorect",
      "verifică dacă alarma indică un string anume",
    ],
    action: [
      "corectează conexiunile stringului afectat",
      "repornește doar după verificarea polarității și conexiunilor",
    ],
    service: [
      "cheamă service dacă alarma persistă după verificări",
    ],
    ask: [
      "ce string este indicat în alarmă?",
      "ai verificat polaritatea și conexiunile?",
    ],
  },

  {
    brand: "huawei",
    model: "",
    code: "2064",
    title: "2064 - Device Abnormal",
    confidence: "mediu",
    meaning:
      "Invertorul raportează defect intern sau condiție anormală a dispozitivului.",
    checks: [
      "verifică dacă mai apar și alte alarme asociate",
      "repornește invertorul și urmărește dacă alarma reapare",
      "verifică condițiile de funcționare și alimentarea",
    ],
    action: [
      "efectuează o repornire controlată",
      "dacă alarma persistă, notează cauza ID și contextul",
    ],
    service: [
      "cheamă service dacă alarma revine imediat sau este însoțită de alte defecte majore",
    ],
    ask: [
      "care este cause ID din alarmă?",
      "mai apar și alte coduri simultan?",
    ],
  },

  {
    brand: "huawei",
    model: "",
    code: "2080",
    title: "2080 - Abnormal PV Module Configuration",
    confidence: "mediu",
    meaning:
      "Configurația stringului PV este anormală sau necorespunzătoare.",
    checks: [
      "verifică dacă tensiunea stringului este aproximativ 0",
      "verifică dacă există circuit deschis în string",
      "verifică dacă numărul de module și conexiunile corespund proiectării",
    ],
    action: [
      "remediază stringul deschis sau configurația greșită",
      "repornește după verificarea tensiunilor și conexiunilor",
    ],
    service: [
      "cheamă service dacă nu poți identifica stringul/configurația afectată",
    ],
    ask: [
      "ce tensiune ai pe stringul afectat?",
      "există vreun string cu tensiune aproape 0?",
    ],
  },

  // ===== GENERAL =====

  {
    brand: "general",
    model: "",
    code: "utility loss",
    title: "Utility Loss / pierdere rețea",
    confidence: "mediu",
    meaning:
      "Invertorul nu detectează rețeaua sau conexiunea AC este întreruptă.",
    checks: [
      "verifică dacă există tensiune AC la borne",
      "verifică întrerupătorul AC și siguranțele",
      "verifică dacă rețeaua este disponibilă",
    ],
    action: [
      "confirmă rețeaua și conexiunile AC",
      "repornește invertorul doar după confirmarea alimentării",
    ],
    service: ["cheamă service dacă rețeaua este prezentă dar alarma persistă"],
    ask: [
      "ce tensiune AC ai măsurat?",
      "este oprit întrerupătorul AC?",
    ],
  },

  {
    brand: "general",
    model: "",
    code: "grid overvoltage",
    title: "Supratensiune rețea",
    confidence: "mediu",
    meaning: "Tensiune AC prea mare.",
    checks: [
      "măsoară tensiunea AC",
      "verifică secțiunea cablului AC",
      "verifică dacă problema apare la prânz",
    ],
    action: [
      "verifică rețeaua și conexiunile AC",
      "confirmă dacă problema este locală sau de distribuție",
    ],
    service: ["contactează distribuitorul dacă tensiunea depășește limitele"],
    ask: ["ce tensiune ai?"],
  },

  {
    brand: "general",
    model: "",
    code: "grid underfrequency",
    title: "Frecvență rețea prea mică",
    confidence: "mediu",
    meaning: "Frecvența rețelei este sub pragul permis.",
    checks: [
      "măsoară frecvența rețelei",
      "verifică dacă problema este temporară sau repetitivă",
      "verifică dacă mai apar și alte alarme de rețea",
    ],
    action: [
      "așteaptă stabilizarea rețelei dacă evenimentul e temporar",
      "verifică parametrii rețelei înainte de repornire",
    ],
    service: ["contactează operatorul de rețea dacă problema persistă"],
    ask: [
      "ce frecvență ai măsurat?",
      "mai apar și alte probleme AC?",
    ],
  },

  {
    brand: "general",
    model: "",
    code: "over temperature",
    title: "Supratemperatură",
    confidence: "mediu",
    meaning: "Invertorul este prea fierbinte.",
    checks: [
      "verifică ventilarea",
      "verifică ventilatoarele",
      "verifică dacă este montat în soare direct",
    ],
    action: [
      "răcește invertorul",
      "îmbunătățește ventilația",
    ],
    service: ["cheamă service dacă persistă"],
    ask: ["unde este montat?"],
  },

  {
    brand: "general",
    model: "",
    code: "no grid",
    title: "Lipsă rețea",
    confidence: "mediu",
    meaning: "Nu există rețea AC sau invertorul nu o detectează.",
    checks: [
      "verifică tensiunea AC",
      "verifică siguranțele și întrerupătoarele",
      "verifică conexiunile AC",
    ],
    action: [
      "verifică protecțiile AC",
      "confirmă prezența rețelei înainte de repornire",
    ],
    service: ["cheamă service dacă persistă"],
    ask: ["ai tensiune AC?"],
  },

  {
    brand: "general",
    model: "",
    code: "earth fault",
    title: "Earth Fault / fault la pământ",
    confidence: "mediu",
    meaning:
      "Invertorul detectează problemă de împământare sau scurgere la pământ.",
    checks: [
      "verifică împământarea AC",
      "inspectează cablurile și conectorii pentru atingere la masă",
      "verifică dacă problema apare pe umezeală",
    ],
    action: [
      "corectează împământarea și conexiunile",
      "izolează circuitul suspect înainte de repornire",
    ],
    service: ["cheamă service dacă alarma persistă după verificări"],
    ask: [
      "partea AC este corect împământată?",
      "ai observat umezeală sau conectori deteriorați?",
    ],
  },

  {
    brand: "general",
    model: "",
    code: "insulation fault",
    title: "Insulation fault",
    confidence: "mediu",
    meaning:
      "Defect de izolație între stringurile PV și pământ sau trasee DC.",
    checks: [
      "măsoară rezistența de izolație a stringurilor",
      "inspectează conectorii și cablurile pentru umezeală sau deteriorări",
      "izolează pe rând stringurile pentru identificare",
    ],
    action: [
      "remediază stringul sau traseul defect înainte de repornire",
      "repornește numai după verificări de izolație",
    ],
    service: ["cheamă service dacă defectul persistă"],
    ask: [
      "ai măsurat izolația?",
      "problema apare pe timp umed?",
    ],
  },

  {
    brand: "general",
    model: "",
    code: "dc injection high",
    title: "DC Injection High",
    confidence: "mediu",
    meaning: "Invertorul detectează injecție DC anormală pe partea AC.",
    checks: [
      "verifică partea AC",
      "verifică dacă mai apar alte alarme asociate",
    ],
    action: [
      "repornește după verificarea conexiunilor AC",
      "monitorizează dacă eroarea reapare",
    ],
    service: ["cheamă service dacă persistă"],
    ask: ["mai apar și alte coduri?"],
  },
];