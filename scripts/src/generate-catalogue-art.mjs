import { mkdirSync, writeFileSync } from "node:fs";

// Fictional catalogue artwork, deliberately illustrations rather than misleading product photos.
const garments = [
  ["elodie", "#eee3cd", "#b9ab8c", "#e4dfd3", "square"],
  ["celeste", "#d9a9a3", "#a96968", "#ece0d8", "slip"],
  ["iris", "#ead0cb", "#b87d80", "#e2e1d5", "wrap"],
  ["rowan", "#344657", "#192b3b", "#d8dddb", "shirt"],
  ["sage", "#a2b099", "#6d8163", "#e2e5db", "puff"],
  ["nocturne", "#36333b", "#17161c", "#e1dbdc", "long"],
  ["amelia", "#b8a3c4", "#847293", "#e5dfeb", "pleat"],
  ["terracotta", "#ba7960", "#8c503e", "#ede0d2", "tier"],
];
mkdirSync("artifacts/marlowe-search/public/products", { recursive: true });
for (const [id, colour, shade, background, style] of garments) {
  const long = style === "long" || style === "pleat";
  const hem = long ? 535 : 490;
  const straps = style === "slip" || style === "tier";
  const sleeves = style === "long"
    ? `<path d="M165 147L123 310L151 320L190 177M235 147L277 310L249 320L210 177" fill="url(#cloth)" stroke="${shade}" stroke-width="2"/>`
    : style === "puff" || style === "wrap" || style === "shirt"
      ? `<path d="M166 142Q123 143 125 207Q145 222 169 203L183 172M234 142Q277 143 275 207Q255 222 231 203L217 172" fill="url(#cloth)" stroke="${shade}" stroke-width="2"/>` : "";
  const neck = straps ? "M167 148L181 119L186 170Q200 181 214 170L219 119L233 148" : "M163 147L179 133L181 161L219 161L221 133L237 147";
  const florals = style === "wrap" ? Array.from({ length: 18 }, (_, i) => {
    const x = 135 + (i * 37 % 130), y = 210 + (i * 47 % 240);
    return `<g transform="translate(${x} ${y})"><path d="M0 7Q-10 -7 0 -4Q9 -13 9 -3Q21 -2 11 7Q10 20 4 11Q-7 18 0 7" fill="${shade}" opacity=".6"/><circle cx="6" cy="4" r="3" fill="#f8eee2"/></g>`;
  }).join("") : "";
  const folds = [155, 175, 195, 215, 235, 255].map((x, i) => `<path d="M${185 + i * 6} 260Q${x} 385 ${x + (x - 200) * .3} ${hem - 7}" fill="none" stroke="${shade}" stroke-width="${style === "pleat" ? 2 : 1}" opacity=".28"/>`).join("");
  const details = style === "shirt" ? `<path d="M200 162V${hem}" stroke="${shade}" stroke-width="2"/>${[190,215,240,280,320,360,400].map(y=>`<circle cx="201" cy="${y}" r="2.5" fill="#dbd8cb"/>`).join("")}<path d="M180 137L200 170L220 137L211 136L200 150L189 136Z" fill="${shade}"/>` : style === "tier" ? `<path d="M159 337Q200 350 241 337M136 417Q200 432 264 417" stroke="${shade}" stroke-width="2" fill="none" opacity=".7"/>` : style === "wrap" ? `<path d="M176 155L223 259L160 457" stroke="${shade}" fill="none" opacity=".6"/>` : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600" role="img" aria-label="Illustration of the ${id} dress">
<defs><linearGradient id="cloth" x1="0" x2="1"><stop stop-color="${shade}"/><stop offset=".28" stop-color="${colour}"/><stop offset=".67" stop-color="${colour}"/><stop offset="1" stop-color="${shade}"/></linearGradient><filter id="shadow"><feGaussianBlur stdDeviation="8"/></filter><clipPath id="dress"><path d="${neck}L227 259L${long ? 285 : 279} ${hem}Q200 ${hem+22} ${long ? 115 : 121} ${hem}L173 259Z"/></clipPath></defs>
<rect width="400" height="600" fill="${background}"/><path d="M30 0V600M370 0V600" stroke="#fff" opacity=".17"/><ellipse cx="200" cy="${hem+38}" rx="93" ry="13" fill="#615e53" opacity=".12" filter="url(#shadow)"/>
<path d="M200 74Q220 74 214 91L199 105M199 105L147 140Q140 145 151 148L249 148Q260 145 253 140Z" fill="none" stroke="#aa9276" stroke-width="4" stroke-linecap="round"/>
${sleeves}<path d="${neck}L227 259L${long ? 285 : 279} ${hem}Q200 ${hem+22} ${long ? 115 : 121} ${hem}L173 259Z" fill="url(#cloth)" stroke="${shade}" stroke-width="1.5"/>
<g clip-path="url(#dress)">${folds}${florals}${details}</g>
${!straps ? `<path d="M174 256Q200 260 226 256" stroke="${shade}" stroke-width="5" fill="none" opacity=".7"/>` : ""}
<text x="200" y="575" text-anchor="middle" font-family="Georgia,serif" font-size="10" letter-spacing="3" fill="#655f54">MARLOWE &amp; FERN</text></svg>`;
  writeFileSync(`artifacts/marlowe-search/public/products/${id}.svg`, svg);
}
