# Marlowe & Fern Search

An AI-assisted shopping-search prototype that turns a shopper’s plain-language request into ranked dresses from a fixed Marlowe & Fern catalogue, with a short reason for each recommendation.

## First working slice

A shopper can:

- Enter a request such as “a dress that'll go with green shoes” or “summer wedding, under £120”.
- See a small ranked set of catalogue products, each with a one-line explanation of why it fits.
- See clearly labelled **Closest picks** when nothing strongly matches, with explanations of where the alternatives fall short.
- Refine the request by searching again and open a product’s details.
- Use ordinary keyword, colour and maximum-price filters instead of AI search.

The flow ends at the product result. It does not include purchasing or checkout.

## Opening the prototype

1. Open **Marlowe & Fern Search** in this project’s app preview.
2. If the app is stopped, start the existing workflows:
   - `artifacts/api-server: API Server`
   - `artifacts/marlowe-search: web`
3. The **Shop** page is at `/`. Enter a request and select **Find dresses**, or select one of the three example requests.
4. Select **Prototype** in the navigation to open `/prototype`, which describes the test cases and limitations.

These are instructions for the project preview, not a claim that the app has been published at a public URL.

## Is the AI working or simulated?

**The search uses working AI, not simulated or hardcoded search responses.** The server sends the shopper’s query and the fixed catalogue to OpenAI through Replit AI Integrations. The model interprets intent, ranks products and writes fit explanations.

The catalogue itself is fictional sample data: eight dresses with illustrative GBP prices and dress illustrations rather than real product photography. The server validates returned product IDs and supplies product names, prices and details from the catalogue, not from the model. It also independently enforces simple explicit price ceilings on results labelled as matches.

AI search needs the managed OpenAI integration and network access, and uses Replit credits. If the AI request fails, the app displays an error rather than pretending a result was generated; catalogue browsing remains available.

## Three test results

All three scenarios **passed live API acceptance checks during the initial build**. The results below record that run; they were not rerun just to write this README.

| Test | Query | Observed result | Outcome |
|---|---|---|---|
| Colour compatibility | `a dress that'll go with green shoes` | Four non-green options: Elodie Linen Midi (£98, ivory), Celeste Satin Slip (£115, blush), Iris Floral Wrap (£89, pink floral), and Amelia Pleated Maxi (£135, lilac). Each explanation described how its colour could coordinate with green shoes rather than simply matching the word “green”. | **Pass** |
| No strong match | `a silver sequin maxi dress under £30` | Two alternatives: Amelia Pleated Maxi (£135) and Nocturne Velvet Maxi (£165). The response was `closest-picks`, both items were labelled `closest`, and the explanations disclosed their different colour/material and prices. No silver-sequin product was invented. | **Pass** |
| Occasion plus budget | `summer wedding, under £120` | Celeste Satin Slip (£115), Sage Gathered Midi (£105), and Iris Floral Wrap (£89). All three were catalogue summer-wedding options strictly below £120; no ivory/white dress was suggested. | **Pass** |

The checks also confirmed that each response contained multiple valid catalogue products with non-empty explanations. Type checks passed, and a screenshot confirmed the shop loaded with its catalogue.

**Verification scope:** these were live request/response checks plus a visual loading check, not a complete automated browser end-to-end test. A passing run does not guarantee the same ranking or recommendation quality on future requests.

To repeat the three API scenarios while both app workflows are running:

```sh
node scripts/src/check-search-scenarios.mjs
```

Repeating them makes real AI calls and uses credits.

## Known limitations

- **Small, fixed scope:** one fictional brand, eight products and dresses only. No live store, stock, size or availability integration.
- **Subjective recommendations:** colour compatibility depends on exact shades, lighting, materials and personal taste. The app has no image input and cannot inspect the shopper’s actual shoes.
- **AI errors remain possible:** the model can misread requests, judge occasions incorrectly, write a weak explanation or rank inconsistently. Validating product IDs prevents invented catalogue items, but does not prove the reasoning is correct.
- **Limited constraint enforcement:** simple ceilings such as “under £120” and “up to £120” are checked independently on matched results. Complex or implied budgets and other constraints still depend on model interpretation. Closest alternatives may exceed the budget and should say so.
- **Not a general accuracy evaluation:** the three example cases are explicitly covered by the model’s instructions. Their passing results demonstrate the intended slice, not performance on unseen requests or improved sales.
- **No commerce or personalisation:** no checkout, payments, accounts, saved search history or cross-session personalisation.
- **Privacy is not an end-to-end no-retention guarantee:** the application does not persist searches in a database, but queries are sent to the AI service. Prototype example links can put queries in the URL and browser history. Provider-side retention has not been established by this prototype, so avoid entering sensitive personal information.
- **Network, latency and cost:** AI calls take several seconds, require network access and consume credits.
- **Not hardened for public traffic:** concurrent searches are capped in memory, but there are no durable per-user usage budgets or comprehensive abuse controls. The limit resets when the server restarts.

## Further project documentation

- [Prototype flow, scenarios and limitations](artifacts/marlowe-search/PROTOTYPE.md)
- [Development commands and project structure](replit.md)
