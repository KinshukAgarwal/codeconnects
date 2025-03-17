
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { Image, Code, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePosts } from '@/hooks/usePosts';
import { supabase } from '@/integrations/supabase/client';

interface PostProps {
  onPostCreated?: () => void;
}

const Post: React.FC<PostProps> = ({ onPostCreated }) => {
  const { currentUser } = useAuth();
  const { useCreatePost } = usePosts();
  const { mutate: createPost, isLoading: isSubmitting } = useCreatePost();
  
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [codeContent, setCodeContent] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

    // Show preview
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const uploadMedia = async (): Promise<string | null> => {
    if (!mediaFile) return mediaUrl; // Return URL if already provided
    
    try {
      const fileExt = mediaFile.name.split('.').pop();
      const filePath = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('codeconnect')
        .upload(`posts/${filePath}`, mediaFile);

      if (error) throw error;

      // Get public URL
      const { data: publicURL } = supabase.storage
        .from('codeconnect')
        .getPublicUrl(`posts/${filePath}`);

      return publicURL.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!content.trim() && !codeContent.trim()) {
      toast.error("Post cannot be empty");
      return;
    }
    
    try {
      // Upload media if there's a file
      let finalMediaUrl = null;
      if (mediaFile || mediaUrl) {
        finalMediaUrl = mediaFile ? await uploadMedia() : mediaUrl;
      }
      
      // Create the post
      createPost({
        description: content,
        content: content,
        code: codeContent.trim() || null,
        media: finalMediaUrl || undefined,
        tags: tags.length > 0 ? tags : undefined
      }, {
        onSuccess: () => {
          // Reset form
          setContent('');
          setTags([]);
          setTagInput('');
          setMediaUrl('');
          setMediaFile(null);
          setMediaPreview('');
          setShowCodeEditor(false);
          setCodeContent('');
          
          // Callback to refresh posts
          if (onPostCreated) {
            onPostCreated();
          }
        }
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create post");
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmedTag = tagInput.trim().toLowerCase();
      
      if (trimmedTag && !tags.includes(trimmedTag)) {
        setTags([...tags, trimmedTag]);
      }
      
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleImageUrlInput = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      setMediaUrl(url);
      setMediaFile(null);
      setMediaPreview(url);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="glass rounded-xl p-4 mb-6 animate-scale-in">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser.profilePicture} alt={currentUser.username} />
            <AvatarFallback>{currentUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Textarea
              placeholder="Share something with the developer community..."
              className="w-full resize-none border-none bg-transparent focus-visible:ring-0 p-0 text-base"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
            
            {showCodeEditor && (
              <div className="mt-3 border rounded-md overflow-hidden">
                <div className="bg-secondary/70 px-3 py-2 flex justify-between items-center">
                  <span className="text-xs font-mono">Code</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => {
                      setShowCodeEditor(false);
                      setCodeContent('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  placeholder="Paste or type your code here..."
                  className="w-full resize-none border-none bg-secondary/30 focus-visible:ring-0 font-mono text-sm"
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  rows={5}
                />
              </div>
            )}
            
            {(mediaPreview || mediaUrl) && (
              <div className="mt-3 relative">
                <img 
                  src={mediaPreview || mediaUrl} 
                  alt="Preview" 
                  className="w-full h-auto max-h-60 object-cover rounded-md" 
                  onError={() => {
                    toast.error("Invalid image URL");
                    setMediaUrl('');
                    setMediaPreview('');
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-75"
                  onClick={() => {
                    setMediaUrl('');
                    setMediaFile(null);
                    setMediaPreview('');
                  }}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove image</span>
                </Button>
              </div>
            )}
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {tags.map(tag => (
                  <div 
                    key={tag} 
                    className="bg-secondary text-xs px-2 py-1 rounded-md flex items-center gap-1"
                  >
                    #{tag}
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {tag}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-1 mt-2">
              <input
                type="text"
                placeholder="Add tags..."
                className="text-sm bg-transparent border-none focus:outline-none"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
              <span className="text-xs text-muted-foreground self-center">
                (Press Enter to add)
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
          <div className="flex gap-2">
            <input 
              type="file" 
              id="media-upload" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-muted-foreground"
              onClick={() => document.getElementById('media-upload')?.click()}
            >
              <Image className="h-4 w-4" />
              <span>Upload</span>
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-muted-foreground"
              onClick={handleImageUrlInput}
            >
              <Image className="h-4 w-4" />
              <span>URL</span>
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${
                showCodeEditor ? 'bg-secondary/50' : 'text-muted-foreground'
              }`}
              onClick={() => setShowCodeEditor(!showCodeEditor)}
            >
              <Code className="h-4 w-4" />
              <span>Code</span>
            </Button>
          </div>
          
          <Button 
            type="submit" 
            disabled={
              isSubmitting || 
              (!content.trim() && !codeContent.trim())
            }
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Post;
