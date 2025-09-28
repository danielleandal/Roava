import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import "./Results.css";

export default function Results() {
  const { search } = useLocation();
  const qs = new URLSearchParams(search);

  const city = qs.get("city") || "Tokyo";
  const start = qs.get("start") || "";
  const end = qs.get("end") || "";
  const pace = qs.get("pace") || "normal";
  const interests = (qs.get("interests") || "museums,food,views").split(",");

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // NEW: AI state
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiErr, setAiErr] = useState("");

  // pagination state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // fetch plan (from your public server)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const r = await fetch("http://45.55.91.156:3001/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city, start, end, pace, interests })
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Failed to fetch");
        setData(j);
        setPage(1);
        setAiText(""); // reset AI text when city/filters change
      } catch (e) {
        setErr(e.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, [city, start, end, pace, qs.get("interests")]);

  // pagination calcs
  const total = data?.pois?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const currentSlice = useMemo(() => {
    const arr = data?.pois ?? [];
    const startIdx = (page - 1) * perPage;
    return arr.slice(startIdx, startIdx + perPage);
  }, [data, page, perPage]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [perPage, totalPages, page]);

  // NEW: call AI polish
  async function runPolish() {
    try {
      setAiLoading(true);
      setAiErr("");
      setAiText("");

      // keep payload light
      const compactPOIs = (data?.pois || [])
        .slice(0, 40)
        .map(p => ({ name: p.name, kinds: p.kinds, rate: p.rate }));

      const r = await fetch("http://45.55.91.156:3001/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          start,
          end,
          pace,
          pois: compactPOIs
        })
      });
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j.error || "AI failed");
      setAiText(j.text || "");
      // optional: scroll to AI section
      setTimeout(() => {
        document.getElementById("ai-itin")?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    } catch (e) {
      setAiErr(e.message || "Failed to polish itinerary");
    } finally {
      setAiLoading(false);
    }
  }

  // UI
  if (loading) return <div className="results container"><h1>Building…</h1></div>;
  if (err) return <div className="results container"><h1>Oops</h1><p>{err}</p></div>;
  if (!data) return null;

  const Pager = () => (
    <div className="results-pager card">
      <div className="results-pager-controls">
        <button onClick={() => setPage(1)} disabled={page===1}>⏮First</button>
        <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>◀Prev</button>
        <span>Page <strong>{page}</strong> / {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}>Next▶</button>
        <button onClick={() => setPage(totalPages)} disabled={page===totalPages}>Last⏭</button>
      </div>
      <div className="results-pager-size">
        <label>Per page</label>
        <select value={perPage} onChange={e => setPerPage(Number(e.target.value))}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="results container">
      {/* background stars/planes you already added */}
      <div className="sky" aria-hidden="true">
        <span className="plane" /><span className="plane" /><span className="plane" />
        <span className="plane" /><span className="plane" /><span className="plane" />
        <span className="plane" /><span className="plane" /><span className="plane" />
        <span className="plane" />
        {Array.from({ length: 50 }).map((_, i) => {
          const size = Math.random() * 4 + 2;
          return (
            <span key={i} className="star" style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: `${Math.random() * 3}s`
            }} />
          );
        })}
      </div>

      <h1>Your Itinerary</h1>
      <p><strong>{data.city}</strong> • {start} → {end} • {pace}</p>

      <div className="results-summary card">
        <p><strong>Center:</strong> {data.center ? `${data.center.lat.toFixed(4)}, ${data.center.lon.toFixed(4)}` : "—"}</p>
        <p><strong>POIs:</strong> {total}</p>
      </div>

      {/* NEW: AI button */}
      <div className="card" style={{ display:"flex", gap:12, alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ color:"#cbd5e1" }}>Let AI turn these into a day-by-day plan.</div>
        <button
          onClick={runPolish}
          disabled={aiLoading || total===0}
          style={{
            padding:"0.6rem 0.9rem",
            borderRadius:8,
            border:"1px solid #10b981",
            background: aiLoading ? "#0b3b2f" : "#0f172a",
            color:"#d1fae5",
            cursor: aiLoading ? "progress" : "pointer",
            fontWeight:600
          }}
        >
          {aiLoading ? "Polishing…" : "✨ AI polish itinerary"}
        </button>
      </div>

