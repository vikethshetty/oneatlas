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
          <Link href="/#collections">Collections</Link>
          <Link href="/#about">For developers</Link>
        </nav>
        <div className="header-actions">
          <Link className="sign-in" href="/#sign-in">Sign in</Link>
          <Link className="button button-dark header-cta" href="/#get-started">Get started <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </header>
  );
}
