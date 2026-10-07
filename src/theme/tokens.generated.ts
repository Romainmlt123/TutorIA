/*
 * FICHIER GÉNÉRÉ — ne pas modifier à la main.
 * Source : design/tokens/tokens.json et design/tokens/app-tokens.json.
 * Régénérer avec : npm run tokens
 */

export const palette = {
  "gray": {
    "100": "#f5f8ff",
    "200": "#ced4e2",
    "300": "#9da6b9",
    "400": "#798398",
    "500": "#5d677d",
    "600": "#343f55",
    "700": "#1c263b",
    "800": "#091122",
    "900": "#000612"
  },
  "blue": {
    "100": "#ebf1ff",
    "200": "#b2c9f6",
    "300": "#7da3f0",
    "400": "#4d81ea",
    "500": "#2e6be6",
    "600": "#1750c4",
    "700": "#0a3b9d",
    "800": "#03276e",
    "900": "#00143d"
  },
  "cyan": {
    "100": "#ebfcff",
    "200": "#a9e9f4",
    "300": "#7addee",
    "400": "#51d1e6",
    "500": "#2ecbe6",
    "600": "#17a5be",
    "700": "#09879d",
    "800": "#026273",
    "900": "#00353d"
  },
  "violet": {
    "100": "#f1ebff",
    "200": "#cab6f6",
    "300": "#a787f2",
    "400": "#8558ea",
    "500": "#662ee6",
    "600": "#521dc8",
    "700": "#3b0da2",
    "800": "#210267",
    "900": "#13003d"
  },
  "green": {
    "100": "#ebfff2",
    "200": "#aff3c8",
    "300": "#7eefa8",
    "400": "#50e687",
    "500": "#2ee671",
    "600": "#1bc85b",
    "700": "#0c9e42",
    "800": "#03702b",
    "900": "#003d16"
  },
  "orange": {
    "100": "#fff7eb",
    "200": "#f4dab5",
    "300": "#eec181",
    "400": "#e9a951",
    "500": "#e6992e",
    "600": "#d08825",
    "700": "#a3640d",
    "800": "#6e4204",
    "900": "#3d2400"
  },
  "red": {
    "100": "#ffebeb",
    "200": "#f8b6b6",
    "300": "#ef8181",
    "400": "#e95555",
    "500": "#e62e2e",
    "600": "#c21a1a",
    "700": "#980b0b",
    "800": "#680303",
    "900": "#3d0000"
  },
  "azure": {
    "100": "#ebf2ff",
    "200": "#b4cefd",
    "300": "#77a6fa",
    "400": "#3f83fb",
    "500": "#035cf9",
    "600": "#004bd0",
    "700": "#023ca3",
    "800": "#022b73",
    "900": "#00163d"
  }
} as const;

export const colors = {
  "bg": "#f5f8ff",
  "surface": "#ffffff",
  "text": "#000612",
  "textSecondary": "#5d677d",
  "textDisabled": "#798398",
  "textOnColor": "#ffffff",
  "border": "#ced4e2",
  "borderStrong": "#798398",
  "brand": "#2e6be6",
  "primary": "#2e6be6",
  "primaryHover": "#1750c4",
  "primaryPressed": "#0a3b9d",
  "primarySoft": "#ebf1ff",
  "accent": "#662ee6",
  "accentSoft": "#f1ebff",
  "success": "#0c9e42",
  "successStrong": "#03702b",
  "successSoft": "#ebfff2",
  "warning": "#a3640d",
  "warningStrong": "#6e4204",
  "warningSoft": "#fff7eb",
  "error": "#e62e2e",
  "errorStrong": "#c21a1a",
  "errorSoft": "#ffebeb"
} as const;

export const space = {
  "1": 4,
  "2": 8,
  "3": 12,
  "4": 16,
  "5": 20,
  "6": 24,
  "8": 32,
  "10": 40,
  "12": 48,
  "16": 64
} as const;

export const radius = {
  "2xl": 16,
  "3xl": 24,
  "full": 999
} as const;

export const shadow = {
  "sm": "0 1px 2px rgba(9,17,34,0.06)",
  "md": "0 4px 16px rgba(9,17,34,0.06)",
  "lg": "0 12px 32px rgba(9,17,34,0.10)",
  "brand": "0 8px 20px rgba(46,107,230,0.25)",
  "focus": "0 0 0 3px rgba(46,107,230,0.35)"
} as const;

