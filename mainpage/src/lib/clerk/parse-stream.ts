export const RAW_RESULTS_START = "__RAW_RESULTS__";
export const RAW_RESULTS_END = "__END_RAW_RESULTS__";

export type StreamChunk = string;

export type StreamParseState = {
  assistantMessage: string;
  queryResults: string;
  firstChunkReceived: boolean;
  rawResultsComplete: boolean;
  buffer: string;
  hasMarkers: boolean;
  chunkCount: number;
};

export const MAX_BUFFER_CHUNKS = 5;

export function createStreamParseState(): StreamParseState {
  return {
    assistantMessage: "",
    queryResults: "",
    firstChunkReceived: false,
    rawResultsComplete: false,
    buffer: "",
    hasMarkers: true,
    chunkCount: 0,
  };
}

export type StreamChunkResult = {
  assistantMessage: string;
  queryResults: string;
  done: boolean;
};

export function processStreamChunk(
  state: StreamParseState,
  chunk: StreamChunk
): StreamChunkResult {
  state.chunkCount++;

  if (!state.firstChunkReceived) {
    state.firstChunkReceived = true;
    if (!chunk.includes(RAW_RESULTS_START)) {
      state.hasMarkers = false;
    }
  }

  if (!state.hasMarkers) {
    state.assistantMessage += chunk;
    return {
      assistantMessage: state.assistantMessage,
      queryResults: "",
      done: false,
    };
  }

  if (!state.rawResultsComplete) {
    state.buffer += chunk;

    if (
      state.chunkCount > MAX_BUFFER_CHUNKS &&
      !state.buffer.includes(RAW_RESULTS_START)
    ) {
      state.hasMarkers = false;
      state.assistantMessage = state.buffer;
      state.buffer = "";
      return {
        assistantMessage: state.assistantMessage,
        queryResults: "",
        done: false,
      };
    }

    if (
      state.buffer.includes(RAW_RESULTS_START) &&
      state.buffer.includes(RAW_RESULTS_END)
    ) {
      try {
        const startIndex =
          state.buffer.indexOf(RAW_RESULTS_START) + RAW_RESULTS_START.length;
        const endIndex = state.buffer.indexOf(RAW_RESULTS_END);
        state.queryResults = state.buffer.substring(startIndex, endIndex);
        state.assistantMessage = state.buffer.substring(
          endIndex + RAW_RESULTS_END.length
        );
        state.buffer = "";
        state.rawResultsComplete = true;
        return {
          assistantMessage: state.assistantMessage,
          queryResults: state.queryResults,
          done: false,
        };
      } catch {
        state.hasMarkers = false;
        state.assistantMessage = state.buffer;
        state.buffer = "";
        return {
          assistantMessage: state.assistantMessage,
          queryResults: "",
          done: false,
        };
      }
    }

    return {
      assistantMessage: "",
      queryResults: "",
      done: false,
    };
  }

  state.assistantMessage += chunk;
  return {
    assistantMessage: state.assistantMessage,
    queryResults: state.queryResults,
    done: false,
  };
}

export function finalizeStreamParse(state: StreamParseState): StreamChunkResult {
  if (!state.rawResultsComplete && state.buffer.length > 0) {
    state.assistantMessage = state.buffer;
    return {
      assistantMessage: state.assistantMessage,
      queryResults: "",
      done: true,
    };
  }
  return {
    assistantMessage: state.assistantMessage,
    queryResults: state.queryResults,
    done: true,
  };
}
