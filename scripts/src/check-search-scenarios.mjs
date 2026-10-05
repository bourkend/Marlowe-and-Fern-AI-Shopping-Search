import assert from "node:assert/strict";

const base = process.env.TEST_BASE_URL ?? "http://localhost:80";
const catalogueResponse = await fetch(`${base}/api/marlowe/products`);
assert.equal(catalogueResponse.status, 200);
const catalogue = await catalogueResponse.json();
const ids = new Set(catalogue.products.map(p => p.id));
const scenarios = [
  { name: "Colour compatibility", query: "a dress that'll go with green shoes", check: r => {
    assert.equal(r.resultType, "matches");
    assert.ok(r.results.some(p => !/green/i.test(p.product.colour)), "Must offer coordinated non-green dresses");
    assert.ok(r.results.every(p => /green|shoes/i.test(p.reason)), "Reasons must explain coordination");
  }},
  { name: "No strong match", query: "a silver sequin maxi dress under £30", check: r => {
    assert.equal(r.resultType, "closest-picks");
    assert.ok(r.results.every(p => p.matchType === "closest"), "Every alternative must be labelled");
    assert.ok(r.results.every(p => /lack|not|no |but|over|above|instead|rather|doesn.t|without|£/i.test(p.reason)), "Reasons must disclose a shortfall");
  }},
  { name: "Occasion and budget", query: "summer wedding, under £120", check: r => {
    assert.equal(r.resultType, "matches");
    assert.ok(r.results.every(p => p.product.price < 120), "Under £120 is a strict ceiling");
    assert.ok(r.results.every(p => p.product.occasion.includes("summer wedding")));
    assert.ok(r.results.every(p => !/ivory|white/i.test(p.product.colour)), "Do not suggest bridal white to a guest by default");
  }},
];
for (const scenario of scenarios) {
  const response = await fetch(`${base}/api/marlowe/search`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: scenario.query }),
    signal: AbortSignal.timeout(60000),
  });
  const result = await response.json();
  assert.equal(response.status, 200, JSON.stringify(result));
  assert.ok(result.results.length >= 2, "Multiple picks should appear");
  assert.ok(result.results.every(p => ids.has(p.product.id) && p.reason.trim()), "Only catalogue products with reasons");
  scenario.check(result);
  console.log(`PASS: ${scenario.name} — ${result.resultType}, ${result.results.length} picks`);
  console.log(result.results.map(p => `${p.product.name} (£${p.product.price}): ${p.reason}`).join("\n"));
}
