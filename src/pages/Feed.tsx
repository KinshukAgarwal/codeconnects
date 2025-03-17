
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Post from '@/components/Post';
import PostCard from '@/components/PostCard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Hash, Globe, Users } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Feed: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const { useFeedPosts } = usePosts();
  const { data: posts = [], isLoading, isError } = useFeedPosts();
  
  // Fetch trending tags
  const { data: trendingTags = [] } = useQuery({
    queryKey: ['trendingTags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_tags')
        .select(`
          tags:tag_id(id, name)
        `)
        .limit(100);
        
      if (error) throw error;
      
      // Count tag occurrences
      const tagCounts: Record<string, { name: string, count: number }> = {};
      data.forEach(item => {
        const tagName = item.tags.name;
        if (!tagCounts[tagName]) {
          tagCounts[tagName] = { name: tagName, count: 0 };
        }
        tagCounts[tagName].count++;
      });
      
      // Convert to array and sort by count
      return Object.values(tagCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    },
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
  });
  
  // Fetch suggested users to follow
  const { data: suggestedUsers = [] } = useQuery({
    queryKey: ['suggestedUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, profile_picture')
        .limit(3);
        
      if (error) throw error;
      
      return data.map(user => ({
        id: user.id,
        username: user.username,
        profilePicture: user.profile_picture
      }));
    },
    enabled: !!currentUser,
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
  });

  return (
    <>
      <Navbar />
      <div className="container grid grid-cols-1 gap-6 py-8 md:grid-cols-3 lg:grid-cols-4">
        {/* Sidebar - Trending Tags */}
        <aside className="hidden md:block md:col-span-1">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Trending Tags</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {trendingTags.map((tag) => (
                <div key={tag.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>#{tag.name}</span>
                  </div>
                  <Badge variant="secondary">{tag.count}</Badge>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs" size="sm">
                See all trending tags
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* Main Feed */}
        <main className="col-span-1 space-y-6 md:col-span-2 lg:col-span-2">
          {/* Post Creation Form */}
          {currentUser && <Post onPostCreated={() => null} />}

          {/* Feed Tabs */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Global Feed</span>
              </TabsTrigger>
              <TabsTrigger value="following" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Following</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4 mt-4">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <p>Loading posts...</p>
                </div>
              ) : isError ? (
                <div className="flex justify-center p-8">
                  <p>Error loading posts. Please try again.</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="flex justify-center p-8">
                  <p>No posts found.</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="following" className="space-y-4 mt-4">
              {currentUser ? (
                isLoading ? (
                  <div className="flex justify-center p-8">
                    <p>Loading posts...</p>
                  </div>
                ) : (
                  posts.filter((_, i) => i % 3 === 0).map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                )
              ) : (
                <div className="text-center p-8">
                  <p className="mb-4">You need to follow developers to see posts here.</p>
                  <Button asChild>
                    <a href="/explore">Discover developers</a>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>

        {/* Sidebar - Who to Follow */}
        <aside className="hidden lg:block lg:col-span-1">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Who to follow</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestedUsers.map((user) => (
                <div key={user.id} className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profilePicture || undefined} />
                      <AvatarFallback>
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Follow
                  </Button>
                </div>
              ))}
              <Separator />
              <Button variant="ghost" className="w-full text-xs" size="sm">
                Show more
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
};

export default Feed;
