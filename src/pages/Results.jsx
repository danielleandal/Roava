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

  // pagination state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // fetch plan
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
       const r = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, interests }),
      });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Failed to fetch");
        setData(j);
        setPage(1); // reset on new data
      } catch (e) {
        setErr(e.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, [city, start, end, pace, qs.get("interests")]);

  // 🔸 ALWAYS-CALLED HOOKS
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
      
      <h1>Your Itinerary (raw POIs)</h1>
      <p><strong>{data.city}</strong> • {start} → {end} • {pace}</p>

      <div className="results-summary card">
        <p><strong>Center:</strong> {data.center ? `${data.center.lat.toFixed(4)}, ${data.center.lon.toFixed(4)}` : "—"}</p>
        <p><strong>POIs:</strong> {total}</p>
      </div>

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