
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Send, Search, PlusCircle } from 'lucide-react';
import MessageCard from '@/components/MessageCard';

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantUsername: string;
  participantAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  media?: string | null;
  createdAt: string;
  read: boolean;
}

// Mock function to fetch conversations
const fetchConversations = async (): Promise<Conversation[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [
    {
      id: 'conv-1',
      participantId: 'user-1',
      participantName: 'John Doe',
      participantUsername: 'johndoe',
      participantAvatar: null,
      lastMessage: 'Did you check the new React 18 features?',
      lastMessageTime: '2 hours ago',
      unreadCount: 2,
    },
    {
      id: 'conv-2',
      participantId: 'user-2',
      participantName: 'Jane Smith',
      participantUsername: 'janesmith',
      participantAvatar: null,
      lastMessage: 'I just pushed the fix to the repo',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
    },
    {
      id: 'conv-3',
      participantId: 'user-3',
      participantName: 'Sarah Dev',
      participantUsername: 'sarahdev',
      participantAvatar: null,
      lastMessage: 'Thanks for the code review!',
      lastMessageTime: '3 days ago',
      unreadCount: 0,
    },
  ];
};

// Mock function to fetch messages for a conversation
const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return Array.from({ length: 15 }, (_, i) => ({
    id: `msg-${i}`,
    senderId: i % 2 === 0 ? 'user-123' : ['user-1', 'user-2', 'user-3'][parseInt(conversationId.split('-')[1]) - 1],
    receiverId: i % 2 === 0 ? ['user-1', 'user-2', 'user-3'][parseInt(conversationId.split('-')[1]) - 1] : 'user-123',
    content: `This is message #${i + 1} in the conversation. ${i % 5 === 0 ? 'It might include some code like `const x = 42;`' : ''}`,
    createdAt: new Date(Date.now() - (15 - i) * 600000).toISOString(),
    read: i < 13,
  }));
};

const Messages: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    enabled: !!currentUser,
  });
  
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', selectedConversation],
    queryFn: () => fetchMessages(selectedConversation || ''),
    enabled: !!selectedConversation,
  });
  
  const filteredConversations = conversations.filter(
    conv => conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.participantUsername.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const selectedConversationData = conversations.find(conv => conv.id === selectedConversation);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    // In a real app, this would send the message to the API
    toast({
      title: "Message sent",
      description: "Your message has been sent.",
    });
    
    setMessageText('');
  };
  
  if (!currentUser) {
    return (
      <>
        <Navbar />
        <div className="container py-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Sign in to access messages</h2>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <div className="container grid grid-cols-1 md:grid-cols-3 gap-0 h-[calc(100vh-4rem)]">
        {/* Conversations Sidebar */}
        <div className="md:col-span-1 border-r">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button size="icon" variant="ghost" title="New conversation">
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-1 max-h-[calc(100vh-8rem)] overflow-y-auto">
              {isLoadingConversations ? (
                <div className="flex justify-center p-4">
                  <p>Loading conversations...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted-foreground">No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors ${selectedConversation === conversation.id ? 'bg-secondary' : ''}`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.participantAvatar || ''} />
                        <AvatarFallback>
                          {conversation.participantName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{conversation.participantName}</p>
                          <span className="text-xs text-muted-foreground">{conversation.lastMessageTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center h-5 w-5 text-xs bg-primary text-primary-foreground rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="md:col-span-2 flex flex-col h-full">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConversationData?.participantAvatar || ''} />
                  <AvatarFallback>
                    {selectedConversationData?.participantName.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedConversationData?.participantName}</p>
                  <p className="text-sm text-muted-foreground">@{selectedConversationData?.participantUsername}</p>
                </div>
              </div>
              
              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoadingMessages ? (
                  <div className="flex justify-center p-4">
                    <p>Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center p-4">
                    <p className="text-muted-foreground">No messages yet</p>
                    <p className="text-sm text-muted-foreground">Send a message to start the conversation</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <MessageCard
                      key={message.id}
                      message={message.content}
                      isCurrentUser={message.senderId === currentUser.id}
                      timestamp={new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      isRead={message.read}
                    />
                  ))
                )}
              </div>
              
              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-end gap-2">
                  <Textarea
                    placeholder="Type a message..."
                    className="min-h-[60px] resize-none"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    className="h-10 w-10 rounded-full p-0" 
                    disabled={!messageText.trim()}
                    onClick={handleSendMessage}
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="max-w-sm">
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-muted-foreground mb-4">
                  Choose a conversation from the list or start a new one
                </p>
                <Button variant="outline" className="gap-2" onClick={() => navigate('/explore')}>
                  <PlusCircle className="h-4 w-4" />
                  Find Developers
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Messages;
