import { Router, type IRouter } from "express";
import { ListMarloweProductsResponse, SearchMarloweProductsBody, SearchMarloweProductsResponse } from "@workspace/api-zod";
import { products } from "../lib/catalogue";
import { searchCatalogue } from "../lib/marlowe-search";

const router: IRouter = Router();
// Keep anonymous prototype traffic from creating unbounded concurrent AI requests.
let inFlight = 0;

router.get("/marlowe/products", (_req, res) => {
  res.json(ListMarloweProductsResponse.parse({ products }));
});

router.post("/marlowe/search", async (req, res): Promise<void> => {
  const parsed = SearchMarloweProductsBody.safeParse(req.body);
  if (!parsed.success || parsed.data.query.trim().length < 3) {
    res.status(400).json({ error: "Please describe what you are looking for in 3–400 characters." });
    return;
  }
  if (inFlight >= 4) {
    res.status(502).json({ error: "Search is busy right now. Please try again in a moment." });
    return;
  }
  inFlight++;
  try {
    const result = await searchCatalogue(parsed.data.query.trim());
    res.json(SearchMarloweProductsResponse.parse(result));
  } catch (err) {
    req.log.error({ err }, "Catalogue AI search failed");
    res.status(502).json({ error: "We couldn't complete the AI search. Please try again, or browse the catalogue instead." });
  } finally {
    inFlight--;
  }
});

export default router;
