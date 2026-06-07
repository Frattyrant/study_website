const crypto = require("node:crypto");

const PUBLIC_SAFE_MARKER = "<!-- public-safe -->";

const secretRules = [
  { id: "private-key", pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/ },
  {
    id: "github-token",
    pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/,
  },
  { id: "aws-access-key", pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: "slack-token", pattern: /\bxox[baprs]-[A-Za-z0-9-]{16,}\b/ },
  { id: "google-api-key", pattern: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { id: "openai-api-key", pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/ },
  {
    id: "database-credentials",
    pattern:
      /\b(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis):\/\/([^:\s/@]+):([^@\s/]+)@/i,
    candidateGroup: 2,
  },
  {
    id: "authorization-header",
    pattern: /\bAuthorization\s*[:=]\s*(?:Bearer|Basic)\s+([^\s"'`]+)/i,
    candidateGroup: 1,
  },
  {
    id: "password-assignment",
    pattern: /\b(?:password|passwd|pwd)\s*[:=]\s*["']?([^\s"'`,;]+)/i,
    candidateGroup: 1,
  },
];

function hashPublicSafeLine(line) {
  return crypto.createHash("sha256").update(line).digest("hex");
}

function isPlaceholder(value = "") {
  if (/^\$\{[A-Z0-9_]+\}$/i.test(value)) return true;
  const normalized = value.replace(/[<>{}[\]$"'`]/g, "").toLowerCase();
  return (
    !normalized ||
    normalized.includes("redacted") ||
    normalized.includes("example") ||
    normalized.includes("placeholder") ||
    normalized.includes("your-token") ||
    normalized.includes("your_token") ||
    normalized.includes("your-password") ||
    normalized.includes("your_password") ||
    normalized.includes("changeme") ||
    normalized.includes("env_var") ||
    normalized.includes("password")
  );
}

function sanitizeAutomaticRisks(value) {
  return value
    .replace(/\b[A-Z]:\\Users\\[^\\\r\n]+/gi, (match) => {
      const parts = match.split("\\");
      return ["<user-home>", ...parts.slice(3)].join("\\");
    })
    .replace(/\/home\/[^/\s"'`]+/g, "<user-home>")
    .replace(
      /https?:\/\/(?:127\.0\.0\.1|localhost|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}):(?:7897|9097)\b/gi,
      "http://<local-proxy>",
    )
    .replace(
      /\b(?:127\.0\.0\.1|localhost|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}):(?:7897|9097)\b/gi,
      "<local-address>",
    )
    .replace(/\b((?:HTTP|HTTPS|NO)_PROXY=)([^\s"`]+)/gi, "$1<redacted>")
    .replace(/\b((?:http|https)_proxy=)([^\s"`]+)/gi, "$1<redacted>")
    .replace(/\bpassword\s+123456\b/gi, "password <redacted>");
}

function findSecretFindings(value, { allowedLineHashes = new Set() } = {}) {
  const findings = [];
  const lines = value.replace(/\r\n/g, "\n").split("\n");

  for (const [index, line] of lines.entries()) {
    if (allowedLineHashes.has(hashPublicSafeLine(line))) continue;
    for (const rule of secretRules) {
      const match = line.match(rule.pattern);
      if (!match) continue;
      const candidate = rule.candidateGroup ? match[rule.candidateGroup] : "";
      if (rule.candidateGroup && isPlaceholder(candidate)) continue;
      findings.push({ rule: rule.id, line: index + 1 });
    }
  }

  return findings;
}

function preparePublicContent(value, sourcePath) {
  const allowedLineHashes = new Set();
  const lines = sanitizeAutomaticRisks(value)
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => {
      if (!line.includes(PUBLIC_SAFE_MARKER)) return line;
      const cleaned = line.replace(PUBLIC_SAFE_MARKER, "").trimEnd();
      allowedLineHashes.add(hashPublicSafeLine(cleaned));
      return cleaned;
    });
  const content = lines.join("\n");
  const findings = findSecretFindings(content, { allowedLineHashes });

  if (findings.length > 0) {
    const details = findings
      .map((finding) => `${sourcePath}:${finding.line} [${finding.rule}]`)
      .join("\n");
    throw new Error(`Sensitive content blocked:\n${details}`);
  }

  return { content, allowedLineHashes: [...allowedLineHashes] };
}

module.exports = {
  findSecretFindings,
  hashPublicSafeLine,
  preparePublicContent,
  sanitizeAutomaticRisks,
};
