// Mirrors A4backend/app/Support/TextCase.php — the backend mutators are the
// source of truth (every entry point gets normalized regardless of what
// wrote it), this just lets staff see the corrected casing immediately on
// blur instead of waiting on a round trip to the API.

// Title Case for proper nouns — names, places, family/folder names.
export function toTitleCase(value) {
  if (!value || !value.trim()) return value;
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/(^|[\s-])([a-z])/g, (_, sep, letter) => sep + letter.toUpperCase());
}

// Sentence case for free-text clinical narrative — only the first letter of
// the string and the first letter after ". "/"! "/"? " get capitalized;
// everything else is left alone so abbreviations (BP, HIV, IV) survive.
export function toSentenceCase(value) {
  if (!value || !value.trim()) return value;
  const collapsed = value.trim().replace(/\s+/g, " ");
  return collapsed.replace(
    /(^|[.!?]\s+)([a-z])/g,
    (_, sep, letter) => sep + letter.toUpperCase()
  );
}
