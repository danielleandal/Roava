import { useLocation, Link } from "react-router-dom";

export default function Results() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const city  = params.get("city")  || "";
  const start = params.get("start") || "";
  const end   = params.get("end")   || "";
  const pace  = params.get("pace")  || "";
  const interests = (params.get("interests") || "").split(",").filter(Boolean);

  return (
    <div className="container">
      <h1>Your Trip Details</h1>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <p><strong>Destination:</strong> {city}</p>
        <p><strong>Start Date:</strong> {start}</p>
        <p><strong>End Date:</strong> {end}</p>
        <p><strong>Trip Pace:</strong> {pace}</p>
        {interests.length > 0 && (
          <p><strong>Interests:</strong> {interests.join(", ")}</p>
        )}
      </div>

      <Link to="/" style={{ color: "#10b981", fontWeight: 600 }}>
        ← Back
      </Link>
    </div>
  );
}