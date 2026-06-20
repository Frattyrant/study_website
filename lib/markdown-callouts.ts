export const CALLOUT_TYPE_LABELS = {
  note: "Note",
  info: "Info",
  tip: "Tip",
  success: "Success",
  warning: "Warning",
  danger: "Danger",
} as const;

export type MarkdownCalloutType = keyof typeof CALLOUT_TYPE_LABELS;

const CALLOUT_ALIASES: Record<string, MarkdownCalloutType> = {
  caution: "warning",
  error: "danger",
  important: "note",
  note: "note",
  info: "info",
  tip: "tip",
  success: "success",
  warning: "warning",
  danger: "danger",
};

const calloutLabelPattern = /^\s*\[!([a-z]+)\]\s*(.*)\s*$/i;

export function parseMarkdownCalloutLabel(value: string):
  | {
      type: MarkdownCalloutType;
      title: string;
    }
  | undefined {
  const match = value.match(calloutLabelPattern);
  if (!match) return undefined;

  const type = CALLOUT_ALIASES[match[1].toLowerCase()];
  if (!type) return undefined;

  return {
    type,
    title: match[2].trim() || CALLOUT_TYPE_LABELS[type],
  };
}

export function getMarkdownCalloutTypes() {
  return Object.keys(CALLOUT_ALIASES);
}
