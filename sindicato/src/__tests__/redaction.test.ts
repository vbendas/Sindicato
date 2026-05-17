import { describe, it, expect } from "vitest";
import { redactName, redactEmail } from "@/lib/utils/redaction";

describe("redactName", () => {
  it("redacts a standard name", () => {
    expect(redactName("Victor")).toBe("Vic*****");
  });

  it("redacts a 3-char name", () => {
    expect(redactName("Vic")).toBe("Vic*****");
  });

  it("returns *** for 2-char name", () => {
    expect(redactName("Al")).toBe("***");
  });

  it("returns *** for empty string", () => {
    expect(redactName("")).toBe("***");
  });

  it("returns *** for single char", () => {
    expect(redactName("A")).toBe("***");
  });

  it("handles unicode names", () => {
    expect(redactName("José")).toBe("Jos*****");
  });

  it("handles long names", () => {
    expect(redactName("Alexander")).toBe("Ale*****");
  });

  it("always produces exactly 8 chars for names >= 3 chars", () => {
    const result = redactName("Catherine");
    expect(result.length).toBe(8);
  });
});

describe("redactEmail", () => {
  it("redacts a standard gmail address", () => {
    expect(redactEmail("test@gmail.com")).toBe("t*****@g***.com");
  });

  it("redacts a multi-part TLD", () => {
    expect(redactEmail("user@sub.domain.co.uk")).toBe("u*****@s***.domain.co.uk");
  });

  it("returns empty string for empty input", () => {
    expect(redactEmail("")).toBe("");
  });

  it("returns empty string for input with no @", () => {
    expect(redactEmail("notanemail")).toBe("");
  });

  it("returns empty string for input with @ but no domain", () => {
    expect(redactEmail("test@")).toBe("");
  });

  it("handles domain with no TLD dots", () => {
    const result = redactEmail("test@localhost");
    expect(result).toBe("t*****@l***.");
  });

  it("handles single char local part", () => {
    expect(redactEmail("a@b.com")).toBe("a*****@b***.com");
  });

  it("handles two-part TLD like .io", () => {
    expect(redactEmail("dev@startup.io")).toBe("d*****@s***.io");
  });
});
