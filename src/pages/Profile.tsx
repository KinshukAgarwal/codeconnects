
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import ProfileHeader from '@/components/ProfileHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Pencil, Grid, BookmarkIcon } from 'lucide-react';

interface ProfilePost {
  id: string;
  userId: string;
  username?: string;
  userProfilePic?: string | null;
  description: string;
  content?: string;
  code?: string | null;
  media?: string | null;
  likes: string[];  // Changed from number | string[] to just string[]
  comments: number;
  tags: string[];
  timeAgo?: string;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string; // Changed from optional to required
}

// Mock function to fetch user profile data
const fetchUserProfile = async (username: string) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    id: "user-123",
    username: username,
    email: `${username}@example.com`,
    profilePicture: "https://source.unsplash.com/random/200x200/?portrait",
    bio: "Full-stack developer passionate about React, TypeScript, and building beautiful UIs",
    followers: Array.from({ length: 120 }, (_, i) => `follower-${i}`),
    following: Array.from({ length: 85 }, (_, i) => `following-${i}`),
    createdAt: "2023-01-15T00:00:00Z"
  };
};

// Mock function to fetch user posts
const fetchUserPosts = async (userId: string): Promise<ProfilePost[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return Array.from({ length: 6 }, (_, i) => ({
    id: `post-${i}`,
    userId: userId,
    description: `This is a post about ${['React', 'TypeScript', 'CSS', 'JavaScript', 'Node.js', 'Web Development'][i % 6]}`,
    content: `This is a post about ${['React', 'TypeScript', 'CSS', 'JavaScript', 'Node.js', 'Web Development'][i % 6]}`,
    code: i % 2 === 0 ? 'const exampleCode = () => {\n  console.log("Hello world");\n};' : null,
    media: i % 3 === 0 ? 'https://via.placeholder.com/600x400' : null,
    likes: Array.from({ length: Math.floor(Math.random() * 50) }, (_, j) => `user-${j}`), // Changed to create an array of strings
    comments: Math.floor(Math.random() * 10),
    tags: ['coding', 'webdev', 'javascript'].slice(0, i % 3 + 1),
    timeAgo: `${i + 1}d ago`,
    isLiked: Boolean(i % 2),
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - i * 86400000).toISOString(), // Always providing updatedAt value
  }));
};

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  
  const isOwnProfile = currentUser?.username === username;
  
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => fetchUserProfile(username || ''),
    enabled: !!username,
  });
  
  const { data: userPosts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ['profilePosts', userProfile?.id],
    queryFn: () => fetchUserPosts(userProfile?.id || ''),
    enabled: !!userProfile?.id,
  });
  
  const handleFollowUser = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    toast({
      title: "Success",
      description: `You are now following ${username}`,
    });
  };
  
  const handleEditProfile = () => {
    navigate('/settings/profile');
  };
  
  if (isLoadingProfile) {
    return (
      <>
        <Navbar />
        <div className="container py-8">
          <div className="flex justify-center">
            <p>Loading profile...</p>
          </div>
        </div>
      </>
    );
  }
  
  if (!userProfile) {
    return (
      <>
        <Navbar />
        <div className="container py-8">
          <div className="flex justify-center">
            <p>User not found</p>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <div className="container py-6">
        <ProfileHeader 
          username={userProfile.username}
          bio={userProfile.bio || ''}
          profilePicture={userProfile.profilePicture || ''}
          followersCount={userProfile.followers.length}
          followingCount={userProfile.following.length}
          joinDate={new Date(userProfile.createdAt).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })}
        />
        
        <div className="flex justify-center mt-4 gap-2">
          {isOwnProfile ? (
            <Button onClick={handleEditProfile} variant="outline" className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <Button onClick={handleFollowUser} variant="default" className="gap-2">
              Follow
            </Button>
          )}
        </div>
        
        <Separator className="my-6" />
        
        <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-8">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              <span>Posts</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <BookmarkIcon className="h-4 w-4" />
              <span>Saved</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-6">
            {isLoadingPosts ? (
              <div className="flex justify-center p-8">
                <p>Loading posts...</p>
              </div>
            ) : userPosts.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-muted-foreground">No posts yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {userPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="saved" className="space-y-6">
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                {isOwnProfile ? "You haven't saved any posts yet" : "This user's saved posts are private"}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Profile;
