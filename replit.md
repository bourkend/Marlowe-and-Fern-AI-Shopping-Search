# Marlowe & Fern Search

A working prototype that turns plain-language shopping requests into ranked dresses from a fixed fictional catalogue, with reasons and clearly labelled closest alternatives.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/marlowe-search run dev` — web app (use its managed workflow)
- `node scripts/src/check-search-scenarios.mjs` — three live API acceptance scenarios; uses managed AI credits
- Required for search: managed `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY`. Provision using the AI integration, never print their values.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Catalogue: fixed TypeScript data; no database is needed by this slice
- AI: Replit-managed OpenAI for intent, ranking and explanations
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/marlowe-search` — shopper UI and prototype notes
- `artifacts/api-server/src/lib/catalogue.ts` — catalogue-owned product facts
- `artifacts/api-server/src/lib/marlowe-search.ts` — AI query and result validation
- `lib/api-spec/openapi.yaml` — API contract; regenerate after changes
- `artifacts/marlowe-search/PROTOTYPE.md` — three acceptance scenarios and limitations

## Architecture decisions

- Keep the catalogue fixed and searches stateless. **Why:** the approved slice explicitly excludes live inventory and cross-session personalisation.
- Model output supplies only ranking and fit explanations; product facts are joined from the catalogue. **Why:** invented items are an identified risk in the framing brief.
- Product visuals are illustrations, not photography. **Why:** this is a fictional catalogue and the UI must not imply real products or availability.

## Product

- Plain-language search, ranked explanations, closest-pick labels, catalogue filters and product detail dialogs.
- Three reproducible examples: green-shoe colour compatibility; an unavailable silver sequin maxi under £30; summer wedding under £120.
- Prototype notes are available at `/prototype`.

## User preferences

- Approved deliverable: “End-to-end working slice, three test cases, and known limitations.”
- Scope from the brief: one fictional brand and one product category; no checkout, payments, live store/inventory, image input, accounts or cross-session personalisation.

## Gotchas

- AI errors must be explicit; ordinary catalogue browsing remains available.
- Never claim the three scenarios establish production-quality recommendation accuracy.
- Managed workflows supply `PORT` and `BASE_PATH`; do not start duplicate servers.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
