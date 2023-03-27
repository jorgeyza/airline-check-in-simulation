import { describe, expect, it } from "vitest";

import { capitalLetterToNumber } from "~/utils/capitalLetterToNumber";

describe("capitalLetterToNumber", () => {
  it("should return 1 for A", () => {
    expect(capitalLetterToNumber("A")).toBe(1);
  });

  it("should return 2 for B", () => {
    expect(capitalLetterToNumber("B")).toBe(2);
  });

  it("should return 26 for Z", () => {
    expect(capitalLetterToNumber("Z")).toBe(26);
  });

  it("should throw an error if input is not a single uppercase letter", () => {
    expect(() => capitalLetterToNumber("abc")).toThrow();
    expect(() => capitalLetterToNumber("")).toThrow();
    expect(() => capitalLetterToNumber("1")).toThrow();
    expect(() => capitalLetterToNumber("a")).toThrow();
    expect(() => capitalLetterToNumber("A1")).toThrow();
  });
});
