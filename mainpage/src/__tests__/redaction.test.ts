import { describe, it, expect } from "vitest";
import { redactName, redactEmail } from "@/lib/utils/redaction";

describe("redactName", () => {
  it("redacts a standard name", () => {
    expect(redactName("Victor")).toBe("V*****");
  });

  it("redacts a 3-char name", () => {
    expect(redactName("Vic")).toBe("V*****");
  });

  it("redacts a 2-char name", () => {
    expect(redactName("Al")).toBe("A*****");
  });

  it("returns *** for empty string", () => {
    expect(redactName("")).toBe("***");
  });

  it("redacts a single char", () => {
    expect(redactName("A")).toBe("A*****");
  });

  it("handles unicode names", () => {
    expect(redactName("José")).toBe("J*****");
  });

  it("handles long names", () => {
    expect(redactName("Alexander")).toBe("A*****");
  });

  it("always produces exactly 6 chars for non-empty names", () => {
    const result = redactName("Catherine");
    expect(result.length).toBe(6);
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
