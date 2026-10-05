import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { useListMarloweProducts, useSearchMarloweProducts, type MarloweProduct, type MarloweSearchResponse } from '@workspace/api-client-react';
import { ProductCard, ProductDetail } from '@/components/product';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Search, X } from 'lucide-react';

export const EXAMPLES = ["a dress that'll go with green shoes", 'a silver sequin maxi dress under £30', 'summer wedding, under £120'];

export default function Shop() {
  const cat = useListMarloweProducts();
  const search = useSearchMarloweProducts();
  const form = useForm<{ query: string }>({ defaultValues: { query: '' } });
  const q = form.watch('query');
  const setQ = (query: string) => form.setValue('query', query);
  const [kw, setKw] = useState('');
  const [colour, setColour] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [open, setOpen] = useState<{ p: MarloweProduct; reason?: string; badge?: string } | null>(null);
  const [asked, setAsked] = useState('');
  const products = cat.data?.products;
  const res: MarloweSearchResponse | undefined = search.data;

  const colours = useMemo(() => Array.from(new Set((products ?? []).map((p) => p.colour))).sort(), [products]);
  const filtered = useMemo(() => {
    const k = kw.trim().toLowerCase();
    const mp = Number(maxPrice);
    return (products ?? []).filter((p) =>
      (colour === 'all' || p.colour === colour) &&
      (!maxPrice || (!isNaN(mp) && p.price <= mp)) &&
      (!k || [p.name, p.category, p.description, p.colour, ...p.occasion, ...p.details].join(' ').toLowerCase().includes(k)));
  }, [products, kw, colour, maxPrice]);

  const run = (text: string) => {
    const t = text.trim();
    if (t.length < 3) return;
    setQ(t); setAsked(t);
    search.mutate({ data: { query: t } });
  };
  const runRef = useRef(run);
  runRef.current = run;
  useEffect(() => {
    const u = new URLSearchParams(window.location.search).get('q');
    if (u) runRef.current(u);
  }, []);
  const submit = form.handleSubmit(({ query }) => run(query));
  const clear = () => { search.reset(); setAsked(''); setQ(''); };
  const showSearch = search.isPending || search.isError || !!res;

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-10">
      <section className="pt-12 md:pt-20 pb-10 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.25em] text-accent-foreground mb-4 rise">Dresses, described</p>
        <h1 className="text-4xl md:text-6xl leading-[1.05] rise" style={{ animationDelay: '.08s' }}>
          Tell us the occasion. <span className="italic text-accent-foreground">We will find the dress.</span>
        </h1>
        <Form {...form}>
        <form onSubmit={submit} role="search" className="mt-8 rise" style={{ animationDelay: '.16s' }}>
          <label htmlFor="q" className="sr-only">Describe what you need</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input id="q" data-testid="input-search" {...form.register('query', { minLength: 3, maxLength: 400 })} maxLength={400} placeholder="Describe the outfit you need" className="h-12 bg-card text-base rounded-none" />
            <Button type="submit" data-testid="button-search" disabled={search.isPending || q.trim().length < 3} className="h-12 rounded-none px-6">
              {search.isPending ? 'Searching' : 'Find dresses'} <Search className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 items-center text-sm">
            <span className="text-muted-foreground">Try</span>
            {EXAMPLES.map((e, i) => (
              <button type="button" key={e} data-testid={`button-example-${i}`} disabled={search.isPending} onClick={() => run(e)} className="border px-3 py-1 hover:bg-accent transition-colors text-left disabled:opacity-50">{e}</button>
            ))}
          </div>
        </form>
        </Form>
      </section>

      {showSearch && (
        <section aria-live="polite" aria-busy={search.isPending} className="pb-14 border-b mb-10" data-testid="section-results">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Results for “{asked}”</p>
              {res && <p className="font-serif text-2xl mt-2 max-w-2xl" data-testid="text-intent">{res.intentSummary}</p>}
            </div>
            <Button variant="ghost" disabled={search.isPending} onClick={clear} data-testid="button-clear-search"><X className="h-4 w-4 mr-1" />Clear</Button>
          </div>
          {search.isPending && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">Reading your request against the catalogue…</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">{[0, 1, 2, 3].map((i) => <div key={i}><Skeleton className="aspect-[3/4]" /><Skeleton className="h-4 mt-3 w-2/3" /><Skeleton className="h-3 mt-2 w-full" /></div>)}</div>
            </div>
          )}
          {search.isError && (
            <div role="alert" className="border border-destructive/40 p-6" data-testid="status-search-error">
              <p className="font-serif text-xl">The search did not come back.</p>
              <p className="text-sm text-muted-foreground mt-1">Something went wrong reaching the assistant. The catalogue below still works.</p>
              <Button className="mt-4 rounded-none" onClick={() => run(asked)} data-testid="button-retry">Try again</Button>
            </div>
          )}
          {res && !search.isPending && (
            <>
              {res.resultType === 'closest-picks' && (
                <div className="bg-accent text-accent-foreground p-4 mb-6 text-sm" data-testid="status-closest">
                  <strong className="font-semibold">No exact match in this catalogue.</strong> These are the closest picks, and each says where it falls short.
                </div>
              )}
              {res.results.length === 0 ? (
                <p className="font-serif text-xl" data-testid="status-no-results">Nothing in the catalogue is close enough. Try describing it differently.</p>
              ) : (
                <ol className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
                  {res.results.map((r, i) => (
                    <ProductCard key={r.product.id} p={r.product} rank={i + 1} reason={r.reason} badge={r.matchType === 'closest' ? 'Closest pick' : 'Match'}
                      onOpen={(p) => setOpen({ p, reason: r.reason, badge: r.matchType === 'closest' ? 'Closest pick' : 'Match' })} />
                  ))}
                </ol>
              )}
            </>
          )}
        </section>
      )}

      <section aria-labelledby="cat" className="pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 id="cat" className="text-3xl">The catalogue</h2>
            <p className="text-sm text-muted-foreground mt-1">Browse everything, or narrow it the usual way.</p>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Catalogue filters">
            <Input aria-label="Keyword" data-testid="input-keyword" placeholder="Keyword" value={kw} onChange={(e) => setKw(e.target.value)} className="w-36 rounded-none bg-card" />
            <select aria-label="Colour" data-testid="select-colour" value={colour} onChange={(e) => setColour(e.target.value)} className="h-9 border border-input bg-card px-2 text-sm rounded-none">
              <option value="all">All colours</option>
              {colours.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <Input aria-label="Maximum price in pounds" data-testid="input-max-price" type="number" min={0} inputMode="numeric" placeholder="Max £" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-24 rounded-none bg-card" />
            {(kw || maxPrice || colour !== 'all') && <Button variant="ghost" onClick={() => { setKw(''); setMaxPrice(''); setColour('all'); }} data-testid="button-reset-filters">Reset</Button>}
          </div>
        </div>
        {cat.isLoading && <div className="grid grid-cols-2 md:grid-cols-4 gap-5">{Array.from({ length: 8 }).map((_, i) => <div key={i}><Skeleton className="aspect-[3/4]" /><Skeleton className="h-4 mt-3 w-2/3" /></div>)}</div>}
        {cat.isError && (
          <div role="alert" className="border p-6" data-testid="status-catalogue-error">
            <p className="font-serif text-xl">The catalogue could not be loaded.</p>
            <Button className="mt-3 rounded-none" onClick={() => cat.refetch()} data-testid="button-retry-catalogue">Retry</Button>
          </div>
        )}
        {products && (filtered.length === 0 ? (
          <div className="border border-dashed p-10 text-center" data-testid="status-empty-filter">
            <p className="font-serif text-xl">No dresses fit those filters.</p>
            <p className="text-sm text-muted-foreground mt-1">Or describe it in your own words above <ArrowRight className="inline h-3 w-3" /></p>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-4" aria-live="polite" data-testid="text-count">{filtered.length} of {products.length} dresses</p>
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
              {filtered.map((p) => <ProductCard key={p.id} p={p} onOpen={(x) => setOpen({ p: x })} />)}
            </ul>
          </>
        ))}
      </section>
      <ProductDetail p={open?.p ?? null} reason={open?.reason} badge={open?.badge} onClose={() => setOpen(null)} />
    </div>
  );
}
