// backend/server.js
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors()); 
app.use(express.json());

// ---- put your real key here (backend only) ----
const OTM_KEY = "5ae2e3f221c38a28845f05b66888648c23a955442a5629972fd705cb";

// Root (optional)
app.get("/", (_req, res) => res.send("Roava backend up"));

// Simple smoke test
app.get("/api/ping", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Hardcoded test: geocode a fixed city
app.get("/api/test", async (_req, res) => {
  try {
    const city = "New York"; // hardcoded
    const geo = await fetch(
      `https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(city)}&apikey=${OTM_KEY}`
    ).then(r => r.json());
    res.json({ city, geo });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Main endpoint (can hardcode city if you want)
app.post("/api/plan", async (req, res) => {
    console.log("🔔 /api/plan called with:", req.body);
  try {
    const body = req.body || {};
    const city = body.city || "Tokyo";        // <-- hardcoded fallback
    const interests = body.interests || [];   // ["museums","food","views"]

//    const city = "Tokyo"; // hardcoded for now
  //  const interests = ["museums", "food", "views"];

    // 1) geocode
    const geo = await fetch(
      `https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(city)}&apikey=${OTM_KEY}`
    ).then(r => r.json());
    if (!geo?.lat || !geo?.lon) return res.status(404).json({ error: "City not found" });

    // 2) map interests -> kinds (simple)
    const MAP = {
      museums: "museums",
      food: "foods",
      views: "view_points",
      nature: "natural",
      shopping: "shops",
      history: "historic",
      nightlife: "adult",
    };
    const kinds = (interests.length ? interests : ["museums","food","views"])
      .map(i => MAP[i] || i)
      .join(",");

    // 3) fetch POIs
    const pois = await fetch(
      `https://api.opentripmap.com/0.1/en/places/radius?radius=5000&lon=${geo.lon}&lat=${geo.lat}&kinds=${kinds}&rate=2&format=json&apikey=${OTM_KEY}`
    ).then(r => r.json());

    res.json({ city, center: { lat: geo.lat, lon: geo.lon }, count: pois.length, pois });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch itinerary", detail: e.message });
  }
});

app.listen(3001, () => console.log("✅ Backend running at http://localhost:3001"));