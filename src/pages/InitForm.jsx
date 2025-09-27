import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./InitForm.css"; 

const INTEREST_OPTIONS = ["museums", "food", "views", "nature", "shopping", "history", "nightlife"];

export default function InitForm() {
  const navigate = useNavigate();

  const [city, setCity] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [pace, setPace] = useState("normal");
  const [interests, setInterests] = useState(["museums", "food", "views"]);
  const [showInterests, setShowInterests] = useState(false);
  const [error, setError] = useState("");

  //New
  const [suggestions, setSuggestions] = useState([]);


  function toggleInterest(option) {
    setInterests(prev =>
      prev.includes(option) ? prev.filter(i => i !== option) : [...prev, option]
    );
  }

function handleSubmit(e) {
  e.preventDefault();
  if (!city.trim()) return setError("Please enter a destination city.");
  if (!start || !end) return setError("Please pick your start and end dates.");
  if (new Date(end) <= new Date(start)) return setError("End date must be after start date.");

  setError("");

  // normalize: strip country if present
  const normalizedCity = city.split(",")[0].trim();

  const qs = new URLSearchParams({
    city: normalizedCity,
    start,
    end,
    pace,
    interests: interests.join(","),
  }).toString();

  navigate(`/results?${qs}`);
}



  // New Stuff Starts Here
    // Debounce: wait 500ms after typing before fetching
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (city.length > 1) {
        fetchCities(city);
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [city]);

  async function fetchCities(query) {
    try {
      const response = await axios.get(
        "https://wft-geo-db.p.rapidapi.com/v1/geo/cities",
        {
          params: { namePrefix: query, limit: 5 }, // limit results
          headers: {
            "X-RapidAPI-Key": "60658e8902mshd0a9b932fe0c38bp1d8674jsn604ed8123a7e", // replace with your key
            "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
          },
        }
      );

        const seen = new Set();
        const results = response.data.data
        .map((c) => `${c.city}, ${c.country}`)
        .filter((item) => {
            if (seen.has(item)) return false;
            seen.add(item);
            return true;
        });

        setSuggestions(results);

    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      
    }
  }

  function handleSelect(suggestion) {
    setCity(suggestion);
    setSuggestions([]); // hide dropdown
  }


  return (
    <div className="container">
      <h1>Roava AI</h1>
      <p>AI-powered itineraries for solo travelers ✈️</p>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ position: "relative" }}>
            <label>Destination City</label>
            <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Tokyo"
                autoComplete="off"
            />


            {suggestions.length > 0 && (
                <ul className="suggestions">
                {suggestions.map((s, i) => (
                    <li key={i} onClick={() => handleSelect(s)}>
                    {s}
                    </li>
                ))}
                </ul>
            )}
            </div>


          <div>
            <label>Start Date</label>
            <input type="date" value={start} onChange={(e)=>setStart(e.target.value)} />
          </div>

          <div>
            <label>End Date</label>
            <input type="date" value={end} onChange={(e)=>setEnd(e.target.value)} />
          </div>

          <div>
            <label>Trip Pace</label>
            <select value={pace} onChange={(e)=>setPace(e.target.value)}>
              <option value="chill">😌 Chill</option>
              <option value="normal">🙂 Normal</option>
              <option value="packed">⚡ Packed</option>
            </select>
          </div>

          <div>
            <label>Interests</label>

            {/* Toggle button */}
            <button
              type="button"
              onClick={() => setShowInterests(v => !v)}
              aria-expanded={showInterests}
              aria-controls="interests-panel"
              style={{
                width:"100%", textAlign:"left", padding:"0.75rem", borderRadius:"10px",
                border:"1px solid #475569", background:"#0f172a", color:"#e5e7eb",
                display:"flex", alignItems:"center", justifyContent:"space-between",
                marginBottom: showInterests ? "0.5rem" : "1rem", cursor:"pointer"
              }}
            >
              <span>{interests.length ? `Selected (${interests.length})` : "Choose interests"}</span>
              <span style={{ transform: showInterests ? "rotate(180deg)" : "rotate(0deg)", transition:"transform .15s" }}>▾</span>
            </button>

            {/* Panel */}
            {showInterests && (
              <div id="interests-panel" role="region" aria-label="Interests"
                   style={{ border:"1px solid #475569", background:"rgba(31,41,55,.85)",
                            borderRadius:"12px", padding:"0.75rem", marginBottom:"1rem" }}>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"0.6rem" }}>
                  {INTEREST_OPTIONS.map(opt => {
                    const active = interests.includes(opt);
                    return (
                      <button
                        type="button" key={opt} onClick={() => toggleInterest(opt)}
                        style={{
                          padding:"0.45rem 0.75rem", borderRadius:"999px", border:"1px solid",
                          borderColor: active ? "#10b981" : "#475569",
                          background: active ? "rgba(16,185,129,.15)" : "#0f172a",
                          color: active ? "#d1fae5" : "#e5e7eb", fontSize:".95rem", cursor:"pointer"
                        }}
                        aria-pressed={active}
                      >
                        {opt.charAt(0).toUpperCase()+opt.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {error && <div style={{ color:"#fca5a5", fontSize:".95rem", marginTop:".25rem" }}>{error}</div>}

          <button type="submit" style={{ marginTop:"0.5rem" }}>Build Itinerary</button>
        </form>
      </div>

      <footer>Built at Hackathon • 2025</footer>
    </div>
  );
}