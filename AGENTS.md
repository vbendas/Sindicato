# Project Agent Rules

## graphify

This project has graphify installed as an OpenCode skill at `.opencode/skills/graphify/`.

When the user invokes `/graphify` or asks to map/analyze the codebase architecture, load the graphify skill and follow its pipeline.

Key commands:
- `/graphify` - build full knowledge graph from current directory
- `/graphify <path>` - build graph from specific path
- `/graphify --update` - incremental re-extraction of changed files
- `/graphify query "<question>"` - query the graph
- `/graphify path "A" "B"` - shortest path between concepts
- `/graphify explain "Node"` - explain a node's connections

Graph outputs are in `graphify-out/` (gitignored).
