// backend/server.js
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors()); 
app.use(express.json());
app.use(express.json({ limit: "1mb" }));  

const GEMINI_KEY = "AIzaSyAIrnbvxShddUFOhN-J5Z4Zvc4EIrdG_OU";
const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const gemini = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ---- put your real key here (backend only) ----
const OTM_KEY = "5ae2e3f221c38a28845f05b66888648c23a955442a5629972fd705cb";

app.listen(3001, "0.0.0.0", () => {
  console.log("✅ Backend running at http://45.55.91.156:3001/");
});


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


// NEW: AI polish endpoint
app.post("/api/polish", async (req, res) => {
  try {
    const { city = "", start = "", end = "", pace = "normal", pois = [] } = req.body || {};
    if (!pois || pois.length === 0) {
      return res.status(400).json({ error: "No POIs provided" });
    }

    // Keep it compact (LLMs don’t need every field)
    const compact = pois
      .slice(0, 40) // cap to 40 POIs to keep the prompt light
      .map(p => `- ${p.name || "Unnamed"} | ${p.kinds || ""} | rate ${p.rate ?? "-"}`)
      .join("\n");

    const prompt = `
        You are an expert solo-travel planner. Build a ${pace} itinerary for ${city}
        for the dates ${start || "(start not given)"} → ${end || "(end not given)"}.
        Use the POIs below. Prefer central, safe, daytime activities. Group by area to minimize travel.
        Return clean Markdown with "Day 1", "Day 2", ... and bullets with 1-sentence explanations.
        Limit yourself to the POIs below. Filter through why a specific POI is important is safe for solo
        travelers. 

        POIs:
        ${compact}
`;

    const result = await gemini.generateContent(prompt);
    const text = result.response.text();
    res.json({ ok: true, text });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Failed to polish itinerary" });
  }
});

// Quick Gemini API test
app.get("/api/gemini-test", async (_req, res) => {
  try {
    const result = await gemini.generateContent("Say 'API key works' only.");
    res.json({ ok: true, text: result.response.text() });
  } catch (err) {
    console.error("Gemini test error:", err?.message || err);
    res.status(500).json({ ok: false, error: err?.message || "Unknown error" });
  }
});


