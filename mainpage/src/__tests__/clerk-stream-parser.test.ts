import { describe, it, expect } from "vitest";
import {
  RAW_RESULTS_START,
  RAW_RESULTS_END,
  createStreamParseState,
  processStreamChunk,
  finalizeStreamParse,
} from "@/lib/clerk/parse-stream";

describe("processStreamChunk", () => {
  it("streams directly when first chunk has no marker", () => {
    const state = createStreamParseState();
    const r = processStreamChunk(state, "Hello world");
    expect(state.hasMarkers).toBe(false);
    expect(r.assistantMessage).toBe("Hello world");
  });

  it("extracts queryResults from a single complete payload", () => {
    const state = createStreamParseState();
    const payload = `${RAW_RESULTS_START}{"rows":[],"summary":{"type":"count","value":5}}${RAW_RESULTS_END}Here is your answer.`;
    const r = processStreamChunk(state, payload);
    expect(r.queryResults).toBe('{"rows":[],"summary":{"type":"count","value":5}}');
    expect(r.assistantMessage).toBe("Here is your answer.");
    expect(state.rawResultsComplete).toBe(true);
  });

  it("buffers until both markers are present across chunks", () => {
    const state = createStreamParseState();
    processStreamChunk(state, `${RAW_RESULTS_START}{"rows":[],"summary":{"type":"list","totalFetched":3}}`);
    const r = processStreamChunk(state, `${RAW_RESULTS_END}Response text.`);
    expect(r.queryResults).toBe('{"rows":[],"summary":{"type":"list","totalFetched":3}}');
    expect(r.assistantMessage).toBe("Response text.");
  });

  it("continues streaming the assistant message after markers", () => {
    const state = createStreamParseState();
    processStreamChunk(state, `${RAW_RESULTS_START}{}${RAW_RESULTS_END}Once upon a time`);
    const r = processStreamChunk(state, " in Madrid");
    expect(r.assistantMessage).toBe("Once upon a time in Madrid");
  });

  it("falls back to direct streaming after MAX_BUFFER_CHUNKS without markers", () => {
    const state = createStreamParseState();
    for (let i = 0; i < 5; i++) {
      processStreamChunk(state, "no markers here, chunk " + i);
    }
    const r = processStreamChunk(state, "yet");
    expect(state.hasMarkers).toBe(false);
    expect(r.assistantMessage).toContain("no markers here, chunk");
    expect(r.assistantMessage).toContain("yet");
  });
});

describe("finalizeStreamParse", () => {
  it("uses buffer content when stream ends while still buffering", () => {
    const state = createStreamParseState();
    processStreamChunk(state, "Just some text, no markers at all");
    const r = finalizeStreamParse(state);
    expect(r.assistantMessage).toContain("Just some text");
  });

  it("returns the parsed assistant message + queryResults when complete", () => {
    const state = createStreamParseState();
    processStreamChunk(state, `${RAW_RESULTS_START}{"a":1}${RAW_RESULTS_END}Final.`);
    const r = finalizeStreamParse(state);
    expect(r.assistantMessage).toBe("Final.");
    expect(r.queryResults).toBe('{"a":1}');
  });
});

describe("createStreamParseState", () => {
  it("returns a fresh state with sensible defaults", () => {
    const s = createStreamParseState();
    expect(s.assistantMessage).toBe("");
    expect(s.queryResults).toBe("");
    expect(s.firstChunkReceived).toBe(false);
    expect(s.rawResultsComplete).toBe(false);
    expect(s.buffer).toBe("");
    expect(s.hasMarkers).toBe(true);
    expect(s.chunkCount).toBe(0);
  });
});
