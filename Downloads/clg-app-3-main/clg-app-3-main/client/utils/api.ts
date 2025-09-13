import { LoginRequest, SignupRequest, AuthResponse } from "@shared/api";

const API_BASE_URL = "/api";

// Generic API call function
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("authToken");
  
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// Authentication API calls
export const authAPI = {
  login: (credentials: LoginRequest): Promise<AuthResponse> =>
    apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  signup: (userData: SignupRequest): Promise<AuthResponse> =>
    apiCall("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  getProfile: (): Promise<AuthResponse> =>
    apiCall("/auth/profile"),

  getUsers: (): Promise<{ users: any[] }> =>
    apiCall("/auth/users"),
};

// Demo API calls
export const demoAPI = {
  ping: (): Promise<{ message: string }> =>
    apiCall("/ping"),
    
  demo: (): Promise<{ message: string }> =>
    apiCall("/demo"),
};

// Utility functions
export const auth = {
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");
    return !!(token && userData);
  },

  getCurrentUser: () => {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  },

  logout: (): void => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  },
};
