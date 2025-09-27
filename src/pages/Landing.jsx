import { Link } from "react-router-dom";
import "./Landing.css";

export default function Landing() {
  return (
    <div className="landing-root">


    {/* moving planes background */}
      <div className="sky" aria-hidden="true">
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />
        <span className="plane" />

              {Array.from({ length: 50 }).map((_, i) => {
        const size = Math.random() * 4 + 2; // stars between 2px and 6px
        return (
          <span
            key={i}
            className="star"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        );
      })}

      </div>

      {/* NAV */}
      <header className="landing-nav">
        <div className="landing-logo">Roava<span>AI</span></div>
        <nav className="landing-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#safety">Safety</a>
          <Link to="/plan" className="btn btn--sm btn--ghost">Plan a trip</Link>
        </nav>
      </header>

      {/* HERO */}
      <main className="landing-container">
        <section className="hero">
          <h1>Solo travel, made simple.</h1>
          <p>
            Drop a destination. We build a smart, safe itinerary in seconds—
            tailored to your pace and interests.
          </p>
          <div className="cta-row">
            <Link to="/plan" className="btn">Plan your trip</Link>
            <Link
              to="/results?city=Tokyo&start=2025-10-01&end=2025-10-03&pace=normal&interests=museums,food,views"
              className="btn btn--ghost"
            >
              See a sample
            </Link>
          </div>
          <div className="hero-badges">
            <span>⚡ 24-hour hackathon build</span>
            <span>🛡️ Solo-traveler safety first</span>
            <span>🗺️ Smart clustering</span>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="card-grid-landing">
          <div className="card-landing">
            <h3>Instant itineraries</h3>
            <p>We geocode your city and pull top places, then auto-organize by neighborhood.</p>
          </div>
          <div className="card-landing">
            <h3>Tailored to you</h3>
            <p>Choose pace and interests—museums, food, views, nature, shopping, and more.</p>
          </div>
          <div className="card-landing">
            <h3>Map-ready</h3>
            <p>Every stop includes a one-tap link to open in Google Maps.</p>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="steps card-landing">
          <h2>How it works</h2>
          <ol>
            <li>Enter <strong>city + dates</strong> and pick your interests.</li>
            <li>We find safe, central places and <strong>cluster</strong> them by area.</li>
            <li>We schedule your days from <strong>morning → evening</strong> with travel buffers.</li>
          </ol>
        </section>

        {/* SAFETY */}
        <section id="safety" className="card-landing safety">
          <h2>Built for solo safety</h2>
          <ul>
            <li>Prefers busy, central areas and daytime slots.</li>
            <li>Downranks nightlife and far-out locations for solo travelers.</li>
            <li>Quick share + map links so someone always knows your plan.</li>
          </ul>
        </section>

        <section className="final-cta">
          <h2>Ready to roam?</h2>
          <Link to="/plan" className="btn">Start planning</Link>
        </section>
      </main>

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} Roava • Built at Hackathon</span>
      </footer>
    </div>
  );
}