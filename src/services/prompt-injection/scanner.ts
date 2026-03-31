export interface InjectionMatch {
  pattern: string;
  matched: string;
  category:
    | "score_inflation"
    | "instruction_override"
    | "ranking_manipulation"
    | "system_prompt_leak"
    | "role_hijack";
}

export interface ScanResult {
  isClean: boolean;
  riskLevel: "none" | "low" | "medium" | "high";
  matches: InjectionMatch[];
}

const PATTERNS: {
  regex: RegExp;
  pattern: string;
  category: InjectionMatch["category"];
}[] = [
  // Score inflation
  {
    regex:
      /(?:rank|rate|score|grade|match)\s+(?:this|the|my)\s+(?:resume|candidate|application)\s+(?:with|at|as)?\s*(?:a\s+)?(?:\d{2,3}\s*%|(?:perfect|highest|top|excellent|outstanding))/i,
    pattern: "Score inflation request",
    category: "score_inflation",
  },
  {
    regex:
      /(?:give|assign|set)\s+(?:this|the|my|a)\s+(?:score|rating|match|rank)\s+(?:of|to|at)\s*\d{2,3}/i,
    pattern: "Direct score assignment",
    category: "score_inflation",
  },
  {
    regex:
      /(?:must|should|always)\s+(?:be\s+)?(?:scored?|rated?|ranked?)\s+(?:highly|high|(?:at\s+)?(?:the\s+)?top|first|number\s+one|#\s*1)/i,
    pattern: "Forced high ranking",
    category: "score_inflation",
  },
  {
    regex:
      /(?:perfect|ideal|best|strongest|top)\s+(?:candidate|match|fit)\s+for\s+(?:this|the|any)/i,
    pattern: "Self-declared perfect match",
    category: "score_inflation",
  },
  {
    regex: /(?:100|99|98|97|96|95)\s*%?\s*(?:match|score|fit|compatibility)/i,
    pattern: "Inflated percentage claim",
    category: "score_inflation",
  },

  // Instruction override
  {
    regex:
      /ignore\s+(?:all\s+)?(?:previous|prior|above|other|earlier)\s+(?:instructions?|prompts?|rules?|guidelines?|context)/i,
    pattern: "Instruction override attempt",
    category: "instruction_override",
  },
  {
    regex:
      /disregard\s+(?:all\s+)?(?:previous|prior|the\s+)?(?:instructions?|prompts?|rules?|guidelines?)/i,
    pattern: "Disregard instructions",
    category: "instruction_override",
  },
  {
    regex:
      /(?:forget|override|replace|overwrite)\s+(?:all\s+)?(?:your|the|previous)\s+(?:instructions?|prompts?|rules?|programming)/i,
    pattern: "Override instructions",
    category: "instruction_override",
  },
  {
    regex:
      /(?:do\s+not|don'?t|never)\s+(?:follow|use|apply|consider)\s+(?:the\s+)?(?:original|previous|default|standard)\s+(?:instructions?|criteria|rules?)/i,
    pattern: "Instruction negation",
    category: "instruction_override",
  },
  {
    regex: /new\s+(?:instructions?|rules?|guidelines?)[\s:]+/i,
    pattern: "New instruction injection",
    category: "instruction_override",
  },

  // Ranking manipulation
  {
    regex:
      /place\s+(?:this|me|the\s+candidate)\s+(?:as|at|in)\s+(?:the\s+)?(?:top|first|number\s+one|#\s*1|highest)/i,
    pattern: "Ranking position request",
    category: "ranking_manipulation",
  },
  {
    regex:
      /(?:prioritize|prefer|favor|select|choose|pick)\s+(?:this|my)\s+(?:resume|application|candidate|profile)\s+(?:over|above|before)/i,
    pattern: "Preferential treatment request",
    category: "ranking_manipulation",
  },
  {
    regex:
      /(?:this|my)\s+(?:resume|candidate|application)\s+(?:is|should\s+be)\s+(?:the\s+)?(?:best|most\s+qualified|strongest|top)/i,
    pattern: "Self-promotion injection",
    category: "ranking_manipulation",
  },
  {
    regex:
      /(?:automatically|always|unconditionally)\s+(?:approve|accept|advance|shortlist|recommend)/i,
    pattern: "Automatic approval request",
    category: "ranking_manipulation",
  },

  // System prompt leak attempts
  {
    regex:
      /(?:reveal|show|display|output|print|repeat|echo)\s+(?:your|the|system)\s+(?:system\s+)?(?:prompt|instructions?|rules?|programming)/i,
    pattern: "System prompt extraction",
    category: "system_prompt_leak",
  },
  {
    regex:
      /what\s+(?:are|is)\s+your\s+(?:system\s+)?(?:instructions?|prompt|programming|rules?)/i,
    pattern: "System prompt query",
    category: "system_prompt_leak",
  },

  // Role hijacking
  {
    regex: /you\s+are\s+(?:now|no\s+longer)\s+(?:a|an|the)\s+/i,
    pattern: "Role reassignment attempt",
    category: "role_hijack",
  },
  {
    regex:
      /(?:act|behave|respond|function)\s+as\s+(?:if\s+)?(?:you\s+(?:are|were)\s+)?(?:a|an|the)\s+(?!expert\s+(?:resume|hiring|interview))/i,
    pattern: "Role hijack attempt",
    category: "role_hijack",
  },
  {
    regex:
      /(?:switch|change)\s+(?:to|into)\s+(?:a\s+)?(?:different|new)\s+(?:mode|role|persona)/i,
    pattern: "Mode switch attempt",
    category: "role_hijack",
  },
];

export function scanForInjections(text: string): ScanResult {
  const matches: InjectionMatch[] = [];

  for (const { regex, pattern, category } of PATTERNS) {
    const match = text.match(regex);
    if (match) {
      matches.push({
        pattern,
        matched: match[0].trim(),
        category,
      });
    }
  }

  let riskLevel: ScanResult["riskLevel"] = "none";
  if (
    matches.length >= 3 ||
    matches.some(
      (m) =>
        m.category === "instruction_override" || m.category === "role_hijack"
    )
  ) {
    riskLevel = "high";
  } else if (matches.length === 2) {
    riskLevel = "medium";
  } else if (matches.length === 1) {
    riskLevel = "low";
  }

  return {
    isClean: matches.length === 0,
    riskLevel,
    matches,
  };
}