export const typeScale = {
  "display": {
    "fontSize": 48,
    "lineHeight": 56,
    "fontWeight": 900,
    "letterSpacing": -0.96,
    "sample": "Apprends à ton rythme"
  },
  "h1": {
    "fontSize": 36,
    "lineHeight": 44,
    "fontWeight": 700,
    "letterSpacing": -0.36,
    "sample": "Mes cours"
  },
  "h2": {
    "fontSize": 28,
    "lineHeight": 36,
    "fontWeight": 700,
    "letterSpacing": 0,
    "sample": "Mathématiques — Terminale"
  },
  "h3": {
    "fontSize": 22,
    "lineHeight": 30,
    "fontWeight": 500,
    "letterSpacing": 0,
    "sample": "Chapitre 3 : les suites"
  },
  "bodyLg": {
    "fontSize": 18,
    "lineHeight": 28,
    "fontWeight": 400,
    "letterSpacing": 0,
    "sample": "Reprenons ensemble la notion de limite."
  },
  "body": {
    "fontSize": 16,
    "lineHeight": 24,
    "fontWeight": 400,
    "letterSpacing": 0,
    "sample": "Une suite est croissante si chaque terme est supérieur au précédent."
  },
  "bodySm": {
    "fontSize": 14,
    "lineHeight": 20,
    "fontWeight": 400,
    "letterSpacing": 0,
    "sample": "12 exercices · 45 min"
  },
  "caption": {
    "fontSize": 12,
    "lineHeight": 16,
    "fontWeight": 500,
    "letterSpacing": 0.12,
    "sample": "Il y a 2 min"
  },
  "label": {
    "fontSize": 14,
    "lineHeight": 20,
    "fontWeight": 500,
    "letterSpacing": 0,
    "sample": "Commencer l'exercice"
  },
  "overline": {
    "fontSize": 12,
    "lineHeight": 16,
    "fontWeight": 700,
    "letterSpacing": 0.96,
    "sample": "NIVEAU 2"
  }
} as const;

export const subjects = {
  "maths": {
    "id": "maths",
    "name": "Maths",
    "gradient": {
      "colors": [
        "#e95555",
        "#c21a1a",
        "#980b0b"
      ],
      "locations": [
        0,
        0.6,
        1
      ]
    },
    "soft": "#ffebeb",
    "ink": "#c21a1a",
    "bar": "#e62e2e",
    "icon": "calculatrice"
  },
  "francais": {
    "id": "francais",
    "name": "Français",
    "gradient": {
      "colors": [
        "#4d81ea",
        "#1750c4",
        "#0a3b9d"
      ],
      "locations": [
        0,
        0.6,
        1
      ]
    },
    "soft": "#ebf1ff",
    "ink": "#1750c4",
    "bar": "#2e6be6",
    "icon": "livre"
  },
  "histoire-geo": {
    "id": "histoire-geo",
    "name": "Histoire-Géo",
    "gradient": {
      "colors": [
        "#1bc85b",
        "#0c9e42",
        "#03702b"
      ],
      "locations": [
        0,
        0.45,
        1
      ]
    },
    "soft": "#ebfff2",
    "ink": "#03702b",
    "bar": "#0c9e42",
    "icon": "globe"
  },
  "anglais": {
    "id": "anglais",
    "name": "Anglais",
    "gradient": {
      "colors": [
        "#17a5be",
        "#09879d",
        "#026273"
      ],
      "locations": [
        0,
        0.45,
        1
      ]
    },
    "soft": "#ebfcff",
    "ink": "#026273",
    "bar": "#09879d",
    "icon": "langues"
  },
  "svt": {
    "id": "svt",
    "name": "SVT",
    "gradient": {
      "colors": [
        "#a3640d",
        "#6e4204",
        "#3d2400"
      ],
      "locations": [
        0,
        0.65,
        1
      ]
    },
    "soft": "#fff7eb",
    "ink": "#6e4204",
    "bar": "#a3640d",
    "icon": "feuille"
  },
  "physique-chimie": {
    "id": "physique-chimie",
    "name": "Physique-Chimie",
    "gradient": {
      "colors": [
        "#8558ea",
        "#521dc8",
        "#3b0da2"
      ],
      "locations": [
        0,
        0.6,
        1
      ]
    },
    "soft": "#f1ebff",
    "ink": "#521dc8",
    "bar": "#662ee6",
    "icon": "fiole"
  }
} as const;

export const gradientAngle = 160 as const;

export const game = {
  "streak": {
    "background": "#e6992e",
    "text": "#ffffff"
  },
  "level": {
    "background": "#343f55",
    "text": "#ffffff",
    "xp": "#2ee671"
  }
} as const;

export const kpi = {
  "time": {
    "colors": [
      "#2e6be6",
      "#1750c4",
      "#0a3b9d"
    ],
    "locations": [
      0,
      0.55,
      1
    ]
  },
  "sessions": {
    "colors": [
      "#17a5be",
      "#09879d",
      "#026273"
    ],
    "locations": [
      0,
      0.45,
      1
    ]
  },
  "flashcards": {
    "colors": [
      "#8558ea",
      "#521dc8",
      "#3b0da2"
    ],
    "locations": [
      0,
      0.6,
      1
    ]
  },
  "record": {
    "background": "#e6992e",
    "text": "#ffffff"
  },
  "mastery": {
    "colors": [
      "#2e6be6",
      "#1750c4",
      "#3b0da2"
    ],
    "locations": [
      0,
      0.5,
      1
    ]
  }
} as const;

export const voice = {
  "bars": {
    "colors": [
      "#2e6be6",
      "#662ee6"
    ],
    "locations": [
      0,
      1
    ]
  },
  "barWidth": 40,
  "barGap": 20,
  "idleSize": 40
} as const;

