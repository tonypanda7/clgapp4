// Storage Factory - Choose storage method via environment variable

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
  mediaType?: string; // e.g., 'image/jpeg', 'video/mp4'
  createdAt: Date;
  updatedAt: Date;
}

interface StorageInterface {
  // User methods
  addUser(user: User): Promise<void>;
  findUser(emailOrUsername: string): Promise<User | undefined>;
  findUserById(id: string): Promise<User | undefined>;
  findUserByVerificationToken(token: string): Promise<User | undefined>;
  updateUser(id: string, updates: Partial<User>): Promise<void>;
  emailExists(email: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  clearAllUsers(): Promise<void>;

  // Post methods
  createPost(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  getAllPosts(limit?: number, offset?: number): Promise<Post[]>;
  getPostsCount(): Promise<number>;
  getUserPosts(userId: string, limit?: number, offset?: number): Promise<Post[]>;
  getUserPostsCount(userId: string): Promise<number>;
  getPostById(postId: string): Promise<Post | undefined>;
  deletePost(postId: string): Promise<void>;
  togglePostLike(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }>;
  getUserById(userId: string): Promise<User | undefined>;
}

// In-Memory Storage (current implementation)
class MemoryStorage implements StorageInterface {
  private users: User[] = [];

  async addUser(user: User): Promise<void> {
    this.users.push(user);
  }

  async findUser(emailOrUsername: string): Promise<User | undefined> {
    return this.users.find(u =>
      u.universityEmail === emailOrUsername ||
      u.fullName.toLowerCase() === emailOrUsername.toLowerCase()
    );
  }

  async findUserById(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async findUserByVerificationToken(token: string): Promise<User | undefined> {
    return this.users.find(u => u.verificationToken === token);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates };
    }
  }

  async emailExists(email: string): Promise<boolean> {
    return this.users.some(u => u.universityEmail === email);
  }

  async getAllUsers(): Promise<User[]> {
    return [...this.users];
  }

  async clearAllUsers(): Promise<void> {
    this.users = [];
    console.log('All users cleared from memory storage');
  }

  // Post methods - placeholder implementations
  async createPost(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    throw new Error('Post methods not implemented for memory storage');
  }

  async getAllPosts(limit: number = 10, offset: number = 0): Promise<Post[]> {
    return [];
  }

  async getPostsCount(): Promise<number> {
    return 0;
  }

  async getUserPosts(userId: string, limit: number = 10, offset: number = 0): Promise<Post[]> {
    return [];
  }

  async getUserPostsCount(userId: string): Promise<number> {
    return 0;
  }

  async getPostById(postId: string): Promise<Post | undefined> {
    return undefined;
  }

  async deletePost(postId: string): Promise<void> {
    // No-op
  }

  async togglePostLike(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    return { liked: false, likesCount: 0 };
  }

  async getUserById(userId: string): Promise<User | undefined> {
    return this.findUserById(userId);
  }
}

// File Storage
class FileStorage implements StorageInterface {
  // Import and use the file storage methods
  async addUser(user: User): Promise<void> {
    const { addUser } = await import('./fileStorage');
    return addUser(user);
  }

  async findUser(emailOrUsername: string): Promise<User | undefined> {
    const { findUser } = await import('./fileStorage');
    return findUser(emailOrUsername);
  }

  async findUserById(id: string): Promise<User | undefined> {
    const { findUserById } = await import('./fileStorage');
    return findUserById(id);
  }

  async findUserByVerificationToken(token: string): Promise<User | undefined> {
    const { findUserByVerificationToken } = await import('./fileStorage');
    return findUserByVerificationToken(token);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const { updateUser } = await import('./fileStorage');
    return updateUser(id, updates);
  }

  async emailExists(email: string): Promise<boolean> {
    const { emailExists } = await import('./fileStorage');
    return emailExists(email);
  }

  async getAllUsers(): Promise<User[]> {
    const { loadUsers } = await import('./fileStorage');
    return loadUsers();
  }

  async clearAllUsers(): Promise<void> {
    const { clearAllUsers } = await import('./fileStorage');
    return clearAllUsers();
  }

  // Post methods - placeholder implementations
  async createPost(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    throw new Error('Post methods not implemented for file storage');
  }

  async getAllPosts(limit: number = 10, offset: number = 0): Promise<Post[]> {
    return [];
  }

  async getPostsCount(): Promise<number> {
    return 0;
  }

  async getUserPosts(userId: string, limit: number = 10, offset: number = 0): Promise<Post[]> {
    return [];
  }

  async getUserPostsCount(userId: string): Promise<number> {
    return 0;
  }

  async getPostById(postId: string): Promise<Post | undefined> {
    return undefined;
  }

  async deletePost(postId: string): Promise<void> {
    // No-op
  }

  async togglePostLike(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    return { liked: false, likesCount: 0 };
  }

  async getUserById(userId: string): Promise<User | undefined> {
    return this.findUserById(userId);
  }
}

// Database Storage (requires sqlite3 package)
class DatabaseStorage implements StorageInterface {
  async addUser(user: User): Promise<void> {
    try {
      const { getDatabase } = await import('./database');
      const db = getDatabase();
      return db.addUser(user);
    } catch (error) {
      console.error('Database not available, falling back to memory storage');
      throw new Error('SQLite3 not installed. Use file or memory storage instead.');
    }
  }

