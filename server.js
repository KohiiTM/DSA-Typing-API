const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Read topics data
async function getTopics() {
  const data = await fs.readFile(
    path.join(__dirname, "data", "topics.json"),
    "utf8"
  );
  return JSON.parse(data).topics;
}

// Get all topics
app.get("/api/topics", async (req, res) => {
  try {
    const topics = await getTopics();
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch topics" });
  }
});

// Get topics by category
app.get("/api/topics/category/:category", async (req, res) => {
  try {
    const topics = await getTopics();
    const categoryTopics = topics.filter(
      (topic) =>
        topic.category.toLowerCase() === req.params.category.toLowerCase()
    );
    res.json(categoryTopics);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch topics by category" });
  }
});

// Get random topic
app.get("/api/topics/random", async (req, res) => {
  try {
    const topics = await getTopics();
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    res.json(randomTopic);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch random topic" });
  }
});

// Get all categories
app.get("/api/categories", async (req, res) => {
  try {
    const topics = await getTopics();
    const categories = [...new Set(topics.map((topic) => topic.category))];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
