
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { MessageSquare, Share, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileHeaderProps {
  username: string;
  bio: string;
  profilePicture: string;
  followersCount: number;
  followingCount: number;
  joinDate: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  username, 
  bio, 
  profilePicture, 
  followersCount, 
  followingCount, 
  joinDate 
}) => {
  const { currentUser } = useAuth();
  const isCurrentUser = currentUser?.username === username;
  const isFollowing = currentUser?.following?.includes(username) || false;
  
  const handleFollowToggle = () => {
    if (!currentUser) return;
    
    // Would be replaced with actual API call
    toast.success(isFollowing ? `Unfollowed ${username}` : `Following ${username}`);
  };

  return (
    <div className="bg-card border rounded-xl p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Avatar className="h-24 w-24 mx-auto md:mx-0">
          <AvatarImage src={profilePicture} alt={username} />
          <AvatarFallback className="text-xl">
            {username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{username}</h1>
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
                  
                  {isFollowing && (
                    <Button variant="outline" asChild>
                      <Link to={`/messages/${username}`}>
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
            {bio && <p className="mb-4">{bio}</p>}
            
            <div className="flex justify-center md:justify-start gap-6 text-sm">
              <div>
                <span className="font-bold">{followersCount}</span>
                <span className="text-muted-foreground ml-1.5">Followers</span>
              </div>
              <div>
                <span className="font-bold">{followingCount}</span>
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
