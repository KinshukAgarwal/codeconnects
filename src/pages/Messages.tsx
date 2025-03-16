
import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import MessageCard from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PhoneCall, Video, MoreHorizontal, Send, Paperclip, Smile } from 'lucide-react';

// Later this will be fetched from database
const conversations = [
  {
    id: 'user-1',
    username: 'janesmith',
    name: 'Jane Smith',
    profilePic: null,
    lastMessage: 'Did you see the new React updates?',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    unread: 2,
    online: true
  },
  {
    id: 'user-2',
    username: 'tomscott',
    name: 'Tom Scott',
    profilePic: null,
    lastMessage: 'I fixed that bug we talked about',
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
    unread: 0,
    online: false
  },
  {
    id: 'user-3',
    username: 'sarahdev',
    name: 'Sarah Developer',
    profilePic: null,
    lastMessage: 'Thanks for the help with TypeScript!',
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    unread: 0,
    online: true
  }
];

// Mock message data
const generateMessages = (username: string) => {
  const baseDate = new Date();
  const messages = [
    {
      id: '1',
      content: 'Hey there! How\'s your coding project going?',
      isCurrentUser: false,
      timestamp: new Date(baseDate.getTime() - 60 * 60000).toISOString(),
      isRead: true
    },
    {
      id: '2',
      content: 'It\'s going well! Just struggling with some TypeScript types.',
      isCurrentUser: true,
      timestamp: new Date(baseDate.getTime() - 55 * 60000).toISOString(),
      isRead: true
    },
    {
      id: '3',
      content: 'I\'m working on a React app with Tailwind. The UI is coming together nicely.',
      isCurrentUser: true,
      timestamp: new Date(baseDate.getTime() - 54 * 60000).toISOString(),
      isRead: true
    },
    {
      id: '4',
      content: 'That sounds great! Tailwind is amazing for productivity. Need any help with the TypeScript issues?',
      isCurrentUser: false,
      timestamp: new Date(baseDate.getTime() - 45 * 60000).toISOString(),
      isRead: true
    },
    {
      id: '5',
      content: 'Thanks for offering! I\'m trying to define proper interfaces for my components props.',
      isCurrentUser: true,
      timestamp: new Date(baseDate.getTime() - 30 * 60000).toISOString(),
      isRead: true
    },
    {
      id: '6',
      content: 'Here\'s an example of a type definition that might help:\n\ninterface User {\n  id: string;\n  name: string;\n  email?: string;\n}',
      isCurrentUser: false,
      timestamp: new Date(baseDate.getTime() - 25 * 60000).toISOString(),
      isRead: true
    },
    {
      id: '7',
      content: 'That\'s exactly what I needed! Thank you so much.',
      isCurrentUser: true,
      timestamp: new Date(baseDate.getTime() - 20 * 60000).toISOString(),
      isRead: true
    },
    {
      id: '8',
      content: 'How\'s the rest of the project going? Any other challenges?',
      isCurrentUser: false,
      timestamp: new Date(baseDate.getTime() - 15 * 60000).toISOString(),
      isRead: false
    }
  ];
  
  return messages;
};

const Messages: React.FC = () => {
  const { username } = useParams<{ username?: string }>();
  const { currentUser } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [currentMessages, setCurrentMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Find the active conversation
  const activeConversation = username 
    ? conversations.find(c => c.username === username) 
    : null;
  
  // Prepare messages for the active conversation
  useEffect(() => {
    if (username) {
      const messages = generateMessages(username);
      setCurrentMessages(messages);
    }
  }, [username]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !username) return;
    
    // Add new message
    const newMsg = {
      id: Date.now().toString(),
      content: newMessage,
      isCurrentUser: true,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    setCurrentMessages([...currentMessages, newMsg]);
    setNewMessage('');
  };
  
  return (
    <>
      <Navbar />
      <div className="container grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-0 md:gap-6 h-[calc(100vh-4rem)] py-6">
        {/* Conversation List - Hidden on mobile when in a conversation */}
        <div className={`hidden md:block md:col-span-1 h-full ${username ? '' : 'col-span-full'}`}>
          <Card className="h-full">
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-xl">Messages</CardTitle>
            </CardHeader>
            <Separator />
            <ScrollArea className="h-[calc(100%-4rem)]">
              <CardContent className="px-3 py-3">
                {conversations.map((conversation) => (
                  <Link
                    to={`/messages/${conversation.username}`}
                    key={conversation.id}
                    className="block"
                  >
                    <div className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      conversation.username === username ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}>
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback>
                            {conversation.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.online && (
                          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-medium text-sm truncate">{conversation.name}</h4>
                          <span className="text-xs text-muted-foreground">
                            {new Date(conversation.timestamp).toLocaleDateString(undefined, { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs truncate text-muted-foreground">
                            {conversation.lastMessage}
                          </p>
                          {conversation.unread > 0 && (
                            <span className="flex-shrink-0 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                              {conversation.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </ScrollArea>
          </Card>
        </div>

        {/* Message View or Empty State */}
        <div className={`col-span-1 md:col-span-2 lg:col-span-3 h-full ${username ? '' : 'hidden md:block'}`}>
          {username && activeConversation ? (
            <Card className="h-full flex flex-col">
              {/* Conversation Header */}
              <CardHeader className="px-4 py-3 border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Link to={`/profile/${activeConversation.username}`}>
                      <Avatar>
                        <AvatarFallback>
                          {activeConversation.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div>
                      <Link to={`/profile/${activeConversation.username}`}>
                        <h3 className="font-medium hover:underline">{activeConversation.name}</h3>
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {activeConversation.online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" title="Audio call">
                      <PhoneCall className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Video call">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="More options">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {currentMessages.map((msg) => (
                    <MessageCard
                      key={msg.id}
                      content={msg.content}
                      isCurrentUser={msg.isCurrentUser}
                      timestamp={msg.timestamp}
                      isRead={msg.isRead}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-3 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    size="icon"
                    disabled={!newMessage.trim()}
                    className="flex-shrink-0"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center max-w-md p-6">
                <h3 className="text-2xl font-semibold mb-2">Your Messages</h3>
                <p className="text-muted-foreground mb-6">
                  Send private messages to other developers to collaborate on projects.
                </p>
                <Button asChild>
                  <Link to="/explore">Find Developers</Link>
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default Messages;
