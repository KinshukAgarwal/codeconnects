
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
import { supabase } from '@/integrations/supabase/client';
import { usePosts } from '@/hooks/usePosts';

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const { useUserPosts } = usePosts();
  
  // Fetch user profile
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      if (!username) throw new Error('Username is required');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      
      if (error) throw error;
      
      // Get follower count
      const { data: followers, error: followersError } = await supabase
        .from('likes')
        .select('user_id')
        .eq('post_id', data.id);
        
      if (followersError) throw followersError;
      
      // Get following count
      const { data: following, error: followingError } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', data.id);
        
      if (followingError) throw followingError;
      
      return {
        id: data.id,
        username: data.username,
        email: username, // Just a placeholder for typescript
        profilePicture: data.profile_picture,
        bio: data.bio || '',
        followers: followers?.map(f => f.user_id) || [],
        following: following?.map(f => f.post_id) || [],
        createdAt: data.created_at
      };
    },
    enabled: !!username,
  });
  
  // Fetch user posts using the hook
  const { data: userPosts = [], isLoading: isLoadingPosts } = useUserPosts(userProfile?.id || '');
  
  const isOwnProfile = currentUser?.username === username;
  
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
