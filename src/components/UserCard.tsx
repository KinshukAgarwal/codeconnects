
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { UserService } from '@/utils/db';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  profilePicture?: string;
  bio?: string;
  followers: string[];
  following: string[];
}

interface UserCardProps {
  user: User;
  variant?: 'default' | 'compact';
  showBio?: boolean;
  showFollowButton?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  variant = 'default',
  showBio = true,
  showFollowButton = true
}) => {
  const { currentUser, updateProfile } = useAuth();
  const isCurrentUser = currentUser?.id === user.id;
  const isFollowing = currentUser?.following.includes(user.id) || false;

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

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-2 hover:bg-muted/40 rounded-md transition-colors">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.profilePicture} alt={user.username} />
          <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${user.username}`} className="hover:underline font-medium">
            {user.username}
          </Link>
          {showBio && user.bio && (
            <p className="text-xs text-muted-foreground truncate">{user.bio}</p>
          )}
        </div>
        {showFollowButton && !isCurrentUser && (
          <Button 
            variant={isFollowing ? "secondary" : "default"} 
            size="sm"
            onClick={handleFollowToggle}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 border rounded-xl bg-card animate-scale-in">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.profilePicture} alt={user.username} />
          <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Link 
            to={`/profile/${user.username}`} 
            className="text-lg font-medium hover:underline"
          >
            {user.username}
          </Link>
          {showBio && user.bio && (
            <p className="text-sm text-muted-foreground mt-1">{user.bio}</p>
          )}
        </div>
        {showFollowButton && !isCurrentUser && (
          <Button 
            variant={isFollowing ? "secondary" : "default"} 
            size="sm"
            onClick={handleFollowToggle}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
        )}
      </div>
      
      <div className="flex gap-4 mt-4 text-sm">
        <div>
          <span className="font-medium">{user.followers.length}</span>
          <span className="text-muted-foreground ml-1">followers</span>
        </div>
        <div>
          <span className="font-medium">{user.following.length}</span>
          <span className="text-muted-foreground ml-1">following</span>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
