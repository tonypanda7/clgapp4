import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getStorage } from "../storage";

interface AuthenticatedRequest extends Request {
  user?: any;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  createdAt: Date;
  updatedAt: Date;
}

// Middleware to verify JWT token
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Access token required" });
  }

  const jwtSecret = process.env.JWT_SECRET || "your-secret-key";

  jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
};

// Get posts with pagination
export const handleGetPosts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    authenticateToken(req, res, async () => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const storage = getStorage();
      
      try {
        // Get posts from database
        const posts = await storage.getAllPosts(limit, offset);
        
        // Get total count for pagination
        const totalPosts = await storage.getPostsCount();
        const hasMore = offset + posts.length < totalPosts;

        res.json({
          success: true,
          posts: posts.map(post => ({
            id: post.id,
            userId: post.userId,
            userName: post.userName,
            userAvatar: post.userAvatar,
            content: post.content,
            timestamp: post.timestamp,
            likes: post.likes || 0,
            comments: post.comments || 0
          })),
          hasMore,
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          totalPosts
        });
      } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch posts"
        });
      }
    });
  } catch (error) {
    console.error("Error in handleGetPosts:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Create a new post
export const handleCreatePost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    authenticateToken(req, res, async () => {
      const { content } = req.body;
      const user = req.user;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Post content is required"
        });
      }

      if (content.length > 5000) {
        return res.status(400).json({
          success: false,
          message: "Post content is too long (max 5000 characters)"
        });
      }

      const storage = getStorage();

      try {
        // Get user profile for display name and avatar
        const userProfile = await storage.getUserById(user.userId);
        
        const postData = {
          userId: user.userId,
          userName: userProfile?.fullName || user.fullName || "Unknown User",
          userAvatar: userProfile?.profilePicture || null,
          content: content.trim(),
          timestamp: new Date().toISOString(),
          likes: 0,
          comments: 0
        };

        const postId = await storage.createPost(postData);
        
        res.status(201).json({
          success: true,
          message: "Post created successfully",
          post: {
            id: postId,
            ...postData
          }
        });
      } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({
          success: false,
          message: "Failed to create post"
        });
      }
    });
  } catch (error) {
    console.error("Error in handleCreatePost:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get posts by user ID
export const handleGetUserPosts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    authenticateToken(req, res, async () => {
      const userId = req.params.userId || req.user.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const storage = getStorage();

      try {
        const posts = await storage.getUserPosts(userId, limit, offset);
        const totalPosts = await storage.getUserPostsCount(userId);
        const hasMore = offset + posts.length < totalPosts;

        res.json({
          success: true,
          posts: posts.map(post => ({
            id: post.id,
            userId: post.userId,
            userName: post.userName,
            userAvatar: post.userAvatar,
            content: post.content,
            timestamp: post.timestamp,
            likes: post.likes || 0,
            comments: post.comments || 0
          })),
          hasMore,
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          totalPosts
        });
      } catch (error) {
        console.error("Error fetching user posts:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch user posts"
        });
      }
    });
  } catch (error) {
    console.error("Error in handleGetUserPosts:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Like/unlike a post
export const handleTogglePostLike = async (req: AuthenticatedRequest, res: Response) => {
  try {
    authenticateToken(req, res, async () => {
      const postId = req.params.postId;
      const userId = req.user.userId;

      const storage = getStorage();

      try {
        const result = await storage.togglePostLike(postId, userId);
        
        res.json({
          success: true,
          message: result.liked ? "Post liked" : "Post unliked",
          liked: result.liked,
          likesCount: result.likesCount
        });
      } catch (error) {
        console.error("Error toggling post like:", error);
        res.status(500).json({
          success: false,
          message: "Failed to toggle post like"
        });
      }
    });
  } catch (error) {
    console.error("Error in handleTogglePostLike:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Delete a post
export const handleDeletePost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    authenticateToken(req, res, async () => {
      const postId = req.params.postId;
      const userId = req.user.userId;

      const storage = getStorage();

      try {
        // Check if user owns the post
        const post = await storage.getPostById(postId);
        if (!post) {
          return res.status(404).json({
            success: false,
            message: "Post not found"
          });
        }

        if (post.userId !== userId) {
          return res.status(403).json({
            success: false,
            message: "You can only delete your own posts"
          });
        }

        await storage.deletePost(postId);
        
        res.json({
          success: true,
          message: "Post deleted successfully"
        });
      } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({
          success: false,
          message: "Failed to delete post"
        });
      }
    });
  } catch (error) {
    console.error("Error in handleDeletePost:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