  async findUser(emailOrUsername: string): Promise<User | undefined> {
    try {
      const { getDatabase } = await import('./database');
      const db = getDatabase();
      return db.findUser(emailOrUsername);
    } catch (error) {
      throw new Error('SQLite3 not installed. Use file or memory storage instead.');
    }
  }

  async findUserById(id: string): Promise<User | undefined> {
    try {
      const { getDatabase } = await import('./database');
      const db = getDatabase();
      return db.findUserById(id);
    } catch (error) {
      throw new Error('SQLite3 not installed. Use file or memory storage instead.');
    }
  }

  async findUserByVerificationToken(token: string): Promise<User | undefined> {
    try {
      const { getDatabase } = await import('./database');
      const db = getDatabase();
      return db.findUserByVerificationToken(token);
    } catch (error) {
      throw new Error('SQLite3 not installed. Use file or memory storage instead.');
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    try {
      const { getDatabase } = await import('./database');
      const db = getDatabase();
      return db.updateUser(id, updates);
    } catch (error) {
      throw new Error('SQLite3 not installed. Use file or memory storage instead.');
    }
  }

  async emailExists(email: string): Promise<boolean> {
    try {
      const { getDatabase } = await import('./database');
      const db = getDatabase();
      return db.emailExists(email);
    } catch (error) {
      throw new Error('SQLite3 not installed. Use file or memory storage instead.');
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const { getDatabase } = await import('./database');
      const db = getDatabase();
      return db.getAllUsers();
    } catch (error) {
      throw new Error('SQLite3 not installed. Use file or memory storage instead.');
    }
  }

  async clearAllUsers(): Promise<void> {
    try {
      const { getDatabase } = await import('./database');
      const db = getDatabase();
      return db.clearAllUsers();
    } catch (error) {
      throw new Error('SQLite3 not installed. Use file or memory storage instead.');
    }
  }

  // Post methods
  async createPost(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const { getDatabase } = await import('./database');
      const db = getDatabase();
      return db.createPost(postData);
    } catch (error) {
      throw new Error('SQLite3 not installed. Use file or memory storage instead.');
    }
  }

  async getAllPosts(limit: number = 10, offset: number = 0): Promise<Post[]> {
    try {
      const { getDatabase } = await import('./database');
      const db = getDatabase();
      return db.getAllPosts(limit, offset);
    } catch (error) {
      throw new Error('SQLite3 not installed. Use file or memory storage instead.');
    }
  }

  async getPostsCount(): Promise<number> {
    try {
      const { getDatabase } = await import('./database');
      const db = getDatabase();
      return db.getPostsCount();
    } catch (error) {
      throw new Error('SQLite3 not installed. Use file or memory storage instead.');
    }
  }

  async getUserPosts(userId: string, limit: number = 10, offset: number = 0): Promise<Post[]> {
    try {
      const { getDatabase } = await import('./database');
      const db = getDatabase();
      return db.getUserPosts(userId, limit, offset);
    } catch (error) {
      throw new Error('SQLite3 not installed. Use file or memory storage instead.');
    }
  }

  async getUserPostsCount(userId: string): Promise<number> {
    try {
      const { getDatabase } = await import('./database');
      const db = getDatabase();
      return db.getUserPostsCount(userId);
    } catch (error) {
      throw new Error('SQLite3 not installed. Use file or memory storage instead.');
    }
  }

  async getPostById(postId: string): Promise<Post | undefined> {
    try {
      const { getDatabase } = await import('./database');
      const db = getDatabase();
      return db.getPostById(postId);
    } catch (error) {
      throw new Error('SQLite3 not installed. Use file or memory storage instead.');
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      const { getDatabase } = await import('./database');
      const db = getDatabase();
      return db.deletePost(postId);
    } catch (error) {
      throw new Error('SQLite3 not installed. Use file or memory storage instead.');
    }
  }

  async togglePostLike(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    try {
      const { getDatabase } = await import('./database');
      const db = getDatabase();
      return db.togglePostLike(postId, userId);
    } catch (error) {
      throw new Error('SQLite3 not installed. Use file or memory storage instead.');
    }
  }

  async getUserById(userId: string): Promise<User | undefined> {
    try {
      const { getDatabase } = await import('./database');
      const db = getDatabase();
      return db.getUserById(userId);
    } catch (error) {
      throw new Error('SQLite3 not installed. Use file or memory storage instead.');
    }
  }
}

// Storage Factory
function createStorage(): StorageInterface {
  const storageType = process.env.STORAGE_TYPE || 'database';

  switch (storageType.toLowerCase()) {
    case 'file':
      console.log('Using file storage in ./data/users.json');
      return new FileStorage();
    
    case 'database':
    case 'sqlite':
      console.log('Using SQLite database in ./data/users.db');
      return new DatabaseStorage();
    
    case 'memory':
      console.log('Using in-memory storage (data will be lost on restart)');
      return new MemoryStorage();

    default:
      console.log('Using SQLite database storage (persistent)');
      return new DatabaseStorage();
  }
}

// Singleton storage instance
let storageInstance: StorageInterface | null = null;

export function getStorage(): StorageInterface {
  if (!storageInstance) {
    storageInstance = createStorage();
  }
  return storageInstance;
}

export { User, Post, StorageInterface };
