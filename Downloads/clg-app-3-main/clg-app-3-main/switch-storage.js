#!/usr/bin/env node

// Storage switching utility
// Usage: node switch-storage.js [memory|file|database]

const storageType = process.argv[2] || 'memory';
const validTypes = ['memory', 'file', 'database'];

if (!validTypes.includes(storageType)) {
  console.error('❌ Invalid storage type. Use: memory, file, or database');
  process.exit(1);
}

console.log(`\n🔄 Switching to ${storageType} storage...\n`);

switch (storageType) {
  case 'memory':
    console.log('📝 In-Memory Storage (Default)');
    console.log('   └── Data stored in server RAM');
    console.log('   └── ❌ Data lost on restart');
    console.log('   └── ✅ No setup required');
    console.log('\n📋 Command:');
    console.log('   npm run dev');
    break;

  case 'file':
    console.log('📁 File Storage');
    console.log('   └── Data stored in ./data/users.json');
    console.log('   └── ✅ Persistent storage');
    console.log('   └── ✅ Easy backup (copy file)');
    console.log('\n📋 Command:');
    console.log('   STORAGE_TYPE=file npm run dev');
    break;

  case 'database':
    console.log('🗄️ SQLite Database Storage');
    console.log('   └── Data stored in ./data/users.db');
    console.log('   └── ✅ Production-ready');
    console.log('   └── ✅ Fast queries');
    console.log('   └── ⚠️  Requires: npm install sqlite3 @types/sqlite3');
    console.log('\n📋 Commands:');
    console.log('   npm install sqlite3 @types/sqlite3');
    console.log('   STORAGE_TYPE=database npm run dev');
    break;
}

console.log('\n💡 Tip: Data is NOT automatically migrated between storage types');
console.log('💡 Test the API at: http://localhost:8080/api-test\n');
