
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  userProfilePic?: string | null;
  content: string;
  createdAt: string;
}

export const useComments = (postId?: string) => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  // Fetch comments for a post
  const usePostComments = () => {
    return useQuery({
      queryKey: ['comments', postId],
      queryFn: async () => {
        if (!postId) return [];

        const { data, error } = await supabase
          .from('comments')
          .select(`
            id,
            post_id,
            user_id,
            content,
            created_at,
            profiles:user_id(username, profile_picture)
          `)
          .eq('post_id', postId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        return data.map((comment) => ({
          id: comment.id,
          postId: comment.post_id,
          userId: comment.user_id,
          username: comment.profiles.username,
          userProfilePic: comment.profiles.profile_picture,
          content: comment.content,
          createdAt: comment.created_at
        }));
      },
      enabled: !!postId,
    });
  };

  // Create a comment
  const useCreateComment = () => {
    return useMutation({
      mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
        if (!currentUser) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('comments')
          .insert({
            post_id: postId,
            user_id: currentUser.id,
            content
          })
          .select(`
            id,
            post_id,
            user_id,
            content,
            created_at
          `)
          .single();

        if (error) throw error;

        // Get the user profile info
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username, profile_picture')
          .eq('id', currentUser.id)
          .single();

        if (profileError) throw profileError;

        return {
          id: data.id,
          postId: data.post_id,
          userId: data.user_id,
          username: profile.username,
          userProfilePic: profile.profile_picture,
          content: data.content,
          createdAt: data.created_at
        };
      },
      onSuccess: (comment) => {
        // Update the comments list
        queryClient.setQueryData<Comment[]>(['comments', comment.postId], (oldData = []) => {
          return [...oldData, comment];
        });

        // Update the comments count in the post
        queryClient.invalidateQueries({ queryKey: ['feed'] });
        queryClient.invalidateQueries({ queryKey: ['post', comment.postId] });
        if (currentUser) {
          queryClient.invalidateQueries({ queryKey: ['userPosts', currentUser.id] });
        }

        toast.success('Comment added');
      },
      onError: (error: any) => {
        console.error('Error creating comment:', error);
        toast.error(error.message || 'Failed to add comment');
      }
    });
  };

  return {
    usePostComments,
    useCreateComment
  };
};
