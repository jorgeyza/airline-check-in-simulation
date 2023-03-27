export function capitalLetterToNumber(letter: string): number {
  if (letter.length !== 1 || !/^[A-Z]$/.test(letter)) {
    throw new Error("Input must be a single uppercase letter");
  }

  return letter.charCodeAt(0) - 64;
}
