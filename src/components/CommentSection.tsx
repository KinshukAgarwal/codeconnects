
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useComments } from '@/hooks/useComments';

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { currentUser } = useAuth();
  const [content, setContent] = useState('');
  
  const { usePostComments, useCreateComment } = useComments(postId);
  const { data: comments = [], isLoading } = usePostComments();
  const { mutate: addComment, isPending: isSubmitting } = useCreateComment();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !content.trim() || isSubmitting) return;
    
    addComment({
      postId,
      content: content.trim()
    }, {
      onSuccess: () => {
        setContent('');
      }
    });
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
        {isLoading ? (
          <div className="flex justify-center py-4">
            <p className="text-muted-foreground">Loading comments...</p>
          </div>
        ) : comments.length > 0 ? (
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

interface CommentItemProps {
  comment: {
    id: string;
    userId: string;
    username: string;
    userProfilePic?: string | null;
    content: string;
    createdAt: string;
  };
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
  
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.userProfilePic || ''} alt={comment.username} />
        <AvatarFallback>{comment.username.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Link 
            to={`/profile/${comment.username}`} 
            className="font-medium hover:underline"
          >
            {comment.username}
          </Link>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        <p className="mt-1">{comment.content}</p>
      </div>
    </div>
  );
};

export default CommentSection;
