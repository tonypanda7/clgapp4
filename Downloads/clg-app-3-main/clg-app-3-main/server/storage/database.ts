// SQLite Database Setup (requires sqlite3 package)
// Run: npm install sqlite3 @types/sqlite3

import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

interface User {
  id: string;
  fullName: string;
  universityEmail: string;
  password: string;
  phoneNumber?: string;
  universityName?: string;
  universityId?: string;
  program?: string;
  yearOfStudy?: string;
  createdAt: Date;
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  collegeData?: {
    department: string;
    courses: string[];
    academicYear: string;
    semester: string;
    advisor?: string;
    gpa?: number;
  };
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
  mediaUrl?: string;
  mediaType?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PostLike {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}

const DB_PATH = path.join(process.cwd(), 'data', 'users.db');

class Database {
  private db: any;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Don't initialize in constructor, do it lazily
  }

  private async ensureDataDirectory() {
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  private async initializeDatabase() {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._doInitialize();
    await this.initPromise;
  }

  private async _doInitialize() {
    try {
      await this.ensureDataDirectory();
      
      const sqlite3 = await import('sqlite3');
      this.db = new sqlite3.default.Database(DB_PATH, (err) => {
        if (err) {
          console.error('SQLite connection error:', err);
          throw err;
        }
      });

      const run = promisify(this.db.run.bind(this.db));

      // Create users table if it doesn't exist
      await run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          fullName TEXT NOT NULL,
          universityEmail TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          phoneNumber TEXT,
          universityName TEXT,
          universityId TEXT,
          program TEXT,
          yearOfStudy TEXT,
          isEmailVerified BOOLEAN DEFAULT 0,
          verificationToken TEXT,
          verificationTokenExpiry DATETIME,
          collegeData TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create posts table if it doesn't exist
      await run(`
        CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          userName TEXT NOT NULL,
          userAvatar TEXT,
          content TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          likes INTEGER DEFAULT 0,
          comments INTEGER DEFAULT 0,
          mediaUrl TEXT,
          mediaType TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Create post_likes table for tracking likes
      await run(`
        CREATE TABLE IF NOT EXISTS post_likes (
          id TEXT PRIMARY KEY,
          postId TEXT NOT NULL,
          userId TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(postId, userId),
          FOREIGN KEY (postId) REFERENCES posts (id) ON DELETE CASCADE,
          FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Add new columns to existing tables (migration)
      try {
        await run(`ALTER TABLE users ADD COLUMN isEmailVerified BOOLEAN DEFAULT 0`);
      } catch (e) { /* Column already exists */ }
      
      try {
        await run(`ALTER TABLE users ADD COLUMN verificationToken TEXT`);
      } catch (e) { /* Column already exists */ }
      
      try {
        await run(`ALTER TABLE users ADD COLUMN verificationTokenExpiry DATETIME`);
      } catch (e) { /* Column already exists */ }
      
      try {
        await run(`ALTER TABLE users ADD COLUMN collegeData TEXT`);
      } catch (e) { /* Column already exists */ }

      // Add media columns to posts table if missing
      try {
        await run(`ALTER TABLE posts ADD COLUMN mediaUrl TEXT`);
      } catch (e) { /* Column already exists */ }
      try {
        await run(`ALTER TABLE posts ADD COLUMN mediaType TEXT`);
      } catch (e) { /* Column already exists */ }

      this.initialized = true;
      console.log('SQLite database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw new Error('SQLite3 package not installed or database initialization failed. Run: npm install sqlite3 @types/sqlite3');
    }
  }

  async addUser(user: User): Promise<void> {
    await this.initializeDatabase();
    const run = promisify(this.db.run.bind(this.db));
    
    await run(`
      INSERT INTO users (
        id, fullName, universityEmail, password, phoneNumber,
        universityName, universityId, program, yearOfStudy, isEmailVerified,
        verificationToken, verificationTokenExpiry, collegeData, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      user.id, user.fullName, user.universityEmail, user.password,
      user.phoneNumber, user.universityName, user.universityId,
      user.program, user.yearOfStudy, user.isEmailVerified,
      user.verificationToken, 
      user.verificationTokenExpiry?.toISOString(),
      user.collegeData ? JSON.stringify(user.collegeData) : null,
      user.createdAt.toISOString()
    ]);
  }

  async findUser(emailOrUsername: string): Promise<User | undefined> {
    await this.initializeDatabase();
    const get = promisify(this.db.get.bind(this.db));
    
    const row = await get(`
      SELECT * FROM users 
      WHERE universityEmail = ? OR LOWER(fullName) = LOWER(?)
    `, [emailOrUsername, emailOrUsername]);

    return row ? this.rowToUser(row) : undefined;
  }

  async findUserById(id: string): Promise<User | undefined> {
    await this.initializeDatabase();
    const get = promisify(this.db.get.bind(this.db));
    
    const row = await get(`SELECT * FROM users WHERE id = ?`, [id]);
    return row ? this.rowToUser(row) : undefined;
  }

  async findUserByVerificationToken(token: string): Promise<User | undefined> {
    await this.initializeDatabase();
    const get = promisify(this.db.get.bind(this.db));
    
    const row = await get(`
      SELECT * FROM users WHERE verificationToken = ?
    `, [token]);

    return row ? this.rowToUser(row) : undefined;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    await this.initializeDatabase();
    const run = promisify(this.db.run.bind(this.db));
    
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'collegeData' && value) {
        fields.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      } else if (key === 'verificationTokenExpiry' && value) {
        fields.push(`${key} = ?`);
        values.push(value.toISOString());
      } else if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length > 0) {
      values.push(id);
      await run(`
        UPDATE users SET ${fields.join(', ')} WHERE id = ?
      `, values);
    }
  }

  async emailExists(email: string): Promise<boolean> {
    await this.initializeDatabase();
    const get = promisify(this.db.get.bind(this.db));
    
    const row = await get(`
      SELECT COUNT(*) as count FROM users WHERE universityEmail = ?
    `, [email]);

    return row.count > 0;
  }

  async getAllUsers(): Promise<User[]> {
    await this.initializeDatabase();
    const all = promisify(this.db.all.bind(this.db));

    const rows = await all(`SELECT * FROM users ORDER BY createdAt DESC`);
    return rows.map(row => this.rowToUser(row));
  }

  async clearAllUsers(): Promise<void> {
    await this.initializeDatabase();
    const run = promisify(this.db.run.bind(this.db));

    await run(`DELETE FROM users`);
    console.log('All users cleared from database');
  }

  // Posts methods
  async createPost(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await this.initializeDatabase();
    const run = promisify(this.db.run.bind(this.db));

    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await run(`
      INSERT INTO posts (
        id, userId, userName, userAvatar, content, timestamp, likes, comments, mediaUrl, mediaType, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      postId, postData.userId, postData.userName, postData.userAvatar,
      postData.content, postData.timestamp, postData.likes, postData.comments,
      postData.mediaUrl || null, postData.mediaType || null,
      now, now
    ]);

    return postId;
  }

  async getAllPosts(limit: number = 10, offset: number = 0): Promise<Post[]> {
    await this.initializeDatabase();
    const all = promisify(this.db.all.bind(this.db));

    const rows = await all(`
      SELECT * FROM posts
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    return rows.map(row => this.rowToPost(row));
  }

  async getPostsCount(): Promise<number> {
    await this.initializeDatabase();
    const get = promisify(this.db.get.bind(this.db));

    const row = await get(`SELECT COUNT(*) as count FROM posts`);
    return row.count;
  }

  async getUserPosts(userId: string, limit: number = 10, offset: number = 0): Promise<Post[]> {
    await this.initializeDatabase();
    const all = promisify(this.db.all.bind(this.db));

    const rows = await all(`
      SELECT * FROM posts
      WHERE userId = ?
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);

    return rows.map(row => this.rowToPost(row));
  }

  async getUserPostsCount(userId: string): Promise<number> {
    await this.initializeDatabase();
    const get = promisify(this.db.get.bind(this.db));

    const row = await get(`
      SELECT COUNT(*) as count FROM posts WHERE userId = ?
    `, [userId]);

    return row.count;
  }

  async getPostById(postId: string): Promise<Post | undefined> {
    await this.initializeDatabase();
    const get = promisify(this.db.get.bind(this.db));

    const row = await get(`SELECT * FROM posts WHERE id = ?`, [postId]);
    return row ? this.rowToPost(row) : undefined;
  }

  async deletePost(postId: string): Promise<void> {
    await this.initializeDatabase();
    const run = promisify(this.db.run.bind(this.db));

    // Delete associated likes first
    await run(`DELETE FROM post_likes WHERE postId = ?`, [postId]);

    // Delete the post
    await run(`DELETE FROM posts WHERE id = ?`, [postId]);
  }

  async togglePostLike(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    await this.initializeDatabase();
    const run = promisify(this.db.run.bind(this.db));
    const get = promisify(this.db.get.bind(this.db));

    // Check if user already liked this post
    const existingLike = await get(`
      SELECT * FROM post_likes WHERE postId = ? AND userId = ?
    `, [postId, userId]);

    let liked: boolean;

    if (existingLike) {
      // Unlike the post
      await run(`DELETE FROM post_likes WHERE postId = ? AND userId = ?`, [postId, userId]);
      await run(`UPDATE posts SET likes = likes - 1 WHERE id = ?`, [postId]);
      liked = false;
    } else {
      // Like the post
      const likeId = `like_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await run(`
        INSERT INTO post_likes (id, postId, userId, createdAt)
        VALUES (?, ?, ?, ?)
      `, [likeId, postId, userId, new Date().toISOString()]);

      await run(`UPDATE posts SET likes = likes + 1 WHERE id = ?`, [postId]);
      liked = true;
    }

    // Get updated likes count
    const post = await get(`SELECT likes FROM posts WHERE id = ?`, [postId]);

    return {
      liked,
      likesCount: post ? post.likes : 0
    };
  }

  async getUserById(userId: string): Promise<User | undefined> {
    return this.findUserById(userId);
  }

  private rowToPost(row: any): Post {
    return {
      id: row.id,
      userId: row.userId,
      userName: row.userName,
      userAvatar: row.userAvatar || undefined,
      content: row.content,
      timestamp: row.timestamp,
      likes: row.likes,
      comments: row.comments,
      mediaUrl: row.mediaUrl || undefined,
      mediaType: row.mediaType || undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }

  private rowToUser(row: any): User {
    return {
      ...row,
      createdAt: new Date(row.createdAt),
      isEmailVerified: Boolean(row.isEmailVerified),
      verificationTokenExpiry: row.verificationTokenExpiry ? new Date(row.verificationTokenExpiry) : undefined,
      collegeData: row.collegeData ? JSON.parse(row.collegeData) : undefined
    };
  }

  close(): void {
    if (this.db) {
      this.db.close();
    }
  }
}

// Singleton instance
let dbInstance: Database | null = null;

export function getDatabase(): Database {
  if (!dbInstance) {
    dbInstance = new Database();
  }
  return dbInstance;
}

export { Database, User, Post, PostLike };
