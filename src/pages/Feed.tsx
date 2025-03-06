
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Code, Image as ImageIcon, Smile, Hash, Globe, Users } from 'lucide-react';

// Mock function to get feed data - would be replaced with actual API call
const fetchFeed = async (feedType: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data
  const posts = Array.from({ length: 10 }, (_, i) => ({
    id: `post-${i}`,
    userId: `user-${i % 3}`,
    username: ['johndoe', 'janesmith', 'sarahdev'][i % 3],
    userProfilePic: null,
    content: `This is a sample post #${i} with some content about coding and development. #react #javascript`,
    code: i % 3 === 0 ? 'const hello = () => console.log("Hello World");' : null,
    media: i % 4 === 0 ? 'https://via.placeholder.com/600x400' : null,
    likes: Math.floor(Math.random() * 120),
    comments: Math.floor(Math.random() * 30),
    tags: ['react', 'javascript', 'webdev'].slice(0, i % 3 + 1),
    timeAgo: `${i + 1}h ago`,
    isLiked: Boolean(i % 2),
  }));
  
  return posts;
};

const Feed: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [postContent, setPostContent] = useState('');
  
  const { data: posts = [], isLoading, isError } = useQuery({
    queryKey: ['feed', activeTab],
    queryFn: () => fetchFeed(activeTab),
  });

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    
    // Would be replaced with actual API call
    toast({
      title: "Post created",
      description: "Your post has been published successfully",
    });
    
    setPostContent('');
  };

  const trendingTags = [
    { name: 'javascript', count: 2345 },
    { name: 'react', count: 1823 },
    { name: 'webdev', count: 1456 },
    { name: 'programming', count: 1245 },
    { name: 'typescript', count: 987 },
  ];

  return (
    <>
      <Navbar />
      <div className="container grid grid-cols-1 gap-6 py-8 md:grid-cols-3 lg:grid-cols-4">
        {/* Left sidebar (hidden on mobile) */}
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

        {/* Main content area */}
        <main className="col-span-1 space-y-6 md:col-span-2 lg:col-span-2">
          {currentUser && (
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmitPost}>
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentUser.profilePicture || ''} />
                      <AvatarFallback>
                        {currentUser.username?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-4">
                      <Textarea
                        placeholder="Share your code or thoughts..."
                        className="min-h-[120px] resize-none"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button type="button" size="icon" variant="ghost" title="Add code">
                            <Code className="h-4 w-4" />
                          </Button>
                          <Button type="button" size="icon" variant="ghost" title="Add image">
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                          <Button type="button" size="icon" variant="ghost" title="Add emoji">
                            <Smile className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <Globe className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Public</span>
                          </div>
                          <Button type="submit" disabled={!postContent.trim()}>
                            Post
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

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

        {/* Right sidebar (hidden on mobile and medium screens) */}
        <aside className="hidden lg:block lg:col-span-1">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Who to follow</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {['JS', 'TS', 'RD'][i]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {['Jane Smith', 'Tom Scott', 'Ruby Dev'][i]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{['janesmith', 'tscott', 'rubydev'][i]}
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