export const onColor = {
  "veil": "rgba(255,255,255,0.24)",
  "track": "rgba(255,255,255,0.30)"
} as const;

export const navigation = {
  "height": 72,
  "inset": 20,
  "radius": 24,
  "shadow": "0 12px 32px rgba(9,17,34,0.10)",
  "activeBubble": 52,
  "activeBubbleTutor": 60
} as const;

export const hero = {
  "gradient": {
    "colors": [
      "#2e6be6",
      "#1750c4",
      "#3b0da2"
    ],
    "locations": [
      0,
      0.5,
      1
    ]
  },
  "text": "#ffffff"
} as const;

export const statuses = {
  "acquired": {
    "label": "Acquis",
    "background": "#0c9e42",
    "text": "#ffffff"
  },
  "inProgress": {
    "label": "En cours",
    "background": "#2e6be6",
    "text": "#ffffff"
  },
  "toConsolidate": {
    "label": "À consolider",
    "background": "#e6992e",
    "text": "#ffffff"
  },
  "notStarted": {
    "label": "Pas commencé",
    "background": "#ced4e2",
    "text": "#1c263b"
  },
  "sessionOutcome": {
    "understood": "acquired",
    "progressing": "inProgress",
    "toReview": "toConsolidate"
  }
} as const;

export const settingTiles = {
  "screenTime": {
    "colors": [
      "#e6992e",
      "#e6992e"
    ],
    "locations": [
      0,
      1
    ]
  },
  "night": {
    "colors": [
      "#8558ea",
      "#521dc8",
      "#3b0da2"
    ],
    "locations": [
      0,
      0.6,
      1
    ]
  },
  "voice": {
    "colors": [
      "#4d81ea",
      "#1750c4",
      "#0a3b9d"
    ],
    "locations": [
      0,
      0.6,
      1
    ]
  },
  "camera": {
    "colors": [
      "#17a5be",
      "#09879d",
      "#026273"
    ],
    "locations": [
      0,
      0.45,
      1
    ]
  },
  "visuals": {
    "colors": [
      "#e95555",
      "#c21a1a",
      "#980b0b"
    ],
    "locations": [
      0,
      0.6,
      1
    ]
  },
  "email": {
    "colors": [
      "#1bc85b",
      "#0c9e42",
      "#03702b"
    ],
    "locations": [
      0,
      0.45,
      1
    ]
  },
  "alerts": {
    "colors": [
      "#e6992e",
      "#e6992e"
    ],
    "locations": [
      0,
      1
    ]
  }
} as const;

export const screenBand = {
  "student": {
    "colors": [
      "#2e6be6",
      "#1750c4",
      "#0a3b9d"
    ],
    "locations": [
      0,
      0.55,
      1
    ]
  },
  "violet": {
    "colors": [
      "#662ee6",
      "#521dc8",
      "#3b0da2"
    ],
    "locations": [
      0,
      0.55,
      1
    ]
  },
  "angle": 170,
  "radiusBottom": 32,
  "overlap": 56,
  "titleSize": 30,
  "text": "#ffffff",
  "controlVeil": "rgba(255,255,255,0.16)",
  "segmentActive": {
    "background": "#ffffff",
    "textOnViolet": "#521dc8",
    "textOnStudent": "#1750c4"
  }
} as const;

export const sectionTitle = {
  "fontSize": 22,
  "lineHeight": 30
} as const;

export const goal = {
  "gradient": {
    "colors": [
      "#0c9e42",
      "#03702b"
    ],
    "locations": [
      0,
      1
    ]
  },
  "text": "#ffffff"
} as const;

export const voiceCall = {
  "background": {
    "colors": [
      "#2e6be6",
      "#1750c4",
      "#0a3b9d",
      "#03276e"
    ],
    "locations": [
      0,
      0.42,
      0.78,
      1
    ]
  },
  "angle": 170,
  "glass": "rgba(255,255,255,0.16)",
  "dock": "rgba(255,255,255,0.10)",
  "status": {
    "speaking": {
      "colors": [
        "#1bc85b",
        "#0c9e42",
        "#03702b"
      ],
      "locations": [
        0,
        0.45,
        1
      ]
    },
    "listening": {
      "colors": [
        "#e95555",
        "#c21a1a",
        "#980b0b"
      ],
      "locations": [
        0,
        0.6,
        1
      ]
    },
    "listeningOrange": {
      "colors": [
        "#e9a951",
        "#d08825",
        "#a3640d"
      ],
      "locations": [
        0,
        0.5,
        1
      ]
    },
    "neutral": "rgba(255,255,255,0.16)"
  },
  "avatar": {
    "size": 148,
    "compactSize": 96,
    "hop": 18,
    "compactHop": 14,
    "cycleMs": 420,
    "squash": 0.06,
    "pauseFactor": 0.25,
    "tilt": -8,
    "breathMs": 3200
  },
  "captions": {
    "spoken": "#ffffff",
    "upcoming": "rgba(255,255,255,0.45)",
    "size": 20,
    "lineHeight": 30,
    "compactSize": 16,
    "compactLineHeight": 22
  },
  "hangup": "#e62e2e"
} as const;
