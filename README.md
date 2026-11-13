# Marlowe & Fern Search

An AI-assisted shopping-search prototype that turns a shopper's plain-language request into ranked dresses from a fixed Marlowe & Fern catalogue, with a short reason for each recommendation.

## What a shopper can do

A shopper can:

- Enter a request in their own words, such as "a dress that'll go with green shoes", "summer wedding, under £120" or "garden party in July, about a hundred quid, nothing white".
- See how the request was understood, shown as editable chips under **What I understood**, plus any rules applied (for example, "Your approximate £100 budget allows up to 10% extra: an effective maximum of £110").
- See a small ranked set of catalogue dresses, each with the product facts **from the catalogue** shown separately from a short **AI-written** explanation of why it might fit.
- See clearly labelled **Closest picks** when nothing fully matches, with explanations of where each alternative falls short.
- See a warning on any card where the AI explanation may not match the product facts.
- Reject an individual dress with **Not for me** (with an optional reason) or ask for **Show different dresses**.
- Edit or remove a chip to rerun the search without retyping, or open a product's details.
- Use ordinary keyword, colour and maximum-price filters instead of AI search.

Empty searches are blocked with guidance, and requests for things the catalogue doesn't contain (for example, men's suits) get a clear "dresses only" message instead of forced recommendations.

The flow ends at the product result. It does not include purchasing or checkout.

## Opening the prototype

1. Open Marlowe & Fern Search in this project's app preview.
2. If the app is stopped, start the existing workflows:
   - `artifacts/api-server: API Server`
   - `artifacts/marlowe-search: web`
3. The Shop page is at `/`. Enter a request and select **Find dresses**, or select one of the example requests.
4. Select **Prototype** in the navigation to open `/prototype`, which describes the test cases and limitations.

These are instructions for the project preview, not a claim that the app has been published at a public URL.

## How the AI works

| | |
|---|---|
| **Task** | Interprets a shopper's plain-language request and ranks dresses from the Marlowe & Fern catalogue |
| **Input** | The shopper's free-text request, plus the fixed eight-dress catalogue |
| **Output** | A structured reading of the request (shown as chips), a ranked set of dresses labelled as matches or closest picks, and a short fit explanation for each |
| **Value** | Shoppers can describe an occasion, colour pairing or budget in everyday language instead of guessing keywords or setting filters |

**How the current AI behaviour is produced.** The search uses working AI, not simulated or hardcoded responses. The server sends the shopper's request and the fixed catalogue to OpenAI through Replit AI Integrations. The model first returns the request as structured fields (occasion, budget, whether the budget is approximate, colours wanted or excluded, styles excluded, length, material, season), then ranks products and writes fit explanations.

The server then does the following in code, independently of the model:

- validates returned product IDs and supplies all product names, prices and details from the catalogue, not from the model;
- enforces budgets on results labelled as matches, including wording such as "under", "no more than", "max", numbers written in words, "quid", ranges, and approximate budgets ("about £100" allows up to 10% extra, which is disclosed to the shopper);
- enforces colour and style exclusions, treating close shades as the excluded colour (ivory, cream and off-white count as white) and disclosing this;
- compares each AI explanation against the product's catalogue facts and shows a warning when they appear to conflict.

If the AI request fails, the app displays an error rather than pretending a result was generated; catalogue browsing remains available.

**What is functional, simulated or not implemented**

| Component | Status |
|---|---|
| Request interpretation, ranking and fit explanations | Functional (live AI) |
| Product ID validation, budget and exclusion enforcement | Functional (server code) |
| Explanation vs catalogue mismatch warning | Functional (rule-based; currently produces false positives, see Evaluation) |
| Catalogue: eight dresses, illustrative GBP prices (£65–£165), dress illustrations | Simulated: fictional sample data |
| Stock, sizing, checkout, accounts, saved history | Not implemented |

## What changed in this revision

1. **Search that generalises beyond the demo examples.** The model's instructions previously covered the three example requests directly. Those example-specific instructions were removed and replaced with general rules. Requests are now parsed into structured fields, and budget and exclusion rules are enforced in server code rather than left to the model.
2. **Visible interpretation and more user control.** Shoppers can see how their request was understood ("What I understood" chips and disclosures), edit or remove those constraints, reject individual dresses, and request a different set. Catalogue facts are now visually separated from AI explanations, with a warning when the two may conflict.
3. **Visual refinement of the header.** The rust/red accent was replaced with a softer palette, with more colour in the hero area, while keeping the existing serif headline font.

