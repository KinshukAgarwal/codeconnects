
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { CommentService, UserService } from '@/utils/db';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  profilePicture?: string;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
}

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Fetch comments for the post
    const fetchComments = () => {
      const postComments = CommentService.getByPostId(postId);
      setComments(postComments);
    };
    
    fetchComments();
  }, [postId]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const newComment = CommentService.create({
        postId,
        userId: currentUser.id,
        content: content.trim()
      });
      
      setComments(prev => [...prev, newComment]);
      setContent('');
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to add comment");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h3>
      
      {currentUser && (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser.profilePicture} alt={currentUser.username} />
            <AvatarFallback>
              {currentUser.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Add a comment..."
              className="w-full bg-transparent border-b border-border pb-2 focus:outline-none focus:border-primary transition-colors"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="flex justify-end mt-2">
              <Button 
                type="submit" 
                size="sm" 
                disabled={!content.trim() || isSubmitting}
              >
                Post
              </Button>
            </div>
          </div>
        </form>
      )}
      
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <p className="text-center text-muted-foreground py-6">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
};

const CommentItem: React.FC<{ comment: Comment }> = ({ comment }) => {
  const [user, setUser] = useState<User | null>(null);
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
  
  useEffect(() => {
    const commentUser = UserService.getById(comment.userId);
    if (commentUser) {
      setUser(commentUser);
    }
  }, [comment]);
  
  if (!user) return null;
  
  return (
    <div className="flex gap-3">
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
        <p className="mt-1">{comment.content}</p>
      </div>
    </div>
  );
};

export default CommentSection;
