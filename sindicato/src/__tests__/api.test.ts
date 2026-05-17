import { describe, it, expect } from "vitest";
import { success, error } from "@/lib/utils/api";

describe("success", () => {
  it("returns 200 with ok: true and data", () => {
    const res = success({ id: 1 });
    const body = res.json();

    expect(res.status).toBe(200);
    return body.then((data) => {
      expect(data).toEqual({ ok: true, data: { id: 1 } });
    });
  });

  it("returns custom status code", () => {
    const res = success({ created: true }, 201);
    expect(res.status).toBe(201);
  });

  it("returns null data when null is passed", () => {
    const res = success(null);
    return res.json().then((data) => {
      expect(data).toEqual({ ok: true, data: null });
    });
  });
});

describe("error", () => {
  it("returns 400 by default with error message", () => {
    const res = error("Bad request");
    expect(res.status).toBe(400);
    return res.json().then((data) => {
      expect(data.ok).toBe(false);
      expect(data.error).toBe("Bad request");
      expect(data.details).toBeUndefined();
    });
  });

  it("returns custom status code", () => {
    const res = error("Not found", 404);
    expect(res.status).toBe(404);
  });

  it("includes details when provided", () => {
    const res = error("Validation failed", 400, { fields: ["email"] });
    return res.json().then((data) => {
      expect(data.ok).toBe(false);
      expect(data.error).toBe("Validation failed");
      expect(data.details).toEqual({ fields: ["email"] });
    });
  });

  it("omits details when undefined", () => {
    const res = error("Error", 500);
    return res.json().then((data) => {
      expect(data).not.toHaveProperty("details");
    });
  });
});
