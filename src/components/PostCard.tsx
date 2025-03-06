import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { Heart, MessageSquare, Share, MoreHorizontal, Code } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CodeBlock from './CodeBlock';

interface User {
  id: string;
  username: string;
  profilePicture?: string;
}

interface Post {
  id: string;
  userId: string;
  username?: string;
  userProfilePic?: string | null;
  description: string;
  content?: string;
  code?: string | null;
  media?: string | null;
  likes: string[] | number;
  comments: number;
  tags?: string[];
  timeAgo?: string;
  isLiked?: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  showComments?: boolean;
  onDelete?: () => void;
}

// Function to detect code blocks in description (wrapped in ```code```)
const extractCodeBlock = (text: string) => {
  const codeBlockRegex = /```([\s\S]*?)```/g;
  const matches = [...text.matchAll(codeBlockRegex)];
  
  if (matches.length === 0) return { description: text, codeBlocks: [] };
  
  const codeBlocks: string[] = [];
  let description = text;
  
  // Extract code blocks and remove them from description
  matches.forEach(match => {
    codeBlocks.push(match[1].trim());
    description = description.replace(match[0], '');
  });
  
  return { 
    description: description.trim(), 
    codeBlocks 
  };
};

const PostCard: React.FC<PostCardProps> = ({ post, showComments = false, onDelete }) => {
  const { currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsVisible, setCommentsVisible] = useState(showComments);
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle both array and number for likes
  const likesArray = Array.isArray(post.likes) ? post.likes : [];
  const likesCount = Array.isArray(post.likes) ? post.likes.length : (typeof post.likes === 'number' ? post.likes : 0);
  const isLiked = currentUser ? likesArray.includes(currentUser.id) : false;
  
  const isOwnPost = post.userId === currentUser?.id;
  
  const timeAgo = post.timeAgo || 
    (post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : '');
  
  const { description, codeBlocks } = extractCodeBlock(post.description);

  // Fetch user and comments data
  React.useEffect(() => {
    // For a mocked user in case we don't have username directly in post
    if (!user && !post.username) {
      try {
        const postUser = {
          id: post.userId,
          username: `user_${post.userId.substring(0, 4)}`,
          profilePicture: post.userProfilePic || undefined
        };
        setUser(postUser);
      } catch (error) {
        console.error("Failed to get user data:", error);
      }
    }
    
    // If we already have username in the post, use it directly
    if (!user && post.username) {
      setUser({
        id: post.userId,
        username: post.username,
        profilePicture: post.userProfilePic || undefined
      });
    }
  }, [post, user]);

  const toggleLike = () => {
    if (!currentUser) return;
    
    try {
      // Mock like/unlike functionality
      toast.success(isLiked ? "Post unliked" : "Post liked");
    } catch (error) {
      toast.error("Failed to update like status");
      console.error(error);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !commentContent.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Mock comment creation
      const newComment = {
        id: `comment-${Date.now()}`,
        postId: post.id,
        userId: currentUser.id,
        content: commentContent.trim(),
        createdAt: new Date().toISOString()
      };
      
      setComments(prev => [...prev, newComment]);
      setCommentContent('');
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to add comment");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = () => {
    try {
      // Mock delete functionality
      toast.success("Post deleted");
      if (onDelete) onDelete();
    } catch (error) {
      toast.error("Failed to delete post");
      console.error(error);
    }
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden mb-4 animate-fade-in">
      <div className="p-4">
        {/* Post header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            {user && (
              <>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.profilePicture} alt={user.username} />
                  <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <Link 
                    to={`/profile/${user.username}`} 
                    className="font-medium hover:underline"
                  >
                    {user.username}
                  </Link>
                  <p className="text-xs text-muted-foreground">{timeAgo}</p>
                </div>
              </>
            )}
          </div>
          
          {isOwnPost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDeletePost} className="text-destructive">
                  Delete post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {/* Post content */}
        <div>
          {description && (
            <p className="whitespace-pre-line mb-3">{description}</p>
          )}
          
          {codeBlocks.map((code, index) => (
            <CodeBlock key={index} code={code} />
          ))}
          
          {post.media && (
            <div className="mt-3 rounded-lg overflow-hidden">
              <img
                src={post.media}
                alt="Post attachment"
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {post.tags.map((tag) => (
                <Link 
                  key={tag} 
                  to={`/search?tag=${tag}`}
                  className="bg-secondary text-xs px-2 py-1 rounded-md hover:bg-secondary/70 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* Post actions */}
        <div className="flex items-center gap-6 mt-4">
          <Button 
            variant="ghost" 
            size="sm"
            className={`flex items-center gap-1 ${isLiked ? 'text-rose-500' : ''}`}
            onClick={toggleLike}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-rose-500' : ''}`} />
            <span>{post.likes.length}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setCommentsVisible(!commentsVisible)}
          >
            <MessageSquare className="h-4 w-4" />
            <span>{comments.length}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center gap-1"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
              toast.success("Post link copied to clipboard!");
            }}
          >
            <Share className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </div>
      
      {/* Comments section */}
      {commentsVisible && (
        <div className="border-t bg-muted/30">
          <div className="p-4 max-h-80 overflow-y-auto">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
          
          {currentUser && (
            <div className="p-4 border-t">
              <form onSubmit={handleCommentSubmit} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.profilePicture} alt={currentUser.username} />
                  <AvatarFallback>
                    {currentUser.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent border-none focus:outline-none"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  disabled={isSubmitting}
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={!commentContent.trim() || isSubmitting}
                >
                  Post
                </Button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Comment component
const CommentItem: React.FC<{ comment: Comment }> = ({ comment }) => {
  const [user, setUser] = useState<User | null>(null);
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
  
  React.useEffect(() => {
    const commentUser = UserService.getById(comment.userId);
    if (commentUser) {
      setUser(commentUser);
    }
  }, [comment]);
  
  if (!user) return null;
  
  return (
    <div className="flex gap-3 mb-4">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.profilePicture} alt={user.username} />
        <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Link 
            to={`/profile/${user.username}`} 
            className="font-medium hover:underline"
          >
            {user.username}
          </Link>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        <p className="text-sm mt-1">{comment.content}</p>
      </div>
    </div>
  );
};

export default PostCard;
