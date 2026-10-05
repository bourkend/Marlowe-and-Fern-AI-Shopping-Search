import { type MarloweProduct } from '@workspace/api-client-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

export const gbp = (n: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: n % 1 ? 2 : 0 }).format(n);

export function ProductCard({ p, onOpen, badge, reason, rank }: { p: MarloweProduct; onOpen: (p: MarloweProduct) => void; badge?: string; reason?: string; rank?: number }) {
  return (
    <li className="rise">
      <button
        onClick={() => onOpen(p)}
        data-testid={`card-product-${p.id}`}
        className="group text-left w-full h-full flex flex-col"
        aria-label={`${p.name}, ${gbp(p.price)}. View details`}
      >
        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
          <img src={p.imageUrl} alt={`Illustration of ${p.name}`} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
          {badge && <span data-testid={`badge-${p.id}`} className="absolute top-3 left-3 bg-accent text-accent-foreground text-[11px] uppercase tracking-widest px-2.5 py-1">{badge}</span>}
          {rank !== undefined && <span className="absolute top-3 right-3 font-serif italic text-lg bg-card/90 w-8 h-8 grid place-items-center">{rank}</span>}
        </div>
        <div className="pt-3 flex justify-between gap-3">
          <h3 className="font-serif text-lg leading-tight group-hover:underline underline-offset-4">{p.name}</h3>
          <span className="text-sm tabular-nums pt-1" data-testid={`text-price-${p.id}`}>{gbp(p.price)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{p.colour} · {p.category}</p>
        {reason && <p data-testid={`text-reason-${p.id}`} className="mt-2 text-sm border-l-2 border-accent-foreground/50 pl-3 italic">{reason}</p>}
      </button>
    </li>
  );
}

export function ProductDetail({ p, onClose, reason, badge }: { p: MarloweProduct | null; onClose: () => void; reason?: string; badge?: string }) {
  return (
    <Dialog open={!!p} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[92dvh] overflow-y-auto bg-card" data-testid="dialog-product">
        {p && (
          <div className="grid md:grid-cols-2">
            <img src={p.imageUrl} alt={`Illustration of ${p.name}`} className="w-full h-full object-cover bg-muted max-h-[50dvh] md:max-h-none" />
            <div className="p-6 md:p-8 space-y-4">
              {badge && <span className="inline-block bg-accent text-accent-foreground text-[11px] uppercase tracking-widest px-2.5 py-1">{badge}</span>}
              <DialogTitle className="font-serif text-3xl font-normal">{p.name}</DialogTitle>
              <p className="text-xl tabular-nums" data-testid="text-detail-price">{gbp(p.price)}</p>
              <DialogDescription className="text-foreground/80 leading-relaxed">{p.description}</DialogDescription>
              {reason && <p className="italic border-l-2 border-accent-foreground/50 pl-3 text-sm">{reason}</p>}
              <dl className="text-sm grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                <dt className="text-muted-foreground">Colour</dt><dd>{p.colour}</dd>
                <dt className="text-muted-foreground">Category</dt><dd>{p.category}</dd>
                <dt className="text-muted-foreground">Occasion</dt><dd>{p.occasion.join(', ')}</dd>
              </dl>
              <ul className="text-sm list-disc pl-5 space-y-1">{p.details.map((d) => <li key={d}>{d}</li>)}</ul>
              <p className="text-xs text-muted-foreground">Catalogue illustration. Prototype only, not for sale.</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
