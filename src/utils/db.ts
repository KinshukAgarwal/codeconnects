
// Mock database utilities for demonstration
// In a real application, this would connect to your MySQL database

interface Post {
  id: string;
  userId: string;
  description: string;
  tags?: string[];
  media?: string;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
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

interface User {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  followers: string[];
  following: string[];
  createdAt: string;
}

// Mock data for development
const mockUsers: User[] = [
  {
    id: "user-123",
    username: "devuser",
    email: "dev@example.com",
    profilePicture: "https://source.unsplash.com/random/200x200/?portrait",
    bio: "Full-stack developer passionate about web technologies",
    followers: ["user-456", "user-789"],
    following: ["user-456"],
    createdAt: new Date().toISOString()
  },
  {
    id: "user-456",
    username: "codemaster",
    email: "code@example.com",
    profilePicture: "https://source.unsplash.com/random/200x200/?developer",
    bio: "Backend developer and system architect",
    followers: ["user-123", "user-789"],
    following: ["user-123", "user-789"],
    createdAt: new Date().toISOString()
  },
  {
    id: "user-789",
    username: "uidesigner",
    email: "ui@example.com",
    profilePicture: "https://source.unsplash.com/random/200x200/?designer",
    bio: "UI/UX designer with a passion for clean interfaces",
    followers: ["user-456"],
    following: ["user-123", "user-456"],
    createdAt: new Date().toISOString()
  }
];

const mockPosts: Post[] = [
  {
    id: "post-1",
    userId: "user-123",
    description: "Just finished building a new React component library! Check out the code below:",
    tags: ["react", "typescript", "ui"],
    media: "https://source.unsplash.com/random/800x600/?code",
    likes: ["user-456", "user-789"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "post-2",
    userId: "user-456",
    description: "Optimized our database queries and got a 40% performance improvement. Here's how:",
    tags: ["database", "optimization", "performance"],
    likes: ["user-123"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "post-3",
    userId: "user-789",
    description: "New design system I've been working on. Feedback welcome!",
    tags: ["design", "ui", "ux"],
    media: "https://source.unsplash.com/random/800x600/?design",
    likes: ["user-123", "user-456"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockComments: Comment[] = [
  {
    id: "comment-1",
    postId: "post-1",
    userId: "user-456",
    content: "Great work! Love the component architecture.",
    createdAt: new Date().toISOString()
  },
  {
    id: "comment-2",
    postId: "post-1",
    userId: "user-789",
    content: "The UI looks clean. What styling solution are you using?",
    createdAt: new Date().toISOString()
  },
  {
    id: "comment-3",
    postId: "post-2",
    userId: "user-123",
    content: "Would love to see a breakdown of the optimization techniques!",
    createdAt: new Date().toISOString()
  }
];

const mockMessages: Message[] = [
  {
    id: "message-1",
    senderId: "user-123",
    receiverId: "user-456",
    content: "Hey, did you see my latest post about the React library?",
    createdAt: new Date().toISOString(),
    read: true
  },
  {
    id: "message-2",
    senderId: "user-456",
    receiverId: "user-123",
    content: "Yes, it looks great! I left a comment.",
    createdAt: new Date().toISOString(),
    read: true
  },
  {
    id: "message-3",
    senderId: "user-789",
    receiverId: "user-456",
    content: "Could you review my latest design mockups?",
    createdAt: new Date().toISOString(),
    read: false
  }
];

// Store data in localStorage for persistence across page refreshes
const initializeLocalStorage = () => {
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem('posts')) {
    localStorage.setItem('posts', JSON.stringify(mockPosts));
  }
  if (!localStorage.getItem('comments')) {
    localStorage.setItem('comments', JSON.stringify(mockComments));
  }
  if (!localStorage.getItem('messages')) {
    localStorage.setItem('messages', JSON.stringify(mockMessages));
  }
};

// Initialize storage when the module is imported
initializeLocalStorage();

// Generic function to get all items of a specific type
const getAll = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Generic function to get item by ID
const getById = <T extends { id: string }>(key: string, id: string): T | null => {
  const items = getAll<T>(key);
  return items.find(item => item.id === id) || null;
};

// Generic function to add an item
const add = <T extends { id: string }>(key: string, item: T): T => {
  const items = getAll<T>(key);
  items.push(item);
  localStorage.setItem(key, JSON.stringify(items));
  return item;
};

// Generic function to update an item
const update = <T extends { id: string }>(key: string, item: T): T => {
  const items = getAll<T>(key);
  const index = items.findIndex(i => i.id === item.id);
  if (index !== -1) {
    items[index] = { ...items[index], ...item };
    localStorage.setItem(key, JSON.stringify(items));
  }
  return items[index];
};

// Generic function to delete an item
const remove = <T extends { id: string }>(key: string, id: string): boolean => {
  const items = getAll<T>(key);
  const newItems = items.filter(item => item.id !== id);
  localStorage.setItem(key, JSON.stringify(newItems));
  return newItems.length < items.length;
};

// User-specific functions
export const UserService = {
  getAll: () => getAll<User>('users'),
  getById: (id: string) => getById<User>('users', id),
  getByUsername: (username: string) => {
    const users = getAll<User>('users');
    return users.find(user => user.username === username) || null;
  },
  create: (user: Omit<User, 'id' | 'createdAt' | 'followers' | 'following'>) => {
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      followers: [],
      following: [],
      createdAt: new Date().toISOString()
    };
    return add<User>('users', newUser);
  },
  update: (user: Partial<User> & { id: string }) => {
    const existingUser = getById<User>('users', user.id);
    if (!existingUser) return null;
    
    const updatedUser = { ...existingUser, ...user };
    return update<User>('users', updatedUser);
  },
  delete: (id: string) => remove<User>('users', id),
  follow: (followerId: string, followeeId: string) => {
    const follower = getById<User>('users', followerId);
    const followee = getById<User>('users', followeeId);
    
    if (!follower || !followee) return false;
    
    if (!follower.following.includes(followeeId)) {
      follower.following.push(followeeId);
      update<User>('users', follower);
    }
    
    if (!followee.followers.includes(followerId)) {
      followee.followers.push(followerId);
      update<User>('users', followee);
    }
    
    return true;
  },
  unfollow: (followerId: string, followeeId: string) => {
    const follower = getById<User>('users', followerId);
    const followee = getById<User>('users', followeeId);
    
    if (!follower || !followee) return false;
    
    follower.following = follower.following.filter(id => id !== followeeId);
    update<User>('users', follower);
    
    followee.followers = followee.followers.filter(id => id !== followerId);
    update<User>('users', followee);
    
    return true;
  },
  search: (query: string) => {
    const users = getAll<User>('users');
    const lowerQuery = query.toLowerCase();
    return users.filter(
      user => 
        user.username.toLowerCase().includes(lowerQuery) || 
        (user.bio && user.bio.toLowerCase().includes(lowerQuery))
    );
  }
};

// Post-specific functions
export const PostService = {
  getAll: () => getAll<Post>('posts'),
  getById: (id: string) => getById<Post>('posts', id),
  getByUserId: (userId: string) => {
    const posts = getAll<Post>('posts');
    return posts.filter(post => post.userId === userId);
  },
  getFeed: (userIds: string[]) => {
    const posts = getAll<Post>('posts');
    return posts
      .filter(post => userIds.includes(post.userId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  create: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'likes'>) => {
    const newPost: Post = {
      ...post,
      id: `post-${Date.now()}`,
      likes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return add<Post>('posts', newPost);
  },
  update: (post: Partial<Post> & { id: string }) => {
    const existingPost = getById<Post>('posts', post.id);
    if (!existingPost) return null;
    
    const updatedPost = { 
      ...existingPost, 
      ...post, 
      updatedAt: new Date().toISOString() 
    };
    return update<Post>('posts', updatedPost);
  },
  delete: (id: string) => remove<Post>('posts', id),
  like: (postId: string, userId: string) => {
    const post = getById<Post>('posts', postId);
    if (!post) return false;
    
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      update<Post>('posts', post);
    }
    
    return true;
  },
  unlike: (postId: string, userId: string) => {
    const post = getById<Post>('posts', postId);
    if (!post) return false;
    
    post.likes = post.likes.filter(id => id !== userId);
    update<Post>('posts', post);
    
    return true;
  },
  search: (query: string) => {
    const posts = getAll<Post>('posts');
    const lowerQuery = query.toLowerCase();
    return posts.filter(
      post => 
        post.description.toLowerCase().includes(lowerQuery) || 
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  }
};

// Comment-specific functions
export const CommentService = {
  getAll: () => getAll<Comment>('comments'),
  getById: (id: string) => getById<Comment>('comments', id),
  getByPostId: (postId: string) => {
    const comments = getAll<Comment>('comments');
    return comments
      .filter(comment => comment.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },
  create: (comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...comment,
      id: `comment-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    return add<Comment>('comments', newComment);
  },
  update: (comment: Partial<Comment> & { id: string }) => {
    const existingComment = getById<Comment>('comments', comment.id);
    if (!existingComment) return null;
    
    const updatedComment = { ...existingComment, ...comment };
    return update<Comment>('comments', updatedComment);
  },
  delete: (id: string) => remove<Comment>('comments', id)
};

// Message-specific functions
export const MessageService = {
  getAll: () => getAll<Message>('messages'),
  getById: (id: string) => getById<Message>('messages', id),
  getConversation: (user1Id: string, user2Id: string) => {
    const messages = getAll<Message>('messages');
    return messages
      .filter(
        msg => 
          (msg.senderId === user1Id && msg.receiverId === user2Id) || 
          (msg.senderId === user2Id && msg.receiverId === user1Id)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },
  getUserConversations: (userId: string) => {
    const messages = getAll<Message>('messages');
    const users = getAll<User>('users');
    
    // Find all users with whom the current user has exchanged messages
    const conversationUserIds = new Set<string>();
    
    messages.forEach(msg => {
      if (msg.senderId === userId) {
        conversationUserIds.add(msg.receiverId);
      } else if (msg.receiverId === userId) {
        conversationUserIds.add(msg.senderId);
      }
    });
    
    // Get the latest message for each conversation
    return Array.from(conversationUserIds).map(otherUserId => {
      const conversation = messages
        .filter(
          msg => 
            (msg.senderId === userId && msg.receiverId === otherUserId) || 
            (msg.senderId === otherUserId && msg.receiverId === userId)
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      const otherUser = users.find(user => user.id === otherUserId);
      const latestMessage = conversation[0];
      
      return {
        user: otherUser,
        latestMessage,
        unreadCount: conversation.filter(msg => msg.receiverId === userId && !msg.read).length
      };
    });
  },
  create: (message: Omit<Message, 'id' | 'createdAt' | 'read'>) => {
    const newMessage: Message = {
      ...message,
      id: `message-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false
    };
    return add<Message>('messages', newMessage);
  },
  markAsRead: (messageId: string) => {
    const message = getById<Message>('messages', messageId);
    if (!message) return false;
    
    message.read = true;
    update<Message>('messages', message);
    
    return true;
  },
  markConversationAsRead: (userId: string, otherUserId: string) => {
    const messages = getAll<Message>('messages');
    const unreadMessages = messages.filter(
      msg => msg.senderId === otherUserId && msg.receiverId === userId && !msg.read
    );
    
    unreadMessages.forEach(msg => {
      msg.read = true;
      update<Message>('messages', msg);
    });
    
    return unreadMessages.length;
  }
};

// Initialize the DB with mock data (only in development)
export const initializeDb = () => {
  localStorage.setItem('users', JSON.stringify(mockUsers));
  localStorage.setItem('posts', JSON.stringify(mockPosts));
  localStorage.setItem('comments', JSON.stringify(mockComments));
  localStorage.setItem('messages', JSON.stringify(mockMessages));
};
