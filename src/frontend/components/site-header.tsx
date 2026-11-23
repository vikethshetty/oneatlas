"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname } from "next/navigation";

const links = [
  { label: "Models", mobileLabel: "Explore models", href: "/#models", key: "models" },
  { label: "Rankings", mobileLabel: "Rankings", href: "/rankings", key: "rankings" },
  { label: "Benchmarks", mobileLabel: "Benchmarks", href: "/benchmarks", key: "benchmarks" },
  { label: "Labs", mobileLabel: "Labs", href: "/labs", key: "labs" },
  { label: "Providers", mobileLabel: "Providers", href: "/providers", key: "providers" },
] as const;

function isActive(pathname: string, key: (typeof links)[number]["key"]) {
  if (key === "models") return pathname === "/" || pathname === "/models" || pathname.startsWith("/models/");
  const route = `/${key}`;
  return pathname === route || pathname.startsWith(`${route}/`);
}

function NavigationLinks({ pathname, mobile = false }: { pathname: string; mobile?: boolean }) {
  return <>{links.map((item) => {
    const active = isActive(pathname, item.key);
    return <Link key={item.key} href={item.href} className={active ? "nav-active" : undefined} aria-current={active ? "page" : undefined}>{mobile ? item.mobileLabel : item.label}</Link>;
  })}</>;
}

function Navigation() {
  const pathname = usePathname();
  return <>
    <nav className="main-nav" aria-label="Main navigation"><NavigationLinks pathname={pathname} /></nav>
    <details className="mobile-menu">
      <summary aria-label="Open navigation">Menu</summary>
      <nav aria-label="Mobile navigation">
        <NavigationLinks pathname={pathname} mobile />
        <Link href="/admin">Catalog admin</Link>
      </nav>
    </details>
  </>;
}

function NavigationFallback() {
  return <>
    <nav className="main-nav" aria-label="Main navigation"><NavigationLinks pathname="" /></nav>
    <details className="mobile-menu">
      <summary aria-label="Open navigation">Menu</summary>
      <nav aria-label="Mobile navigation">
        <NavigationLinks pathname="" mobile />
        <Link href="/admin">Catalog admin</Link>
      </nav>
    </details>
  </>;
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="OneAtlas home">
          <span className="brand-mark"><span /></span>
          <span>oneatlas<span className="brand-dot">.</span></span>
        </Link>
        <Suspense fallback={<NavigationFallback />}><Navigation /></Suspense>
        <form className="header-global-search" action="/#models" method="get">
          <label className="sr-only" htmlFor="global-model-search">Search models, labs, and providers</label>
          <input id="global-model-search" name="q" type="search" placeholder="Search models, labs, providers" />
          <button type="submit" aria-label="Search">⌕</button>
        </form>
        <div className="header-actions">
          <Link className="sign-in" href="/admin">Catalog admin</Link>
          <Link className="button button-dark header-cta" href="/compare">Compare <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </header>
  );
}
