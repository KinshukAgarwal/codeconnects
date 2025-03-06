
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CodeBlock from '@/components/CodeBlock';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  MessageSquare, 
  Share, 
  Bookmark, 
  MoreHorizontal,
  Code
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

interface PostCardProps {
  post: {
    id: string;
    userId: string;
    username?: string;
    userProfilePic?: string | null;
    description: string;
    content?: string;
    code?: string | null;
    media?: string | null;
    likes: string[];
    comments: number;
    tags: string[];
    timeAgo?: string;
    isLiked?: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(
    Array.isArray(post.likes) ? post.likes.length : 0
  );

  const handleLike = () => {
    if (!currentUser) {
      toast.error('You need to be logged in to like posts');
      return;
    }

    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    
    // In a real app, this would call an API to update the like status
    toast.success(isLiked ? 'Post unliked' : 'Post liked');
  };

  const handleSave = () => {
    if (!currentUser) {
      toast.error('You need to be logged in to save posts');
      return;
    }

    setIsSaved(!isSaved);
    
    // In a real app, this would call an API to update the saved status
    toast.success(isSaved ? 'Post removed from saved' : 'Post saved for later');
  };

  const handleShare = () => {
    // In a real app, this would open a share dialog
    navigator.clipboard.writeText(`https://codeconnects.app/post/${post.id}`);
    toast.success('Link copied to clipboard!');
  };

  const getTimeAgo = (dateString: string) => {
    if (post.timeAgo) return post.timeAgo;
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // This gets a placeholder avatar text from username or user ID
  const getAvatarText = () => {
    if (post.username) return post.username.substring(0, 2).toUpperCase();
    return post.userId.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${post.username || post.userId}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.userProfilePic || ''} />
                <AvatarFallback>{getAvatarText()}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link to={`/profile/${post.username || post.userId}`}>
                <h3 className="font-semibold hover:underline">
                  {post.username || post.userId}
                </h3>
              </Link>
              <p className="text-xs text-muted-foreground">{getTimeAgo(post.createdAt)}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div>
          <p>{post.description || post.content}</p>

          {post.media && (
            <div className="mt-4 rounded-md overflow-hidden">
              <img 
                src={post.media} 
                alt="Post media" 
                className="w-full h-auto"
              />
            </div>
          )}

          {post.code && (
            <div className="mt-4 rounded-md overflow-hidden">
              <CodeBlock code={post.code} language="javascript" />
            </div>
          )}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="block pt-0">
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <Button
              variant="ghost"
              size="sm"
              className={isLiked ? 'text-red-500' : ''}
              onClick={handleLike}
            >
              <Heart className={`h-5 w-5 mr-1 ${isLiked ? 'fill-red-500' : ''}`} />
              <span>{likesCount}</span>
            </Button>
            
            <Link to={`/post/${post.id}`}>
              <Button variant="ghost" size="sm">
                <MessageSquare className="h-5 w-5 mr-1" />
                <span>{post.comments}</span>
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className={post.code ? '' : 'invisible'}
            >
              <Code className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={isSaved ? 'text-primary' : ''}
              onClick={handleSave}
            >
              <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-primary' : ''}`} />
            </Button>
          </div>
        </div>

        <Separator className="my-3" />
        
        <Link to={`/post/${post.id}`} className="inline-block">
          <p className="text-sm text-muted-foreground hover:text-foreground hover:underline">
            View all {post.comments} comments
          </p>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
