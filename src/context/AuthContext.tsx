
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  followers: string[];
  following: string[];
  createdAt: string;
}

interface Profile {
  id: string;
  username: string;
  profile_picture: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session) {
        await fetchUserProfile(session.user);
      }
      
      setIsLoading(false);
      
      // Listen for auth changes
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session);
          
          if (event === 'SIGNED_IN' && session) {
            await fetchUserProfile(session.user);
          } else if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
            setIsAuthenticated(false);
          }
        }
      );
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initializeAuth();
  }, []);
  
  const fetchUserProfile = async (user: User) => {
    if (!user) return;
    
    try {
      // Get user profile from the profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      // Get follower count
      const { data: followers, error: followersError } = await supabase
        .from('likes')
        .select('user_id')
        .eq('post_id', profile.id);
        
      if (followersError) throw followersError;
      
      // Get following count
      const { data: following, error: followingError } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', profile.id);
        
      if (followingError) throw followingError;
      
      const authUser: AuthUser = {
        id: profile.id,
        username: profile.username,
        email: user.email || '',
        profilePicture: profile.profile_picture || undefined,
        bio: profile.bio || undefined,
        followers: followers?.map(f => f.user_id) || [],
        following: following?.map(f => f.post_id) || [],
        createdAt: profile.created_at
      };
      
      setCurrentUser(authUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to fetch user profile');
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success("Login successful");
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error(error.message || "Login failed. Please check your credentials.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Check if username is already taken
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();
        
      if (existingUser) {
        throw new Error('Username is already taken');
      }
      
      // Sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          }
        }
      });
      
      if (error) throw error;
      
      toast.success("Account created successfully");
    } catch (error: any) {
      console.error("Signup failed:", error);
      toast.error(error.message || "Signup failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setCurrentUser(null);
      setIsAuthenticated(false);
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error('Logout failed:', error);
      toast.error(error.message || 'Logout failed');
    }
  };

  const updateProfile = async (userData: Partial<AuthUser>) => {
    setIsLoading(true);
    try {
      if (!currentUser) throw new Error('No user logged in');
      
      // Update the profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          username: userData.username,
          profile_picture: userData.profilePicture,
          bio: userData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);
        
      if (error) throw error;
      
      // Update local state
      setCurrentUser({
        ...currentUser,
        ...userData
      });
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Profile update failed:", error);
      toast.error(error.message || "Failed to update profile. Please try again.");
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