## Response to peer feedback

| Feedback or observed issue | Decision | What changed, or why it was deferred |
|---|---|---|
| The three demo cases are explicitly covered by the model's instructions, so reliability on unfamiliar requests is unknown. Test new occasions, exclusions and budget wording. | Acted on | Removed example-specific instructions, added structured request parsing, extended server-side budget enforcement to more wordings, and enforced colour and style exclusions in code. Tested with requests that were never in the instructions (see Evaluation). The results were mixed, and this is reported below. |
| Validated product details don't guarantee correct recommendation reasoning. | Acted on | Added a check that compares each AI explanation against the catalogue and shows a warning on conflicts (see Risk). |
| Explanations that link price, material and style to the request, and the honest closest-picks labelling, were helpful. | Kept | Preserved, and made easier to check by separating catalogue facts from AI explanations. |
| The header could be more elegant and colourful; the red and the font don't suit the topic. | Acted on | Replaced the rust/red accent with a softer palette, added a subtle gradient and more colour to the hero area, and restyled the example requests to match. |
| More colour throughout. | Adapted | Colour was added to the header, buttons and chips, but result cards stay mostly neutral so the dress illustrations stand out and text stays readable. |

## Evaluation

Tests were run through the app's live search API using `scripts/src/check-search-scenarios.mjs`. The raw output is saved in [`test_results.md`](test_results.md). On-screen behaviour (button states, chips, warnings) was checked separately in the app preview. The catalogue is fictional: eight dresses priced £65–£165. Success criteria were set before running the tests.

| Case | Input or action | Expected result / success criterion | Actual result | Pass, partial, or fail | Implication or next step |
|---|---|---|---|---|---|
| Typical 1 | "summer wedding, under £120" | All matches strictly under £120 and listed for summer weddings; budget and occasion parsed correctly; no white/ivory dress | Parsed as summer wedding, under £120. Three matches: Celeste Satin Slip (£115), Sage Gathered Midi (£105), Iris Floral Wrap (£89). Explanations accurate, no warnings. Run twice with the same three dresses; only the order changed. | Pass | Stable on a familiar request. |
| Typical 2 | "smart dress for a work dinner, nothing too formal, max £100" | Matches at or under £100; smart-casual rather than evening wear; explanations mention the work setting | "Nothing too formal" was parsed as a hard style exclusion ("formal") that no product's data can confirm, so nothing qualified as a match. Two closest picks: Rowan Cotton Shirt Dress (£75), a strong fit, and Celeste Satin Slip (£115), which is over budget and more of a cocktail dress. Both explanations only said the catalogue "cannot verify the exclusion of formal" and never explained why the dress might suit a work dinner. Suitable under-budget options (e.g. Iris Floral Wrap, £89) were not shown. | Fail | The budget held, but the strict rules made the result less useful and harder to understand. Subjective wording like "not too formal" should be treated as a preference for the AI to weigh, not a hard filter. |
| Challenge | "garden party in July, about a hundred quid, nothing white" (run 3 times) | "A hundred quid" read as roughly £100 and disclosed; ivory/cream treated as white; garden-party appropriate; honest labelling if few dresses fit | All three runs parsed the budget as approximately £100 (up to £110) and excluded white, ivory and cream, with both rules shown to the shopper. Iris Floral Wrap was excluded because its print contains cream, leaving only Sage Gathered Midi (£105). The label and warning varied: runs 1 and 3 called it a match with a mismatch warning; run 2 parsed the season as "July", could not confirm that from the catalogue, and called the same dress a closest pick. | Partial | Parsing and disclosure are consistent and transparent. Labelling and warnings are not, so the same request gives the shopper different signals. Excluding a pink floral print for containing cream may be stricter than most shoppers intend. |
| Invalid or empty (a) | Empty search | Search blocked with clear guidance | The API rejected it: "Please describe what you are looking for in 3–400 characters." In the app: [describe what you saw, e.g. "Find dresses" was disabled and example requests were shown]. | Pass | Empty input is handled at both the server and the interface. |
| Invalid or empty (b) | "men's suit under £200" | Clear dresses-only message, no forced recommendations | "This catalogue contains dresses only. We cannot search other product categories." No products returned. | Pass | Unsupported requests are explained at the point of need rather than padded with dresses. |
| Risk | "100% silk dress under £40" | No dress described as silk unless the catalogue says so; closest picks labelled with the price gap disclosed; a warning only if an explanation contradicts the facts | One closest pick: Celeste Satin Slip (£115). The explanation was accurate: it disclosed the price gap and said the material is satin, not 100% silk. However, the mismatch warning still appeared, a false positive (most likely because the checker saw the word "silk" without recognising "not"). | Partial | The AI behaved honestly, but the safeguard flagged a correct explanation. False alarms risk teaching shoppers to ignore the warning. |
| Regression | "a dress that'll go with green shoes" | Coordinating colour suggestions with sensible explanations | Four matches with reasonable colour explanations. "What I understood" was completely empty (no field captures "green shoes"), so the chips show nothing for this kind of request. Across three runs (the original build and two after this revision), the set of dresses changed each time, and one run included a green dress described as "tonal". | Partial | Recommendations are plausible but vary, and the new interpretation feature does not cover colour-pairing requests. |
| Regression | "a silver sequin maxi dress under £30" | Honest closest picks, no invented products | Closest picks: Amelia Pleated Maxi (£135) and Nocturne Velvet Maxi (£165), each disclosing the price and colour gap. No warnings. "Sequin" was not captured, and the explanations don't mention that neither dress has sequins. | Pass | Still honest; explanations could name every unmet requirement. |

