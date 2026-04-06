require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { createClient } = require('@supabase/supabase-js');

// Connect to Supabase using the credentials in our .env file
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// Main status route to check if the server is live
app.get("/", (req, res) => {
  res.send("<h1>NovaNews Intelligence is Online 🚀</h1>");
});

console.log("NOVANEWS BACKEND STARTING...");

// Fetch the news feed from NewsAPI based on the category
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

// Use Gemini to generate a 2-sentence summary of the article
app.post("/summarize", async (req, res) => {
  const { title, description } = req.body;
  
  // Make sure we don't send null descriptions to the AI
  const safeDescription = description || "Headline news update.";
  
  console.log("Summarizing:", title?.substring(0, 30));

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
    console.log("Summary sent successfully");
  } catch (error) {
    // Log the full error to the terminal if the AI call fails
    console.error("AI ERROR DETAIL:", error.response?.data || error.message);
    res.status(500).json({ error: "AI summary failed" });
  }
});

// Add an article to the saved_articles table
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
    // If the error code is 23505, it means the article is already in the DB
    if (error.code === '23505') return res.status(400).json({ error: "Already saved" });
    return res.status(500).json({ error: error.message });
  }
  res.json({ message: "Saved!", data });
});

// Remove an article from the user's library using its ID
app.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('saved_articles')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Article removed." });
});

// Fetch all saved articles for a specific user
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

app.listen(5000, () => console.log("Backend Ready: http://localhost:5000"));