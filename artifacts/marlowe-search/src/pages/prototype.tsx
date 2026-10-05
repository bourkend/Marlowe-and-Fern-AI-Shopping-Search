import { Link } from 'wouter';
import { EXAMPLES } from './shop';

const cases = [
  { q: EXAMPLES[0], tag: 'Indirect need', out: 'Expect ranked matches in colours that sit well beside green footwear, such as neutrals, creams or complementary tones, each with a one-line reason. Result type: matches.' },
  { q: EXAMPLES[1], tag: 'No strong match', out: 'Expect no silver sequin maxi under £30. The result should be labelled closest picks, with each reason naming the shortfall in colour, length or price. Result type: closest-picks.' },
  { q: EXAMPLES[2], tag: 'Occasion plus budget', out: 'Expect dresses suited to a summer wedding at or below £120, ranked, with reasons that mention occasion and price. Result type: matches.' },
];
const limits = [
  'A small, fixed, fictional catalogue. Dresses only.',
  'Colour and occasion are judged subjectively and may differ from your view.',
  'No live stock, checkout or accounts.',
  'No image input. Search is text only.',
  'No personalisation across sessions. Each search stands alone.',
  'The model may misunderstand a request or rank inconsistently between runs.',
];

export default function Prototype() {
  return (
    <div className="max-w-5xl mx-auto px-5 md:px-10 py-12 md:py-20">
      <p className="text-xs uppercase tracking-[0.25em] text-accent-foreground mb-4">The prototype</p>
      <h1 className="text-4xl md:text-6xl leading-[1.05] max-w-3xl">Three requests, and what should happen.</h1>
      <p className="mt-6 max-w-2xl text-foreground/80 leading-relaxed">
        Shoppers describe a need and an AI model ranks dresses from the fixed catalogue. Every product ID it returns is validated against the catalogue on the server, so nothing outside it can appear.
      </p>
      <ol className="mt-12 border-t">
        {cases.map((c, i) => (
          <li key={c.q} className="grid md:grid-cols-[4rem_1fr_auto] gap-4 py-8 border-b items-start" data-testid={`case-${i}`}>
            <span className="font-serif italic text-3xl text-accent-foreground">{i + 1}</span>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{c.tag}</p>
              <p className="font-serif text-2xl mt-1">“{c.q}”</p>
              <p className="mt-3 text-sm leading-relaxed max-w-xl"><span className="font-semibold">Expected: </span>{c.out}</p>
            </div>
            <Link href={`/?q=${encodeURIComponent(c.q)}`} data-testid={`link-try-${i}`} className="text-sm underline underline-offset-4 hover:text-accent-foreground">Try it in the shop</Link>
          </li>
        ))}
      </ol>
      <h2 className="text-3xl mt-16">Known limitations</h2>
      <ul className="mt-5 grid md:grid-cols-2 gap-x-10">
        {limits.map((l) => <li key={l} className="py-3 border-b text-sm">{l}</li>)}
      </ul>
    </div>
  );
}
