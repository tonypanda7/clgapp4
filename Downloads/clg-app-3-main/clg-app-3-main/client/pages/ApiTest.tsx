import { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI, demoAPI } from "../utils/api";

export default function ApiTest() {
  const [results, setResults] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => prev + new Date().toLocaleTimeString() + ": " + message + "\n");
  };

  const testPing = async () => {
    setIsLoading(true);
    try {
      const response = await demoAPI.ping();
      addResult(`✅ Ping successful: ${response.message}`);
    } catch (error) {
      addResult(`❌ Ping failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testDemo = async () => {
    setIsLoading(true);
    try {
      const response = await demoAPI.demo();
      addResult(`✅ Demo successful: ${response.message}`);
    } catch (error) {
      addResult(`❌ Demo failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCreateUser = async () => {
    setIsLoading(true);
    try {
      const testUser = {
        fullName: "Test User",
        universityEmail: "test@university.edu",
        password: "password123",
        confirmPassword: "password123",
        phoneNumber: "+1234567890",
        universityName: "Test University",
        universityId: "TEST123",
        program: "Computer Science",
        yearOfStudy: "3rd"
      };

      const response = await authAPI.signup(testUser);
      if (response.success) {
        addResult(`✅ User created: ${response.user?.fullName} (${response.user?.universityEmail})`);
      } else {
        addResult(`❌ User creation failed: ${response.message}`);
      }
    } catch (error) {
      addResult(`❌ User creation error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    try {
      const response = await authAPI.login({
        username: "test@university.edu",
        password: "password123"
      });

      if (response.success) {
        addResult(`✅ Login successful: ${response.user?.fullName}`);
        addResult(`   Token: ${response.token?.substring(0, 20)}...`);
      } else {
        addResult(`❌ Login failed: ${response.message}`);
      }
    } catch (error) {
      addResult(`❌ Login error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testGetUsers = async () => {
    setIsLoading(true);
    try {
      const response = await authAPI.getUsers();
      addResult(`✅ Users retrieved: ${response.users.length} users found`);
      response.users.forEach((user, index) => {
        addResult(`   ${index + 1}. ${user.fullName} (${user.universityEmail})`);
      });
    } catch (error) {
      addResult(`❌ Get users failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Backend API Test Panel
          </h1>
          <Link 
            to="/" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Login
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Test Buttons */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">API Tests</h2>
            <div className="space-y-4">
              <button
                onClick={testPing}
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded transition-colors"
              >
                Test Ping API
              </button>

              <button
                onClick={testDemo}
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 px-4 rounded transition-colors"
              >
                Test Demo API
              </button>

              <button
                onClick={testCreateUser}
                disabled={isLoading}
                className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white py-2 px-4 rounded transition-colors"
              >
                Create Test User
              </button>

              <button
                onClick={testLogin}
                disabled={isLoading}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white py-2 px-4 rounded transition-colors"
              >
                Test Login (test@university.edu)
              </button>

              <button
                onClick={testGetUsers}
                disabled={isLoading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white py-2 px-4 rounded transition-colors"
              >
                Get All Users
              </button>

              <button
                onClick={clearResults}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors"
              >
                Clear Results
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
              {results || "Click a test button to see results..."}
            </div>
          </div>
        </div>

        {/* API Documentation */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Available API Endpoints</h2>
          <div className="space-y-2 text-sm">
            <div><strong>GET /api/ping</strong> - Simple ping test</div>
            <div><strong>GET /api/demo</strong> - Demo endpoint</div>
            <div><strong>POST /api/auth/login</strong> - User login</div>
            <div><strong>POST /api/auth/signup</strong> - User registration</div>
            <div><strong>GET /api/auth/profile</strong> - Get user profile (requires auth)</div>
            <div><strong>GET /api/auth/users</strong> - Get all users (development only)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
