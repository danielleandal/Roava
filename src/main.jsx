import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";


import Landing from "./pages/Landing.jsx";
import InitForm from "./pages/InitForm.jsx";
import Results from "./pages/Results.jsx"; // keep where it is (root)


import "./App.css";     // or your shared styles

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/plan" element={<InitForm />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);