{(aiErr || aiText) && (
  <div id="ai-itin" className="card ai-wrap">
    
    {aiErr ? (
      <p className="ai-error">{aiErr}</p>
    ) : (
      (() => {
        // ------- Parse markdown into: intro + days -------
        const splitDays = (md = "") => {
          const lines = md.split("\n");
          const intro = [];
          const days = [];
          let curr = null;

          for (const line of lines) {
            const t = line.trim();
            const isDay = (
              /^\*\*Day\s*\d+.*\*\*$/.test(t) ||            // **Day 1: ...**
              /^#{1,6}\s*Day\s*\d+.*$/.test(t) ||           // ### Day 1 ...
              /^Day\s*\d+\s*[:—-]/i.test(t)                 // Day 1: / Day 1 — / Day 1 -
            ); // **Day 1: ...**
            if (isDay) {
              if (curr) days.push(curr);
              const clean = t.replace(/^\*+|^#{1,6}\s*/g, "").replace(/\*\*/g, "").trim();
              const [dayHeading, ...rest] = clean.split(/[—:-]/); // split on em-dash, colon, or dash
              curr = {
                title: (rest.join(" ").trim()) || "",
                day: (dayHeading.match(/Day\s*\d+/i) || ["Day ?"])[0],
                body: [],
              };
            } else {
              if (!curr) intro.push(t);
              else curr.body.push(t);
            }
          }
          if (curr) days.push(curr);
          return { intro: intro.join(" ").trim(), days };
        };

        const { intro, days } = splitDays(aiText);

        const renderBody = (bodyLines = []) => {
          const out = [];
          let list = [];
          const flushList = () => {
            if (!list.length) return;
            out.push(
              <ul key={`ul-${out.length}`} className="ai-ul">
                {list.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            );
            list = [];
          };

          for (const raw of bodyLines) {
            const l = raw.trim();
            if (!l) continue;
            if (/^\*/.test(l)) {
              // bullet -> strip leading "*" and bold wrappers
              const text = l.replace(/^\*\s*/, "").replace(/\*\*/g, "").trim();
              list.push(text);
            } else {
              flushList();
              out.push(
                <p key={`p-${out.length}`} className="ai-p">
                  {l.replace(/\*\*/g, "")}
                </p>
              );
            }
          }
          flushList();
          return out;
        };

        return (
          <>
            {intro && (
              <div className="ai-intro-box">
                <h2 className="ai-intro-title">✨ AI Itinerary</h2>
                <p>{intro.replace(/---/g, "").trim()}</p>
                {/\*\*(.*)\*\*/.test(aiText) && (
                  <div className="ai-intro-dates">
                    {aiText.match(/\*\*(.*)\*\*/)[1]}
                  </div>
                )}
              </div>
            )}

            <div className="ai-grid ai-grid--two">
              {days.map((d, i) => (
                <article className="ai-day" key={i}>
                  <div className="ai-day-badge">{d.day}</div>
                  {d.title && <h3 className="ai-day-title">{d.title}</h3>}
                  <div className="ai-day-body">{renderBody(d.body)}</div>
                </article>
              ))}
            </div>
          </>
        );
      })()
    )}
  </div>
)}
      <Pager />

      <div className="results-list card">
        <ul>
          {currentSlice.map((p, i) => {
            const n = (page - 1) * perPage + i + 1;
            return (
              <li key={p.xid || `${p.name}-${i}`}>
                <div className="results-item-title">{n}. {p.name || "Unnamed place"}</div>
                <div className="results-item-meta">
                  {p.kinds} • {Math.round(p.dist)} m from center • rate {p.rate ?? "-"}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <Pager />

      <Link to="/" className="results-back">← Back</Link>
    </div>
  );
}