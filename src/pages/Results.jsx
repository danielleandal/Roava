// Results.jsx
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

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

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const r = await fetch("http://localhost:3001/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city, start, end, pace, interests })
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Failed to fetch");
        setData(j);
      } catch (e) {
        setErr(e.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, [city, start, end, pace, qs.get("interests")]);

  if (loading) return <div className="container"><h1>Building…</h1></div>;
  if (err) return <div className="container"><h1>Oops</h1><p>{err}</p></div>;
  if (!data) return null;

  return (
    <div className="container">
      <h1>Your Itinerary (raw POIs)</h1>
      <p><strong>{data.city}</strong> • {start} → {end} • {pace}</p>

      <div className="card">
        <p><strong>Center:</strong> {data.center.lat.toFixed(4)}, {data.center.lon.toFixed(4)}</p>
        <p style={{marginTop:8}}><strong>POIs:</strong> {data.count}</p>
      </div>

      {/* simple list of POIs */}
      <div className="card">
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {data.pois.slice(0, 50).map((p, i) => (
            <li key={p.xid || i} style={{ padding: "8px 0", borderBottom: "1px solid #334155" }}>
              <div style={{ fontWeight: 600 }}>{p.name || "Unnamed place"}</div>
              <div style={{ color: "#94a3b8", fontSize: ".95rem" }}>
                {p.kinds} • {Math.round(p.dist)} m from center • rate {p.rate ?? "-"}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Link to="/" style={{ color: "#10b981", fontWeight: 600 }}>← Back</Link>
    </div>
  );
}