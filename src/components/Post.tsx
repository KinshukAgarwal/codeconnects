
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { PostService } from '@/utils/db';
import { Image, Code, X } from 'lucide-react';
import { toast } from 'sonner';

interface PostProps {
  onPostCreated?: () => void;
}

const Post: React.FC<PostProps> = ({ onPostCreated }) => {
  const { currentUser } = useAuth();
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!content.trim() && !codeContent.trim()) {
      toast.error("Post cannot be empty");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare post content
      let finalContent = content;
      
      // Add code block if exists
      if (codeContent.trim()) {
        finalContent += `\n\n\`\`\`\n${codeContent.trim()}\n\`\`\``;
      }
      
      // Create the post
      PostService.create({
        userId: currentUser.id,
        description: finalContent,
        tags: tags.length > 0 ? tags : undefined,
        media: mediaUrl.trim() || undefined
      });
      
      // Reset form
      setContent('');
      setTags([]);
      setTagInput('');
      setMediaUrl('');
      setShowCodeEditor(false);
      setCodeContent('');
      
      toast.success("Post created successfully");
      
      // Callback to refresh posts
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      toast.error("Failed to create post");
      console.error(error);
    } finally {
      setIsSubmitting(false);
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
            
            {mediaUrl && (
              <div className="mt-3 relative">
                <img 
                  src={mediaUrl} 
                  alt="Preview" 
                  className="w-full h-auto max-h-60 object-cover rounded-md" 
                  onError={() => {
                    toast.error("Invalid image URL");
                    setMediaUrl('');
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-75"
                  onClick={() => setMediaUrl('')}
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
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-muted-foreground"
              onClick={() => {
                const url = prompt("Enter image URL:");
                if (url) setMediaUrl(url);
              }}
            >
              <Image className="h-4 w-4" />
              <span>Image</span>
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
            Post
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Post;
