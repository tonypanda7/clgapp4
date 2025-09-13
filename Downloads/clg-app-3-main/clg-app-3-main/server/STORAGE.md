# Data Storage Configuration

Your user data can be stored in three different ways. Choose the option that best fits your needs.

## 🗂️ **Storage Options**

### **1. In-Memory Storage (Default - Temporary)**
- **Location**: Server RAM
- **Persistence**: ❌ Data lost on server restart
- **Best for**: Development, testing
- **Setup**: No configuration needed (default)

```bash
# Uses memory storage (default)
npm run dev
```

### **2. File Storage (Simple - Persistent)**
- **Location**: `./data/users.json`
- **Persistence**: ✅ Data saved to file
- **Best for**: Small projects, development
- **Setup**: Set environment variable

```bash
# Use file storage
export STORAGE_TYPE=file
npm run dev

# Or in one command
STORAGE_TYPE=file npm run dev
```

**File location**: `./data/users.json`
```json
[
  {
    "id": "abc123",
    "fullName": "John Doe",
    "universityEmail": "john@university.edu",
    "password": "hashedpassword",
    "phoneNumber": "+1234567890",
    "universityName": "Test University",
    "universityId": "STUD123",
    "program": "Computer Science",
    "yearOfStudy": "3rd",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### **3. SQLite Database (Recommended - Production)**
- **Location**: `./data/users.db`
- **Persistence**: ✅ Full database features
- **Best for**: Production, complex queries
- **Setup**: Install dependencies + set environment

```bash
# Install SQLite (optional - for advanced features)
npm install sqlite3 @types/sqlite3

# Use database storage
export STORAGE_TYPE=database
npm run dev

# Or in one command
STORAGE_TYPE=database npm run dev
```

## 🔄 **Switching Storage Types**

You can switch between storage types at any time:

```bash
# Start with memory storage
npm run dev

# Switch to file storage (data will be empty initially)
STORAGE_TYPE=file npm run dev

# Switch to database storage (data will be empty initially)
STORAGE_TYPE=database npm run dev
```

⚠️ **Note**: Data is NOT automatically migrated between storage types.

## 📁 **Data Directory Structure**

```
project-root/
├── data/               # Created automatically
│   ├── users.json      # File storage
│   └── users.db        # SQLite database
├── server/
│   └── storage/
│       ├── index.ts    # Storage factory
│       ├── fileStorage.ts
│       └── database.ts
└── ...
```

## 🔒 **Security Considerations**

### **Current Implementation (Development)**
- Passwords stored in plain text
- Simple token system

### **Production Recommendations**
- Hash passwords with bcrypt
- Use proper JWT tokens
- Add database indexes
- Implement rate limiting
- Use HTTPS only

## 🛠️ **Environment Variables**

Create a `.env` file in your project root:

```env
# Storage configuration
STORAGE_TYPE=file          # memory | file | database

# Security (add these for production)
JWT_SECRET=your-secret-key
PASSWORD_SALT_ROUNDS=12
```

## 📊 **Storage Comparison**

| Feature | Memory | File | Database |
|---------|--------|------|----------|
| Persistence | ❌ | ✅ | ✅ |
| Performance | ⚡ Fast | 🐌 Slow | ⚡ Fast |
| Concurrent Users | ❌ Limited | ❌ Limited | ✅ Good |
| Query Capabilities | ❌ Basic | ❌ Basic | ✅ Advanced |
| Backup | ❌ None | ✅ Copy file | ✅ Export |
| Production Ready | ❌ No | ⚠️ Small scale | ✅ Yes |

## 🧪 **Testing Storage**

Use the API test page at `/api-test` to:
1. Create test users
2. Verify data persistence
3. Test login/logout flow
4. Check user retrieval

## 🚀 **Quick Start Commands**

```bash
# Development with temporary storage
npm run dev

# Development with persistent file storage
STORAGE_TYPE=file npm run dev

# Development with database storage
STORAGE_TYPE=database npm run dev
```

Choose the storage type that fits your current needs!
