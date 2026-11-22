import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="OneAtlas home">
          <span className="brand-mark"><span /></span>
          <span>oneatlas<span className="brand-dot">.</span></span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link className="nav-active" href="/#models">Explore models</Link>
          <Link href="/rankings">Rankings</Link>
          <Link href="/providers">Providers</Link>
        </nav>
        <details className="mobile-menu">
          <summary aria-label="Open navigation">Menu</summary>
          <nav aria-label="Mobile navigation">
            <Link href="/#models">Explore models</Link>
            <Link href="/rankings">Rankings</Link>
            <Link href="/providers">Providers</Link>
            <Link href="/admin">Catalog admin</Link>
          </nav>
        </details>
        <div className="header-actions">
          <Link className="sign-in" href="/admin">Catalog admin</Link>
          <Link className="button button-dark header-cta" href="/compare">Compare <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </header>
  );
}
