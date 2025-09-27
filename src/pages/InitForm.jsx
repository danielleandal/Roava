import { useState } from "react";
import "./InitForm.css";

export default function InitForm() {
  const [city, setCity] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [pace, setPace] = useState("normal");

  function handleSubmit(e) {
    e.preventDefault();
    alert(`Building itinerary for ${city} (${start} → ${end}, pace: ${pace})`);
  }

  return (
    <div className="container">
      <h1>Roava AI</h1>
      <p>AI-powered itineraries for solo travelers ✈️</p>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div>
            <label>Destination City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Tokyo"
            />
          </div>

          <div>
            <label>Start Date</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>

          <div>
            <label>End Date</label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>

          <div>
            <label>Trip Pace</label>
            <select value={pace} onChange={(e) => setPace(e.target.value)}>
              <option value="chill">😌 Chill</option>
              <option value="normal">🙂 Normal</option>
              <option value="packed">⚡ Packed</option>
            </select>
          </div>

          <button type="submit">Build Itinerary</button>
        </form>
      </div>

      <footer style={{ marginTop: "2rem", color: "#94a3b8", fontSize: "0.9rem" }}>
        Built at Hackathon • 2025
      </footer>
    </div>
  );
}

