require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { createClient } = require('@supabase/supabase-js');

// 1. Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// 🏠 Status Route
app.get("/", (req, res) => {
  res.send("<h1>NovaNews Intelligence is Online 🚀</h1>");
});

console.log("🔥 NOVANEWS BACKEND STARTING...");

/** 📰 LIVE NEWS FEED */
app.get("/news", async (req, res) => {
  const category = req.query.category || "general";
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${process.env.NEWS_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "News error" });
  }
});

/** 🤖 AI SUMMARIZATION (Verified v1 Logic) */
app.post("/summarize", async (req, res) => {
  const { title, description } = req.body;
  
  // Safety: Gemini hates null inputs
  const safeDescription = description || "Headline news update.";
  
  console.log("✨ Summarizing:", title?.substring(0, 30));

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `Summarize this news in exactly 2 short, professional sentences. No options. Just the summary.\nTitle: ${title}\nContext: ${safeDescription}`
          }]
        }]
      }
    );

    const summary = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Summary unavailable.";
    res.json({ summary: summary.trim() });
    console.log("✅ Summary sent successfully");
  } catch (error) {
    // Check your VS Code terminal for this log if you see a 500 error
    console.error("❌ AI ERROR DETAIL:", error.response?.data || error.message);
    res.status(500).json({ error: "AI summary failed" });
  }
});

/** 💾 SAVE TO VAULT */
app.post("/save", async (req, res) => {
  const { title, description, url, urlToImage, summary, user_id } = req.body;
  const { data, error } = await supabase
    .from('saved_articles')
    .insert([{ 
      title, 
      description, 
      url, 
      url_to_image: urlToImage, 
      summary, 
      user_id 
    }]);

  if (error) {
    if (error.code === '23505') return res.status(400).json({ error: "Already saved" });
    return res.status(500).json({ error: error.message });
  }
  res.json({ message: "Saved!", data });
});

/** 🗑️ DELETE FROM VAULT */
app.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('saved_articles')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Article removed." });
});

/** 📥 FETCH LIBRARY */
app.get("/saved", async (req, res) => {
  const { userId } = req.query;
  const { data, error } = await supabase
    .from('saved_articles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.listen(5000, () => console.log("✅ Backend Ready: http://localhost:5000"));