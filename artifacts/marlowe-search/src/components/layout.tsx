import { type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';

export function Layout({ children }: { children: ReactNode }) {
  const [loc] = useLocation();
  const link = (href: string, label: string) => (
    <Link
      href={href}
      data-testid={`link-nav-${label.toLowerCase()}`}
      aria-current={loc === href ? 'page' : undefined}
      className={`text-sm tracking-wide pb-1 border-b transition-colors ${loc === href ? 'border-accent-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
    >
      {label}
    </Link>
  );
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:p-3 focus:bg-card">Skip to content</a>
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-5 flex items-baseline justify-between gap-4">
          <Link href="/" data-testid="link-home" className="font-serif text-2xl">
            Marlowe <span className="italic text-accent-foreground">&amp;</span> Fern
          </Link>
          <nav aria-label="Primary" className="flex gap-6">
            {link('/', 'Shop')}
            {link('/prototype', 'Prototype')}
          </nav>
        </div>
      </header>
      <main id="main" className="flex-1">{children}</main>
      <footer className="border-t mt-16">
        <p className="max-w-7xl mx-auto px-5 md:px-10 py-6 text-xs text-muted-foreground">
          A prototype with a small fictional catalogue. Illustrations, not photography. Nothing here can be bought.
        </p>
      </footer>
    </div>
  );
}
