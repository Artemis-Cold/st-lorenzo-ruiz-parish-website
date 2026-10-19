/** Format field labels, not whole sentences, for readable validation messages. */
export function validationLabel(label: string): string {
  return label
    .replace(/_/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(
      /(^|\s)([a-z])/g,
      (_, space: string, letter: string) => space + letter.toUpperCase(),
    );
}
