
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import useMySQLConnection from '@/hooks/useMySQLConnection';

interface User {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  followers: string[];
  following: string[];
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // This would be a real query in production
  // For now we'll use our mock implementation
  const { data: users } = useMySQLConnection('SELECT * FROM users');

  // Check for saved user on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would call an API endpoint
      // that verifies credentials against the MySQL database
      
      // For our mock implementation, we'll simulate a successful login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Example user data
      const user: User = {
        id: "user-123",
        username: "devuser",
        email: email,
        profilePicture: "https://source.unsplash.com/random/200x200/?portrait",
        bio: "Full-stack developer passionate about web technologies",
        followers: ["user-456", "user-789"],
        following: ["user-456"],
        createdAt: new Date().toISOString()
      };
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
      toast.success("Login successful");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please check your credentials.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would call an API endpoint
      // that inserts a new user into the MySQL database
      
      // For our mock implementation, we'll simulate a successful signup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Example user data
      const user: User = {
        id: `user-${Date.now()}`,
        username,
        email,
        followers: [],
        following: [],
        createdAt: new Date().toISOString()
      };
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
      toast.success("Account created successfully");
    } catch (error) {
      console.error("Signup failed:", error);
      toast.error("Signup failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    toast.success("Logged out successfully");
  };

  const updateProfile = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      // In a real app, this would call an API endpoint
      // that updates the user in the MySQL database
      
      // For our mock implementation, we'll simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("Failed to update profile. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isAuthenticated,
        login,
        signup,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
