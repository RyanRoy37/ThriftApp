import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPostSchema, insertRentalRequestSchema, insertCommentSchema } from "@shared/schema";
import multer from "multer";
import path from "path";

// Configure multer for image uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize badges
  await storage.initializeBadges();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserWithStats(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Post routes
  app.get("/api/posts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const posts = await storage.getPosts(limit, offset);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const post = await storage.getPost(req.params.id, userId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.post("/api/posts", isAuthenticated, upload.single("image"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      if (!req.file) {
        return res.status(400).json({ message: "Image is required" });
      }

      // In a real app, you'd upload to a cloud storage service
      // For now, we'll use a placeholder URL
      const imageUrl = `/uploads/${req.file.filename}`;

      const postData = {
        ...req.body,
        userId,
        imageUrl,
        tags: req.body.tags ? req.body.tags.split(",") : [],
        ecoPoints: parseInt(req.body.ecoPoints) || 50,
        waterSaved: req.body.waterSaved || "2.5",
        carbonReduced: req.body.carbonReduced || "1.2",
      };

      const validatedData = insertPostSchema.parse(postData);
      const post = await storage.createPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.get("/api/posts/user/:userId", async (req, res) => {
    try {
      const posts = await storage.getPostsByUser(req.params.userId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Failed to fetch user posts" });
    }
  });

  // Like routes
  app.post("/api/posts/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = req.params.id;
      const isLiked = await storage.toggleLike(userId, postId);
      res.json({ isLiked });
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  // Comment routes
  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByPost(req.params.id);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/posts/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = req.params.id;
      
      const commentData = {
        userId,
        postId,
        content: req.body.content,
      };

      const validatedData = insertCommentSchema.parse(commentData);
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Rental routes
  app.get("/api/rentals", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const rentals = await storage.getRentablePosts(limit, offset);
      res.json(rentals);
    } catch (error) {
      console.error("Error fetching rentals:", error);
      res.status(500).json({ message: "Failed to fetch rentals" });
    }
  });

  app.post("/api/rentals/request", isAuthenticated, async (req: any, res) => {
    try {
      const requesterId = req.user.claims.sub;
      
      const requestData = {
        ...req.body,
        requesterId,
      };

      const validatedData = insertRentalRequestSchema.parse(requestData);
      const request = await storage.createRentalRequest(validatedData);
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating rental request:", error);
      res.status(500).json({ message: "Failed to create rental request" });
    }
  });

  app.get("/api/rentals/my-requests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getRentalRequestsByUser(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching rental requests:", error);
      res.status(500).json({ message: "Failed to fetch rental requests" });
    }
  });

  // Badge routes
  app.get("/api/badges/user/:userId", async (req, res) => {
    try {
      const badges = await storage.getUserBadges(req.params.userId);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  // Serve uploaded images
  app.use("/uploads", (req, res, next) => {
    // In production, you'd serve from cloud storage
    res.status(404).json({ message: "Image not found" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
