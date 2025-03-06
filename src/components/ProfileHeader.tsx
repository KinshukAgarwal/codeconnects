
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { UserService } from '@/utils/db';
import { MessageSquare, Share, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  profilePicture?: string;
  bio?: string;
  followers: string[];
  following: string[];
  createdAt: string;
}

interface ProfileHeaderProps {
  user: User;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const { currentUser, updateProfile } = useAuth();
  const isCurrentUser = currentUser?.id === user.id;
  const isFollowing = currentUser?.following.includes(user.id) || false;
  const isFollowedByUser = user.following.includes(currentUser?.id || '');
  const isMutualFollow = isFollowing && isFollowedByUser;
  
  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  const handleFollowToggle = () => {
    if (!currentUser) return;
    
    try {
      if (isFollowing) {
        UserService.unfollow(currentUser.id, user.id);
        // Update current user's state
        updateProfile({
          ...currentUser,
          following: currentUser.following.filter(id => id !== user.id)
        });
        toast.success(`Unfollowed ${user.username}`);
      } else {
        UserService.follow(currentUser.id, user.id);
        // Update current user's state
        updateProfile({
          ...currentUser,
          following: [...currentUser.following, user.id]
        });
        toast.success(`Following ${user.username}`);
      }
    } catch (error) {
      toast.error("Failed to update follow status");
      console.error(error);
    }
  };

  return (
    <div className="glass rounded-xl p-6 mb-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6">
        <Avatar className="h-24 w-24 mx-auto md:mx-0">
          <AvatarImage src={user.profilePicture} alt={user.username} />
          <AvatarFallback className="text-xl">
            {user.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-muted-foreground">Joined {joinDate}</p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end gap-2">
              {isCurrentUser ? (
                <Button variant="outline" asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
              ) : (
                <>
                  <Button 
                    variant={isFollowing ? "secondary" : "default"}
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                  
                  {isMutualFollow && (
                    <Button variant="outline" asChild>
                      <Link to={`/messages/${user.username}`}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message
                      </Link>
                    </Button>
                  )}
                </>
              )}
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Profile link copied to clipboard!');
                }}
              >
                <Share className="h-4 w-4" />
                <span className="sr-only">Share profile</span>
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            {user.bio && <p className="mb-4">{user.bio}</p>}
            
            <div className="flex justify-center md:justify-start gap-6 text-sm">
              <div>
                <span className="font-bold">{user.followers.length}</span>
                <span className="text-muted-foreground ml-1.5">Followers</span>
              </div>
              <div>
                <span className="font-bold">{user.following.length}</span>
                <span className="text-muted-foreground ml-1.5">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
