# CUE vs MessagePack vs JSON Benchmark

Browser-based benchmark comparing client-side parsing and deserialization strategies:

- **JSON.parse** — native engine baseline
- **JSON + Zod** — parse + pre-compiled schema validation
- **JSON + Ajv (compiled)** — parse + pre-compiled JSON Schema validation
- **JSON + Ajv (interpret)** — parse + schema compiled per call (fair CUE comparison)
- **MsgPack Decode** — binary format decoding via @msgpack/msgpack
- **MsgPack + Zod** — decode + schema validation
- **CUE Parse (AST)** — full AST construction via cue-ts
- **CUE Deserialize (TS)** — lightweight deserializer, returns plain objects
- **CUE Fast Deserialize** — fused single-pass scanner+deserializer
- **CUE Deserialize (WASM)** — Rust CUE parser compiled to WebAssembly

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/) (v10+)
- [Bun](https://bun.sh/) (for running scripts)
- [cue-ts](https://github.com/llbbl/cue-ts) cloned as a sibling directory

## Setup

1. Clone both repos as siblings:
   ```bash
   cd ~/Web  # or wherever you keep projects
   git clone https://github.com/llbbl/cue-ts.git
   git clone https://github.com/llbbl/cue-msgpack-bench.git
   ```

2. Build cue-ts:
   ```bash
   cd cue-ts
   pnpm install
   pnpm build
   ```

3. If you want WASM benchmarks, build the WASM module too:
   ```bash
   cd cue-ts/wasm
   wasm-pack build --target web --out-dir pkg
   ```

4. Set up the benchmark app:
   ```bash
   cd ../cue-msgpack-bench
   pnpm install
   pnpm link ../cue-ts
   ```

5. Generate msgpack binary files (if not already present):
   ```bash
   bun run ./scripts/generate-msgpack.ts
   ```

6. Start the dev server:
   ```bash
   pnpm dev
   ```

7. Open http://localhost:5173 in your browser

## Usage

1. Select an example from the dropdown (data-only or schema+data)
2. Choose iteration count (100 / 1,000 / 10,000)
3. Click "Run Benchmark"
4. Compare results across all parsing strategies

Schema examples (prefixed with "Schema") include Zod and Ajv validation benchmarks for a fair comparison against CUE's built-in schema validation.

## Examples

| Example | Size | Type |
|---|---|---|
| User Profile API | ~1 KB | Data only |
| Product Listing API | ~7 KB | Data only |
| Dashboard Analytics | ~5 KB | Data only |
| Chat Messages | ~4 KB | Data only |
| E-commerce Orders | ~5 KB | Data only |
| Large Product Catalog | ~264 KB | Data only |
| Large Analytics (365 days) | ~467 KB | Data only |
| User Management API | ~10 KB | Schema + Data |
| App Config | ~3 KB | Schema + Data |

## Adding Examples

Each example needs three files in `src/benchmark/examples/`:
- `name.cue` — CUE text
- `name.json` — equivalent JSON data
- `name.msgpack.ts` — auto-generated via `bun run ./scripts/generate-msgpack.ts`

For schema examples, also add Zod and JSON Schema definitions in `src/benchmark/schemas/`.

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- Biome (linting/formatting)
- [cue-ts](https://github.com/llbbl/cue-ts) (linked locally)
- [@msgpack/msgpack](https://www.npmjs.com/package/@msgpack/msgpack)
- [Zod](https://zod.dev/)
- [Ajv](https://ajv.js.org/)

## License

MIT
