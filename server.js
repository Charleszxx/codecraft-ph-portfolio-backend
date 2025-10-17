import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// serve your frontend
app.use(express.static(path.join(__dirname, "public")));

// proxy endpoint for iframe requests
app.get("/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send("Missing ?url parameter");

  try {
    const response = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0 (CodeCraftBrowser)" },
    });
    let contentType = response.headers.get("content-type") || "text/html";
    let text = await response.text();

    // remove frame-blocking headers
    res.set("Content-Type", contentType);
    res.removeHeader("X-Frame-Options");
    res.removeHeader("Content-Security-Policy");
    res.send(text);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send(`<h2>Failed to load ${target}</h2><p>${err.message}</p>`);
  }
});

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 CodeCraft PH Browser running on port ${PORT}`));
