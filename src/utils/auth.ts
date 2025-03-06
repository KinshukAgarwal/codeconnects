
import { toast } from 'sonner';
import { UserService } from './db';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  username: string;
  email: string;
  password: string;
}

// In a real app, we would hash passwords and implement proper JWT authentication
// This is a simplified mock version for demonstration purposes

// Mock user credentials storage
const userCredentials: Record<string, string> = {
  'dev@example.com': 'password123',
  'code@example.com': 'password123',
  'ui@example.com': 'password123'
};

export const AuthService = {
  login: async ({ email, password }: LoginCredentials) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if credentials match
    if (userCredentials[email] === password) {
      const user = UserService.getAll().find(u => u.email === email);
      if (user) {
        return user;
      }
    }
    
    throw new Error('Invalid email or password');
  },
  
  signup: async ({ username, email, password }: SignupData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if user already exists
    const existingUser = UserService.getAll().find(
      u => u.email === email || u.username === username
    );
    
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }
    
    // Create new user
    const newUser = UserService.create({
      username,
      email,
      profilePicture: `https://source.unsplash.com/random/200x200/?portrait&${Date.now()}`,
      bio: ''
    });
    
    // Store credentials
    userCredentials[email] = password;
    
    return newUser;
  },
  
  validateUsername: (username: string): boolean => {
    // Username should be at least 3 characters and only contain letters, numbers, and underscores
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
  },
  
  validateEmail: (email: string): boolean => {
    // Basic email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  
  validatePassword: (password: string): boolean => {
    // Password should be at least 8 characters
    return password.length >= 8;
  }
};
