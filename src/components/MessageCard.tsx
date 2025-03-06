
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { UserService } from '@/utils/db';

interface User {
  id: string;
  username: string;
  profilePicture?: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  media?: string;
  createdAt: string;
  read: boolean;
}

interface MessageCardProps {
  user: User | undefined;
  latestMessage: Message;
  unreadCount: number;
  currentUserId: string;
}

const MessageCard: React.FC<MessageCardProps> = ({ 
  user, 
  latestMessage, 
  unreadCount, 
  currentUserId 
}) => {
  const [sender, setSender] = useState<User | null>(null);
  const timeAgo = formatDistanceToNow(new Date(latestMessage.createdAt), { addSuffix: true });
  const isReceived = latestMessage.receiverId === currentUserId;
  
  useEffect(() => {
    if (!user && latestMessage) {
      const senderId = latestMessage.senderId;
      const messageSender = UserService.getById(senderId);
      if (messageSender) {
        setSender(messageSender);
      }
    }
  }, [user, latestMessage]);
  
  const displayUser = user || sender;
  if (!displayUser) return null;
  
  return (
    <Link 
      to={`/messages/${displayUser.username}`}
      className="flex items-center gap-3 p-3 hover:bg-muted/40 rounded-lg transition-colors relative"
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={displayUser.profilePicture} alt={displayUser.username} />
        <AvatarFallback>{displayUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{displayUser.username}</h3>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        
        <div className="flex items-center gap-1">
          {!isReceived && <span className="text-xs text-muted-foreground">You: </span>}
          <p className="text-sm truncate text-muted-foreground">
            {latestMessage.content}
          </p>
        </div>
      </div>
      
      {unreadCount > 0 && (
        <Badge variant="default" className="bg-accent text-white">
          {unreadCount}
        </Badge>
      )}
    </Link>
  );
};

export default MessageCard;
