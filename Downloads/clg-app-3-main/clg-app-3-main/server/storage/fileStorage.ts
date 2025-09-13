import fs from 'fs/promises';
import path from 'path';

interface User {
  id: string;
  fullName: string;
  universityEmail: string;
  password: string;
  phoneNumber: string;
  universityName: string;
  universityId: string;
  program: string;
  yearOfStudy: string;
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

const DATA_FILE = path.join(process.cwd(), 'data', 'users.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load users from file
export async function loadUsers(): Promise<User[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const users = JSON.parse(data);
    // Convert date strings back to Date objects
    return users.map((user: any) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      verificationTokenExpiry: user.verificationTokenExpiry ? new Date(user.verificationTokenExpiry) : undefined
    }));
  } catch (error) {
    // File doesn't exist or is empty, return empty array
    return [];
  }
}

// Save users to file
export async function saveUsers(users: User[]): Promise<void> {
  try {
    await ensureDataDir();
    await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving users:', error);
    throw error;
  }
}

// Add a new user
export async function addUser(user: User): Promise<void> {
  const users = await loadUsers();
  users.push(user);
  await saveUsers(users);
}

// Find user by email or username
export async function findUser(emailOrUsername: string): Promise<User | undefined> {
  const users = await loadUsers();
  return users.find(u => 
    u.universityEmail === emailOrUsername || 
    u.fullName.toLowerCase() === emailOrUsername.toLowerCase()
  );
}

// Find user by ID
export async function findUserById(id: string): Promise<User | undefined> {
  const users = await loadUsers();
  return users.find(u => u.id === id);
}

export async function findUserByVerificationToken(token: string): Promise<User | undefined> {
  const users = await loadUsers();
  return users.find(u => u.verificationToken === token);
}

export async function updateUser(id: string, updates: Partial<User>): Promise<void> {
  const users = await loadUsers();
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates };
    await saveUsers(users);
  }
}

export async function clearAllUsers(): Promise<void> {
  await saveUsers([]);
  console.log('All users cleared from file storage');
}

// Check if email exists
export async function emailExists(email: string): Promise<boolean> {
  const users = await loadUsers();
  return users.some(u => u.universityEmail === email);
}
