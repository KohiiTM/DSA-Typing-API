const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const compression = require("compression");
const winston = require("winston");
const swaggerUi = require("swagger-ui-express");
const { body, param, validationResult } = require("express-validator");

const app = express();
const port = process.env.PORT || 3000;

// Configure Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// Swagger documentation
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "DSA Typing Practice API",
    version: "1.0.0",
    description: "API for DSA Typing Practice application",
  },
  servers: [
    {
      url: `http://localhost:${port}`,
      description: "Development server",
    },
  ],
  paths: {
    "/api/topics": {
      get: {
        summary: "Get all topics",
        responses: {
          200: {
            description: "List of all topics",
          },
        },
      },
    },
    "/api/topics/category/{category}": {
      get: {
        summary: "Get topics by category",
        parameters: [
          {
            name: "category",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "List of topics in the specified category",
          },
        },
      },
    },
    "/api/topics/random": {
      get: {
        summary: "Get a random topic",
        responses: {
          200: {
            description: "A random topic",
          },
        },
      },
    },
    "/api/categories": {
      get: {
        summary: "Get all categories",
        responses: {
          200: {
            description: "List of all categories",
          },
        },
      },
    },
    "/health": {
      get: {
        summary: "Health check endpoint",
        responses: {
          200: {
            description: "API is healthy",
          },
        },
      },
    },
  },
};

// Rate limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(limiter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Security middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Read topics data with caching
let topicsCache = null;
let lastCacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getTopics() {
  const now = Date.now();
  if (topicsCache && lastCacheTime && now - lastCacheTime < CACHE_DURATION) {
    return topicsCache;
  }

  try {
    const data = await fs.readFile(path.join(__dirname, "topics.json"), "utf8");
    topicsCache = JSON.parse(data).topics;
    lastCacheTime = now;
    return topicsCache;
  } catch (error) {
    logger.error("Error reading topics file", {
      error: error.message,
      path: path.join(__dirname, "topics.json"),
    });
    throw error;
  }
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Get all topics
app.get("/api/topics", async (req, res) => {
  try {
    const topics = await getTopics();
    logger.info("Successfully fetched all topics", { count: topics.length });
    res.json(topics);
  } catch (error) {
    logger.error("Failed to fetch topics", {
      error: error.message,
      stack: error.stack,
      code: error.code,
    });
    res.status(500).json({
      error: "Failed to fetch topics",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get topics by category
app.get(
  "/api/topics/category/:category",
  param("category").trim().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const topics = await getTopics();
      const categoryTopics = topics.filter(
        (topic) =>
          topic.category.toLowerCase() === req.params.category.toLowerCase()
      );
      logger.info(
        `Successfully fetched topics for category: ${req.params.category}`
      );
      res.json(categoryTopics);
    } catch (error) {
      logger.error("Failed to fetch topics by category", {
        error: error.message,
      });
      res.status(500).json({ error: "Failed to fetch topics by category" });
    }
  }
);

// Get random topic
app.get("/api/topics/random", async (req, res) => {
  try {
    const topics = await getTopics();
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    logger.info("Successfully fetched random topic");
    res.json(randomTopic);
  } catch (error) {
    logger.error("Failed to fetch random topic", { error: error.message });
    res.status(500).json({ error: "Failed to fetch random topic" });
  }
});

// Get all categories
app.get("/api/categories", async (req, res) => {
  try {
    const topics = await getTopics();
    const categories = [...new Set(topics.map((topic) => topic.category))];
    logger.info("Successfully fetched all categories");
    res.json(categories);
  } catch (error) {
    logger.error("Failed to fetch categories", { error: error.message });
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
  logger.info(
    `API documentation available at http://localhost:${port}/api-docs`
  );
});
