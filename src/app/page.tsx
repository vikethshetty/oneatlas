import Link from "next/link";
import { ModelExplorer } from "@/features/models/model-explorer";

const providerMarks = ["◎", "A", "✦", "◈", "✳"];

export default function Home() {
  return (
    <main>
      <section className="hero-wrap">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="hero-content">
          <div className="announcement"><span className="announcement-dot" /> A clearer way to explore AI <span aria-hidden="true">↗</span></div>
          <h1>Every model.<br /><span>One atlas.</span></h1>
          <p className="hero-copy">The world of AI moves fast. Find the right model for the way you think, build, and create.</p>
          <div className="hero-actions">
            <Link className="button button-dark hero-cta" href="#models">Explore models <span aria-hidden="true">↓</span></Link>
            <Link className="button button-light" href="#about"><span className="play-icon" aria-hidden="true">▶</span> How it works</Link>
          </div>
          <div className="hero-social-proof">
            <div className="avatar-stack" aria-hidden="true"><span>J</span><span>M</span><span>S</span><span>+</span></div>
            <div><strong>Built for the curious</strong><span>One place to find what’s next.</span></div>
          </div>
        </div>
        <div className="orbit-art" aria-hidden="true">
          <div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="orbit orbit-c" />
          <div className="orbit-core"><span className="brand-mark brand-mark-large"><span /></span></div>
          <div className="orbit-node node-one">◎</div><div className="orbit-node node-two">A</div><div className="orbit-node node-three">✦</div><div className="orbit-node node-four">◈</div>
          <div className="orbit-label label-one">Language</div><div className="orbit-label label-two">Vision</div>
        </div>
        <div className="hero-bottom"><span>THE INDEPENDENT AI MODEL DIRECTORY</span><div className="provider-line">{providerMarks.map((mark, i) => <span key={i}>{mark}</span>)}<small>and many more</small></div></div>
      </section>

      <ModelExplorer />

      <section className="closing-banner" id="about">
        <div className="closing-spark" aria-hidden="true">✳</div>
        <div><p className="eyebrow">KEEP EXPLORING</p><h2>The best model is the one that works for you.</h2><p>Compare your options. Follow your curiosity. Find your fit.</p></div>
        <Link className="button button-dark" href="#models">Start exploring <span aria-hidden="true">↗</span></Link>
      </section>
      <footer className="site-footer"><Link className="brand" href="/"><span className="brand-mark"><span /></span><span>oneatlas<span className="brand-dot">.</span></span></Link><span>Make sense of the model universe.</span><span>© 2025 OneAtlas.dev</span></footer>
    </main>
  );
}
