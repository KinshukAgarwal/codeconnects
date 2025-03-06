
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface MessageCardProps {
  content: string;
  isCurrentUser: boolean;
  timestamp: string;
  isRead: boolean;
}

const MessageCard: React.FC<MessageCardProps> = ({
  content,
  isCurrentUser,
  timestamp,
  isRead
}) => {
  return (
    <div
      className={cn(
        'flex gap-2 mb-4',
        isCurrentUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'max-w-[70%] rounded-lg p-3',
          isCurrentUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        <p className="text-sm">{content}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-xs opacity-70">
            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
          </span>
          {isCurrentUser && (
            <span className="text-xs opacity-70">
              {isRead ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>

      {isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>ME</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageCard;