### Repeat test (live model)

The challenge case was run three times. The budget interpretation, colour exclusions, disclosures and dress returned were identical every time, but the outcome the shopper sees was not: twice the Sage Gathered Midi was a "match" with a warning, and once it was a "closest pick" without one, because the model labelled the season "summer" in two runs and "July" in the other. This variation matters, because the same shopper asking the same question could reasonably conclude either "this fits" or "this falls short". The summer wedding search was more stable (the same three dresses across all runs), and the green shoes search returned a different set of dresses in each of its three runs.

### Before and after (peer recommendation: test unfamiliar requests)

Input: "garden party in July, about a hundred quid, nothing white"

<!-- Optional: add screenshots, e.g. ![Before](docs/before-garden-party.png) and ![After](docs/after-garden-party.png) -->

- **Before:** The summary read the request correctly ("a non-white dress for a July garden party, priced around £100") and showed two matches: Sage Gathered Midi and Iris Floral Wrap. The shopper wasn't told that £105 exceeded £100 or how "white" was interpreted, and both rules depended entirely on the model, with nothing in code enforcing them.
- **After:** The budget rule ("up to 10% extra: an effective maximum of £110") and the colour rule (ivory, cream and off-white count as white) are enforced in code and shown to the shopper. But the stricter cream rule removed the Iris Floral Wrap, leaving one dress, and the label and warning varied between runs.
- **Did it help?** Partly. The revision made the result more transparent and less dependent on the model, which addresses the reliability concern behind the peer feedback. It also made the result narrower and less consistent, so on this input it isn't clearly more useful to a shopper than before.

### What does the evidence tell me?

The revised search now handles unfamiliar budget wording ("about a hundred quid", "max £100") and colour exclusions consistently, explains how it interpreted them, rejects empty and out-of-catalogue requests clearly, and stayed honest in every test: it never invented a product, never presented an over-budget dress as a match, and never called satin silk. What remains unreliable is the layer added on top of the AI. The mismatch warning fired three times and was wrong each time. Turning subjective or unverifiable wording ("not too formal", "July") into hard rules downgraded good dresses and produced explanations about what the catalogue "cannot verify" rather than why a dress might suit the shopper. And the same request can produce different labels across runs. The results partly support the claimed value: shoppers can describe what they need in their own words beyond the three demo examples and get honest, budget-safe results. But the work dinner failure and the inconsistent labelling show that the experience isn't yet dependable enough to guide a decision. Next, I would treat subjective constraints as preferences rather than filters, fix the warning so it compares budget claims against the disclosed effective budget and recognises negations like "not silk", deliberately test whether the warning catches a genuinely wrong explanation (it hasn't yet been seen doing so), and run a larger set of paraphrased requests with real shoppers. These eleven runs on an eight-dress fictional catalogue are early evidence, not proof of reliability.

### Original results (initial build, before this revision)

These three scenarios passed live API checks during the initial build. At that time, the three example cases were explicitly covered by the model's instructions, so they demonstrated the intended slice rather than performance on unseen requests.

