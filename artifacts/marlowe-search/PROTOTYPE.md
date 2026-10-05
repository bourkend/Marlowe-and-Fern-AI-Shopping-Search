# Marlowe & Fern — working slice

## End-to-end flow
The shopper submits a 3–400-character plain-language request. The server sends the request and the fixed eight-dress catalogue to the managed OpenAI model. It validates returned product IDs, joins them to catalogue-owned facts, and returns ranked picks with a short explanation. The shopper can refine the query, inspect a product, or use ordinary catalogue browsing/filtering instead.

No products, prices, materials or availability are created by the model. The imagery is original illustrative catalogue artwork, not product photography.

## Three test cases

| Case | Query | Expected outcome |
|---|---|---|
| Colour compatibility | `a dress that'll go with green shoes` | Multiple catalogue dresses, with explanations about coordination rather than blindly matching the word “green”. Non-green choices are valid; shade coordination remains subjective. |
| No strong match | `a silver sequin maxi dress under £30` | A “Closest picks” notice and alternative labels on every result. Explanations disclose missing silver/sequins or the exceeded budget; no invented product. |
| Occasion plus budget | `summer wedding, under £120` | Wedding-appropriate dresses strictly below £120; explanations retain both occasion and budget. Avoid ivory for wedding guests unless requested. |

The scenarios are available in the UI. Rankings may differ between requests, so evaluate the constraints and explanations rather than expecting a single fixed order.

## Known limitations
- Eight fictional products, one brand and dresses only. Prices are illustrative GBP values; there is no inventory feed.
- AI can misunderstand an occasion, budget or ambiguous phrasing, and can rank inconsistently. Product-ID validation prevents invented products but does not prove a fit explanation is correct.
- Colour harmony depends on the exact shade, material, lighting and personal taste. There is no image input.
- Simple explicit ceilings (“under”, “below”, “up to”, “at most”) are additionally enforced on matched results by the server. Complex or implied budgets still depend on model interpretation.
- No checkout, payments, accounts, saved history or cross-session personalisation.
- AI requests require network availability, take several seconds and use Replit credits. Failures appear as errors; catalogue browsing remains available.
- The server limits concurrent searches, but this is not hardened public-store abuse prevention. Memory-based limits reset when the process restarts.
- The three cases are prototype acceptance scenarios, not evidence of production recommendation quality.
