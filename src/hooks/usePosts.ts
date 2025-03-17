
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface Post {
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
}

export const usePosts = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  // Fetch feed posts
  const useFeedPosts = () => {
    return useQuery({
      queryKey: ['feed'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id,
            description,
            content,
            code,
            media,
            created_at,
            updated_at,
            user_id,
            profiles:user_id(username, profile_picture)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Get likes for each post
        const postsWithLikes = await Promise.all(
          data.map(async (post) => {
            const { data: likes, error: likesError } = await supabase
              .from('likes')
              .select('user_id')
              .eq('post_id', post.id);

            if (likesError) throw likesError;

            // Get comments count for the post
            const { count: commentsCount, error: commentsError } = await supabase
              .from('comments')
              .select('id', { count: 'exact', head: true })
              .eq('post_id', post.id);

            if (commentsError) throw commentsError;

            // Get tags for the post
            const { data: postTags, error: tagsError } = await supabase
              .from('post_tags')
              .select(`
                tags:tag_id(name)
              `)
              .eq('post_id', post.id);

            if (tagsError) throw tagsError;

            // Check if current user liked the post
            const isLiked = currentUser 
              ? likes.some(like => like.user_id === currentUser.id)
              : false;

            // Format the post
            return {
              id: post.id,
              userId: post.user_id,
              username: post.profiles.username,
              userProfilePic: post.profiles.profile_picture,
              description: post.description,
              content: post.content || post.description,
              code: post.code,
              media: post.media,
              likes: likes.map(like => like.user_id),
              comments: commentsCount || 0,
              tags: postTags.map(tag => tag.tags.name),
              isLiked,
              createdAt: post.created_at,
              updatedAt: post.updated_at
            };
          })
        );

        return postsWithLikes;
      },
      enabled: true,
    });
  };

  // Fetch user posts
  const useUserPosts = (userId: string) => {
    return useQuery({
      queryKey: ['userPosts', userId],
      queryFn: async () => {
        if (!userId) return [];

        const { data, error } = await supabase
          .from('posts')
          .select(`
            id,
            description,
            content,
            code,
            media,
            created_at,
            updated_at,
            user_id,
            profiles:user_id(username, profile_picture)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Get likes for each post
        const postsWithLikes = await Promise.all(
          data.map(async (post) => {
            const { data: likes, error: likesError } = await supabase
              .from('likes')
              .select('user_id')
              .eq('post_id', post.id);

            if (likesError) throw likesError;

            // Get comments count for the post
            const { count: commentsCount, error: commentsError } = await supabase
              .from('comments')
              .select('id', { count: 'exact', head: true })
              .eq('post_id', post.id);

            if (commentsError) throw commentsError;

            // Get tags for the post
            const { data: postTags, error: tagsError } = await supabase
              .from('post_tags')
              .select(`
                tags:tag_id(name)
              `)
              .eq('post_id', post.id);

            if (tagsError) throw tagsError;

            // Check if current user liked the post
            const isLiked = currentUser 
              ? likes.some(like => like.user_id === currentUser.id)
              : false;

            return {
              id: post.id,
              userId: post.user_id,
              username: post.profiles.username,
              userProfilePic: post.profiles.profile_picture,
              description: post.description,
              content: post.content || post.description,
              code: post.code,
              media: post.media,
              likes: likes.map(like => like.user_id),
              comments: commentsCount || 0,
              tags: postTags.map(tag => tag.tags.name),
              isLiked,
              createdAt: post.created_at,
              updatedAt: post.updated_at
            };
          })
        );

        return postsWithLikes;
      },
      enabled: !!userId,
    });
  };

  // Create post
  const useCreatePost = () => {
    return useMutation({
      mutationFn: async ({ 
        description, 
        content, 
        code, 
        media, 
        tags 
      }: { 
        description: string; 
        content?: string; 
        code?: string; 
        media?: string; 
        tags?: string[] 
      }) => {
        if (!currentUser) throw new Error('User not authenticated');

        // Step 1: Insert the post
        const { data: post, error: postError } = await supabase
          .from('posts')
          .insert({
            user_id: currentUser.id,
            description,
            content,
            code,
            media
          })
          .select('id')
          .single();

        if (postError) throw postError;

        // Step 2: Process tags if they exist
        if (tags && tags.length > 0) {
          // For each tag, check if it exists, if not create it
          for (const tagName of tags) {
            // Try to get the tag
            let { data: existingTag, error: tagError } = await supabase
              .from('tags')
              .select('id')
              .eq('name', tagName.toLowerCase())
              .single();

            if (tagError && tagError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
              throw tagError;
            }

            let tagId;
            
            // If tag doesn't exist, create it
            if (!existingTag) {
              const { data: newTag, error: createTagError } = await supabase
                .from('tags')
                .insert({ name: tagName.toLowerCase() })
                .select('id')
                .single();

              if (createTagError) throw createTagError;
              
              tagId = newTag.id;
            } else {
              tagId = existingTag.id;
            }

            // Link tag to post
            const { error: linkTagError } = await supabase
              .from('post_tags')
              .insert({
                post_id: post.id,
                tag_id: tagId
              });

            if (linkTagError) throw linkTagError;
          }
        }

        return post;
      },
      onSuccess: () => {
        // Invalidate and refetch the posts queries
        queryClient.invalidateQueries({ queryKey: ['feed'] });
        if (currentUser) {
          queryClient.invalidateQueries({ queryKey: ['userPosts', currentUser.id] });
        }
        toast.success('Post created successfully');
      },
      onError: (error: any) => {
        console.error('Error creating post:', error);
        toast.error(error.message || 'Failed to create post');
      }
    });
  };

  // Like post
  const useLikePost = () => {
    return useMutation({
      mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
        if (!currentUser) throw new Error('User not authenticated');

        if (isLiked) {
          // Unlike the post
          const { error } = await supabase
            .from('likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', currentUser.id);

          if (error) throw error;
        } else {
          // Like the post
          const { error } = await supabase
            .from('likes')
            .insert({
              post_id: postId,
              user_id: currentUser.id
            });

          if (error) throw error;
        }

        return { postId, isLiked: !isLiked };
      },
      onSuccess: (data) => {
        // Update the cache
        queryClient.setQueriesData<Post[]>({ queryKey: ['feed'] }, (oldData) => {
          if (!oldData) return oldData;
          return oldData.map(post => {
            if (post.id === data.postId) {
              const newLikes = data.isLiked 
                ? [...post.likes, currentUser!.id]
                : post.likes.filter(id => id !== currentUser!.id);
              
              return {
                ...post,
                likes: newLikes,
                isLiked: data.isLiked
              };
            }
            return post;
          });
        });

        // Also update user posts cache
        if (currentUser) {
          queryClient.setQueriesData<Post[]>({ queryKey: ['userPosts', currentUser.id] }, (oldData) => {
            if (!oldData) return oldData;
            return oldData.map(post => {
              if (post.id === data.postId) {
                const newLikes = data.isLiked 
                  ? [...post.likes, currentUser!.id]
                  : post.likes.filter(id => id !== currentUser!.id);
                
                return {
                  ...post,
                  likes: newLikes,
                  isLiked: data.isLiked
                };
              }
              return post;
            });
          });
        }
        
        toast.success(data.isLiked ? 'Post liked' : 'Post unliked');
      },
      onError: (error: any) => {
        console.error('Error liking post:', error);
        toast.error(error.message || 'Failed to like post');
      }
    });
  };

  return {
    useFeedPosts,
    useUserPosts,
    useCreatePost,
    useLikePost
  };
};
