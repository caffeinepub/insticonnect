export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  isOnline?: boolean;
  badges?: string[];
  usernameLastChanged?: number; // timestamp ms
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  image?: string;
  storyBg?: string; // gradient if no image
  storyText?: string;
  storyTextColor?: string;
  storyTextBold?: boolean;
  time: string;
  viewed: boolean;
  expiresAt?: number;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  image?: string;
  images?: string[];
  mediaUrl?: string; // alias used in some places
  caption: string;
  likes: number;
  liked: boolean;
  likedBy?: string[]; // array of user IDs who liked
  taggedUsers?: string[]; // array of usernames tagged in post
  saved: boolean;
  comments: Comment[];
  time: string;
  isAnonymous: boolean;
  isPrivate: boolean;
}

export interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  replies?: Comment[];
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  slots: number;
  joined: number;
  isJoined: boolean;
  organizer: string;
  time: string;
  location: string;
}

export interface Discussion {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  title: string;
  body: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  voted: "up" | "down" | null;
  comments: Comment[];
  time: string;
}

export interface Fundae {
  id: string;
  type: "give" | "request";
  username: string;
  avatar: string;
  title: string;
  description: string;
  tags: string[];
  time: string;
}

export interface ChatConversation {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: ChatMessage[];
  isRequest?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  time: string;
}

export interface Notification {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  action: string;
  time: string;
  thumbnail?: string;
  read: boolean;
}

export const currentUser: User = {
  id: "1",
  name: "Aryan Sharma",
  username: "aryan_s",
  email: "aryan@smail.iitm.ac.in",
  avatar: "https://picsum.photos/seed/user1/100/100",
  bio: "CS '26 | Hostel 7 | Building things 🚀",
  followers: 342,
  following: 128,
  posts: 24,
  badges: ["CS '26", "Hostel 7", "Code Club"],
  usernameLastChanged: undefined,
};

export const stories: Story[] = [];
export const posts: Post[] = [];
export const plans: Plan[] = [];
export const discussions: Discussion[] = [];
export const fundaes: Fundae[] = [];
export const chats: ChatConversation[] = [];
export const notifications: Notification[] = [];
export const userPostImages: string[] = [];

export interface GroupChat {
  id: string;
  name: string;
  isGroup: boolean;
  avatar: string;
  lastMessage: string;
  unread: number;
  messages: ChatMessage[];
}

export const groupChats: GroupChat[] = [];

// ─── Highlights ─────────────────────────────────────────────────────────────

export interface Highlight {
  id: string;
  title: string;
  emoji: string;
  coverImage?: string;
  stories: Story[];
}

export const currentUserHighlights: Highlight[] = [];

// ─── Mock Users (for search / other profiles) ───────────────────────────────

export const mockUsers: User[] = [];
