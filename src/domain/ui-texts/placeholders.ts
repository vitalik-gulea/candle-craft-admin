const PLACEHOLDER_PATTERN = /\{[^{}]+\}/g

function extract(text: string): string[] {
  return [...new Set(text.match(PLACEHOLDER_PATTERN) ?? [])].sort()
}

export function isValidUiTextValue(text: string, reference: string): boolean {
  return text.trim() !== '' && hasSamePlaceholders(text, reference)
}

export function hasSamePlaceholders(text: string, reference: string): boolean {
  const a = extract(text)
  const b = extract(reference)
  return a.length === b.length && a.every((item, index) => item === b[index])
}