| Test | Query | Observed result | Outcome |
|---|---|---|---|
| Colour compatibility | "a dress that'll go with green shoes" | Four non-green options: Elodie Linen Midi (£98, ivory), Celeste Satin Slip (£115, blush), Iris Floral Wrap (£89, pink floral) and Amelia Pleated Maxi (£135, lilac), each explaining how its colour could coordinate with green shoes. | Pass |
| No strong match | "a silver sequin maxi dress under £30" | Two closest picks, Amelia Pleated Maxi (£135) and Nocturne Velvet Maxi (£165), both labelled closest, with explanations disclosing colour, material and price differences. No silver-sequin product was invented. | Pass |
| Occasion plus budget | "summer wedding, under £120" | Celeste Satin Slip (£115), Sage Gathered Midi (£105) and Iris Floral Wrap (£89), all strictly below £120; no ivory/white dress suggested. | Pass |

## Risk: misleading AI explanations and over-reliance

Shoppers who rely on the AI's explanations, especially those with a firm budget, a fabric preference or a dress code, could be misled if an explanation claims something the product doesn't have, such as calling a satin slip "silk" or saying a dress is within budget when it isn't. Because the explanations sit right next to verified catalogue facts and read confidently, shoppers may trust the AI's reasoning as much as the data, a form of over-reliance on AI. In response, I separated "From the catalogue" facts from AI-written explanations on every card, moved budget and colour exclusions into server code, showed the shopper how their request was interpreted (with disclosures such as the £110 effective budget), added "Not for me" and "Show different dresses" so shoppers can reject or replace suggestions, and added a server check that shows a warning when an explanation appears to contradict the product facts. The risk test ("100% silk dress under £40") showed the AI itself behaving honestly: it described the closest dress as satin, not silk, and disclosed the price gap. But the safeguard flagged that correct explanation, along with two accurate explanations in the garden party test, and I never observed it catching a genuine error. This is an important remaining risk: a warning that fires on correct information teaches shoppers to ignore it, which could make over-reliance worse rather than better. The check is rule-based (likely comparing budget claims against the original £100 rather than the disclosed £110, and missing negations such as "not silk"), it cannot judge subjective claims about style or occasion, and queries are still sent to the AI provider, so shoppers should avoid entering personal details.

## Known limitations

- **Small, fixed scope:** one fictional brand, eight dresses and dresses only. No live store, stock, size or availability integration.
- **Subjective recommendations:** colour compatibility depends on exact shades, lighting, materials and personal taste. The app has no image input and cannot inspect the shopper's actual shoes. Colour-pairing requests are not captured in "What I understood".
- **Subjective constraints treated too strictly:** wording such as "nothing too formal" or a month like "July" can be turned into hard rules that the catalogue cannot confirm, which downgrades suitable dresses to closest picks.
- **Inconsistent labelling between runs:** the same request can produce a "match" in one run and a "closest pick" in another, because the model's structured reading of the request varies.
- **False-positive mismatch warnings:** the explanation check has flagged accurate explanations and has not yet been observed catching a genuinely wrong one.
- **AI errors remain possible:** the model can misread requests, judge occasions incorrectly, write a weak explanation or rank inconsistently. Validating product IDs and enforcing budgets prevents invented items and over-budget matches, but does not prove the reasoning is correct.
- **Strict colour exclusions:** treating cream in a multicolour print as "white" may exclude dresses many shoppers would consider acceptable. This rule is disclosed but cannot currently be relaxed by the shopper.
- **Not a general accuracy evaluation:** the tests above are eleven runs on a fictional eight-dress catalogue. They are early evidence, not proof of reliability or improved sales.
- **No commerce or personalisation:** no checkout, payments, accounts, saved search history or cross-session personalisation.
- **Privacy is not an end-to-end no-retention guarantee:** the application does not persist searches in a database, but queries are sent to the AI service. Prototype example links can put queries in the URL and browser history. Provider-side retention has not been established by this prototype, so avoid entering sensitive personal information.
- **Network, latency and cost:** AI calls take several seconds, require network access and consume credits.
- **Not hardened for public traffic:** concurrent searches are capped in memory, but there are no durable per-user usage budgets or comprehensive abuse controls. The limit resets when the server restarts.

## Re-running the tests

With both app workflows running, run:

```
node scripts/src/check-search-scenarios.mjs
```

This runs all test scenarios (including the challenge case three times) and saves the raw output to `test_results.md`. It makes real AI calls and uses credits.
