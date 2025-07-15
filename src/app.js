import express from "express";
import "dotenv/config";
import { pool } from "./config/db.js";

const app = express();

app.use(express.json());

// Create a posts
app.post("/posts", async (req, res) => {
  try {
    const { title, content, tags, category } = req.body;
    const createdAt = new Date();
    const updatedAt = new Date();

    let tagsJsonb;
    if (typeof tags === "string") {
      tagsJsonb = JSON.stringify(tags.split(",").map((tag) => tag.trim()));
    } else if (Array.isArray(tags)) {
      tagsJsonb = JSON.stringify(tags);
    } else {
      tagsJsonb = JSON.stringify([]);
    }
    await pool.query(
      "INSERT INTO posts (title, content,created_at, updated_at, tags, category ) VALUES ($1, $2, $3, $4, $5, $6)  ",
      [title, content, createdAt, updatedAt, tagsJsonb, category]
    );

    res.status(201).send("Resource created correctly");
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create the resource" });
  }
});

// retrieve all posts
app.get("/posts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts");
    const categories = result.rows;
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch a post" });
  }
});

//retrieve a specific post

app.get("/posts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts");
    const posts = result.rows;
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch a post" });
  }
});
//retrieve a specific post

app.get("/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const postId = parseInt(id, 10);
    if (!postId) return res.status(400).json({ error: "Invalid post ID" });

    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [
      postId,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Failed to fetch post with id ${id}:`, error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// Delete a post

app.delete("/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const postId = parseInt(id, 10);
    if (!postId) return res.status(400).json({ error: "Invalid post ID" });

    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [
      postId,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Post not found" });

    const deletedPost = result.rows[0];

    await pool.query("DELETE FROM posts WHERE id = $1", [postId]);

    return res.status(204).json(deletedPost);
  } catch (error) {
    console.error(`Failed to delete post with id ${id}:`, error);
    return res.status(500).json({ error: "Failed to delete post" });
  }
});

// Update a post

app.put("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content, tags, category } = req.body;

  try {
    let tagsJsonb;
    if (typeof tags === "string") {
      tagsJsonb = JSON.stringify(tags.split(",").map((tag) => tag.trim()));
    } else if (Array.isArray(tags)) {
      tagsJsonb = JSON.stringify(tags);
    } else {
      tagsJsonb = JSON.stringify([]);
    }
    const postId = parseInt(id, 10);
    if (!postId) return res.status(400).json({ error: "Invalid post ID" });

    const updatedAt = new Date();

    const result = await pool.query(
      "UPDATE posts SET title = $1, content = $2, tags = $3, category = $4, updated_at = $5 WHERE id = $6",
      [title, content, tagsJsonb, category, updatedAt, postId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update post" });
  }
});

export default app;
