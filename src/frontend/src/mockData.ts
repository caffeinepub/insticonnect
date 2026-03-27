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
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  image?: string;
  images?: string[];
  caption: string;
  likes: number;
  liked: boolean;
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

export const stories: Story[] = [
  {
    id: "s1",
    userId: "2",
    username: "priya_r",
    avatar: "https://picsum.photos/seed/av2/100/100",
    image: "https://picsum.photos/seed/story1/400/700",
    time: "2h",
    viewed: false,
  },
  {
    id: "s2",
    userId: "3",
    username: "karthik_m",
    avatar: "https://picsum.photos/seed/av3/100/100",
    image: "https://picsum.photos/seed/story2/400/700",
    time: "4h",
    viewed: false,
  },
  {
    id: "s3",
    userId: "4",
    username: "sneha_p",
    avatar: "https://picsum.photos/seed/av4/100/100",
    image: "https://picsum.photos/seed/story3/400/700",
    time: "5h",
    viewed: true,
  },
  {
    id: "s4",
    userId: "5",
    username: "dev_k",
    avatar: "https://picsum.photos/seed/av5/100/100",
    image: "https://picsum.photos/seed/story4/400/700",
    time: "6h",
    viewed: true,
  },
  {
    id: "s5",
    userId: "6",
    username: "anika_s",
    avatar: "https://picsum.photos/seed/av6/100/100",
    image: "https://picsum.photos/seed/story5/400/700",
    time: "8h",
    viewed: false,
  },
  {
    id: "s6",
    userId: "7",
    username: "rohan_v",
    avatar: "https://picsum.photos/seed/av7/100/100",
    image: "https://picsum.photos/seed/story6/400/700",
    time: "10h",
    viewed: true,
  },
  {
    id: "s7",
    userId: "8",
    username: "meera_j",
    avatar: "https://picsum.photos/seed/av8/100/100",
    image: "https://picsum.photos/seed/story7/400/700",
    time: "12h",
    viewed: false,
  },
];

export const posts: Post[] = [
  {
    id: "p1",
    userId: "2",
    username: "priya_r",
    avatar: "https://picsum.photos/seed/av2/100/100",
    image: "https://picsum.photos/seed/post1/600/400",
    images: [
      "https://picsum.photos/seed/post1/600/400",
      "https://picsum.photos/seed/post1b/600/400",
      "https://picsum.photos/seed/post1c/600/400",
    ],
    caption:
      "Beautiful sunset from the OAT! Golden hour hits different here 🌅 #IITMadras #CampusLife",
    likes: 234,
    liked: false,
    saved: false,
    time: "2h",
    isAnonymous: false,
    isPrivate: false,
    comments: [
      {
        id: "c1",
        username: "karthik_m",
        avatar: "https://picsum.photos/seed/av3/100/100",
        text: "Absolutely stunning! 😍",
        time: "1h",
        likes: 12,
      },
      {
        id: "c2",
        username: "aryan_s",
        avatar: "https://picsum.photos/seed/user1/100/100",
        text: "Campus life > everything",
        time: "45m",
        likes: 8,
      },
    ],
  },
  {
    id: "p2",
    userId: "3",
    username: "karthik_m",
    avatar: "https://picsum.photos/seed/av3/100/100",
    image: "https://picsum.photos/seed/post2/600/400",
    images: [
      "https://picsum.photos/seed/post2/600/400",
      "https://picsum.photos/seed/post2b/600/400",
    ],
    caption:
      "Hackathon season is here! 48 hours of pure coding madness. Wish us luck! 💻🔥",
    likes: 189,
    liked: true,
    saved: true,
    time: "4h",
    isAnonymous: false,
    isPrivate: false,
    comments: [
      {
        id: "c3",
        username: "sneha_p",
        avatar: "https://picsum.photos/seed/av4/100/100",
        text: "Go team! You got this 🚀",
        time: "3h",
        likes: 15,
      },
    ],
  },
  {
    id: "p3",
    userId: "0",
    username: "anonymous",
    avatar: "https://picsum.photos/seed/anon/100/100",
    caption:
      "Does anyone else feel like the mess food has gotten worse this semester? Not naming hostel names... 😅",
    likes: 412,
    liked: false,
    saved: false,
    time: "6h",
    isAnonymous: true,
    isPrivate: false,
    comments: [
      {
        id: "c4",
        username: "rohan_v",
        avatar: "https://picsum.photos/seed/av7/100/100",
        text: "Say it louder for the wardens in the back",
        time: "5h",
        likes: 89,
      },
      {
        id: "c5",
        username: "anika_s",
        avatar: "https://picsum.photos/seed/av6/100/100",
        text: "H7 mess is actually decent tbh",
        time: "4h",
        likes: 23,
      },
    ],
  },
  {
    id: "p4",
    userId: "5",
    username: "dev_k",
    avatar: "https://picsum.photos/seed/av5/100/100",
    image: "https://picsum.photos/seed/post4/600/400",
    caption:
      "Library study session at 2am. The grind never stops. CFD project due tomorrow 😭📚",
    likes: 156,
    liked: false,
    saved: false,
    time: "8h",
    isAnonymous: false,
    isPrivate: true,
    comments: [],
  },
  {
    id: "p5",
    userId: "6",
    username: "anika_s",
    avatar: "https://picsum.photos/seed/av6/100/100",
    image: "https://picsum.photos/seed/post5/600/400",
    caption:
      "Saarang prep is going insane! The cultural team is absolutely killing it this year 🎭✨",
    likes: 521,
    liked: true,
    saved: true,
    time: "1d",
    isAnonymous: false,
    isPrivate: false,
    comments: [
      {
        id: "c6",
        username: "meera_j",
        avatar: "https://picsum.photos/seed/av8/100/100",
        text: "Can't wait for Saarang!! 🎉",
        time: "20h",
        likes: 45,
      },
    ],
  },
  {
    id: "p6",
    userId: "7",
    username: "rohan_v",
    avatar: "https://picsum.photos/seed/av7/100/100",
    image: "https://picsum.photos/seed/post6/600/400",
    caption:
      "Found this hidden gem near the lake. Perfect spot for morning runs 🏃‍♂️🌿",
    likes: 298,
    liked: false,
    saved: true,
    time: "1d",
    isAnonymous: false,
    isPrivate: false,
    comments: [],
  },
];

export const plans: Plan[] = [
  {
    id: "pl1",
    title: "Morning Frisbee at SAC Ground",
    description:
      "Casual frisbee session for all skill levels. Bring water and good vibes!",
    category: "Sports",
    tags: ["outdoor", "casual", "morning"],
    slots: 12,
    joined: 7,
    isJoined: false,
    organizer: "rohan_v",
    time: "Tomorrow 6:30 AM",
    location: "SAC Ground",
  },
  {
    id: "pl2",
    title: "ML Study Circle – Week 3",
    description:
      "Covering CNNs and attention mechanisms. Slides shared beforehand.",
    category: "Study",
    tags: ["ML", "AI", "deeplearning"],
    slots: 8,
    joined: 8,
    isJoined: true,
    organizer: "aryan_s",
    time: "Today 7 PM",
    location: "CLT 217",
  },
  {
    id: "pl3",
    title: "Hostel Food Crawl 🍽️",
    description:
      "Trying out all 7 hostel messes in one evening. Ambitious? Yes. Worth it? Absolutely.",
    category: "Food",
    tags: ["food", "hostel", "fun"],
    slots: 6,
    joined: 4,
    isJoined: false,
    organizer: "sneha_p",
    time: "Sat 6 PM",
    location: "Campus Wide",
  },
  {
    id: "pl4",
    title: "Indie Dev Jam",
    description:
      "Build a small game in 3 hours. Any stack, any genre. Prizes for best concept!",
    category: "Tech",
    tags: ["gamedev", "coding", "hackathon"],
    slots: 20,
    joined: 15,
    isJoined: true,
    organizer: "dev_k",
    time: "Sun 2 PM",
    location: "IC Lab",
  },
  {
    id: "pl5",
    title: "Open Mic Night 🎤",
    description:
      "Share your poetry, jokes, or music. All genres welcome, no judgment!",
    category: "Music",
    tags: ["music", "creative", "openmic"],
    slots: 15,
    joined: 11,
    isJoined: false,
    organizer: "anika_s",
    time: "Fri 8 PM",
    location: "OAT",
  },
  {
    id: "pl6",
    title: "Badminton Tournament (Doubles)",
    description: "Casual doubles tournament. Register with your partner!",
    category: "Sports",
    tags: ["badminton", "tournament", "sports"],
    slots: 16,
    joined: 10,
    isJoined: false,
    organizer: "karthik_m",
    time: "Sat 4 PM",
    location: "Indoor Courts",
  },
  {
    id: "pl7",
    title: "Research Paper Reading Club",
    description:
      'Discussing "Attention is All You Need" — come with questions!',
    category: "Study",
    tags: ["research", "transformers", "NLP"],
    slots: 10,
    joined: 6,
    isJoined: false,
    organizer: "priya_r",
    time: "Mon 5 PM",
    location: "CRC",
  },
  {
    id: "pl8",
    title: "Photography Walk – Deer Park",
    description:
      "Golden hour walk through the deer park. All phone photographers welcome!",
    category: "Social",
    tags: ["photography", "nature", "walk"],
    slots: 10,
    joined: 3,
    isJoined: false,
    organizer: "meera_j",
    time: "Sun 5:30 PM",
    location: "Deer Park",
  },
];

export const discussions: Discussion[] = [
  {
    id: "d1",
    userId: "2",
    username: "priya_r",
    avatar: "https://picsum.photos/seed/av2/100/100",
    title: "Best strategies for CGP improvement in 4th semester?",
    body: "I had a rough 3rd sem (7.2 CGPA) and really want to bounce back. Any tips on resource allocation, study techniques, or specific profs to take electives with?",
    tags: ["academics", "cgpa", "studytips"],
    upvotes: 89,
    downvotes: 3,
    voted: null,
    time: "3h",
    comments: [
      {
        id: "dc1",
        username: "aryan_s",
        avatar: "https://picsum.photos/seed/user1/100/100",
        text: "Focus on your weak subjects first. Also, attend every tutorial — it shows up in internal marks.",
        time: "2h",
        likes: 34,
        replies: [
          {
            id: "dc1r1",
            username: "priya_r",
            avatar: "https://picsum.photos/seed/av2/100/100",
            text: "Good point about tutorials! I've been skipping them 😬",
            time: "1h",
            likes: 5,
          },
        ],
      },
      {
        id: "dc2",
        username: "karthik_m",
        avatar: "https://picsum.photos/seed/av3/100/100",
        text: "Take Prof. Rajan for MA2040 — best teacher on campus, guaranteed grade improvement.",
        time: "1h",
        likes: 21,
      },
    ],
  },
  {
    id: "d2",
    userId: "5",
    username: "dev_k",
    avatar: "https://picsum.photos/seed/av5/100/100",
    title: "Which hostel has the best mess food? (Real talk)",
    body: "After 2 years here I've tried most hostels. Sharing my unbiased ranking. Drop yours!",
    tags: ["hostel", "food", "campuslife"],
    upvotes: 234,
    downvotes: 12,
    voted: "up",
    time: "1d",
    comments: [
      {
        id: "dc3",
        username: "anika_s",
        avatar: "https://picsum.photos/seed/av6/100/100",
        text: "Unpopular opinion: Godav mess is underrated.",
        time: "20h",
        likes: 45,
      },
    ],
  },
  {
    id: "d3",
    userId: "6",
    username: "anika_s",
    avatar: "https://picsum.photos/seed/av6/100/100",
    title: "Saarang 2026 – which events are you most hyped for?",
    body: "Lineup drops next week! Sharing some rumours I've heard from the cultural council...",
    tags: ["saarang", "cultural", "events"],
    upvotes: 167,
    downvotes: 5,
    voted: null,
    time: "2d",
    comments: [],
  },
  {
    id: "d4",
    userId: "3",
    username: "karthik_m",
    avatar: "https://picsum.photos/seed/av3/100/100",
    title: "LeetCode vs. competitive programming for placements?",
    body: "Spent the summer doing CF Div2 problems. Now everyone says LeetCode is what matters for FAANG. What's the actual consensus?",
    tags: ["placements", "coding", "career"],
    upvotes: 312,
    downvotes: 8,
    voted: null,
    time: "3d",
    comments: [
      {
        id: "dc4",
        username: "dev_k",
        avatar: "https://picsum.photos/seed/av5/100/100",
        text: "Both matter but for different companies. FAANG = LeetCode, startups care more about problem solving skills.",
        time: "2d",
        likes: 78,
      },
    ],
  },
  {
    id: "d5",
    userId: "7",
    username: "rohan_v",
    avatar: "https://picsum.photos/seed/av7/100/100",
    title: "Anyone else think the campus Wi-Fi situation is dire?",
    body: "Filed a complaint to the network team 3 months ago. Still getting 2 Mbps in my room. What can we collectively do?",
    tags: ["wifi", "campus", "infrastructure"],
    upvotes: 445,
    downvotes: 2,
    voted: null,
    time: "4d",
    comments: [],
  },
];

export const fundaes: Fundae[] = [
  {
    id: "f1",
    type: "give",
    username: "aryan_s",
    avatar: "https://picsum.photos/seed/user1/100/100",
    title: "How to crack SDE internships at top product companies",
    description:
      "Covered DSA prep timeline, mock interviews, and resume tips from my successful Uber internship hunt.",
    tags: ["placements", "SDE", "internship"],
    time: "1d",
  },
  {
    id: "f2",
    type: "give",
    username: "priya_r",
    avatar: "https://picsum.photos/seed/av2/100/100",
    title: "Research internships abroad – complete guide",
    description:
      "DAAD, Mitacs, SURF – how to apply, SOP tips, and what professors look for.",
    tags: ["research", "abroad", "intern"],
    time: "2d",
  },
  {
    id: "f3",
    type: "give",
    username: "karthik_m",
    avatar: "https://picsum.photos/seed/av3/100/100",
    title: "Surviving CFD without losing your mind",
    description:
      "Quick tips on ANSYS Fluent, mesh independence, and common errors.",
    tags: ["CFD", "mech", "academics"],
    time: "3d",
  },
  {
    id: "f4",
    type: "give",
    username: "dev_k",
    avatar: "https://picsum.photos/seed/av5/100/100",
    title: "Getting started with open source contributions",
    description:
      "From first PR to GSOC – my complete journey and actionable steps for anyone starting out.",
    tags: ["opensource", "gsoc", "github"],
    time: "5d",
  },
  {
    id: "f5",
    type: "request",
    username: "sneha_p",
    avatar: "https://picsum.photos/seed/av4/100/100",
    title: "Need help understanding Bayesian Networks",
    description:
      "Struggling with CS5691 content on Bayesian networks and inference. Can anyone do a 1-hour session?",
    tags: ["CS5691", "ML", "academics"],
    time: "6h",
  },
  {
    id: "f6",
    type: "request",
    username: "anika_s",
    avatar: "https://picsum.photos/seed/av6/100/100",
    title: "Looking for a guitar teacher on campus",
    description:
      "Want to learn basic chords and fingerpicking. Can meet at music room, flexible timings!",
    tags: ["guitar", "music", "hobby"],
    time: "1d",
  },
  {
    id: "f7",
    type: "request",
    username: "rohan_v",
    avatar: "https://picsum.photos/seed/av7/100/100",
    title: "Want to learn skateboarding",
    description:
      "Absolute beginner. Does anyone have a board I can borrow to practice?",
    tags: ["skateboard", "sports", "hobby"],
    time: "2d",
  },
  {
    id: "f8",
    type: "request",
    username: "meera_j",
    avatar: "https://picsum.photos/seed/av8/100/100",
    title: "Help with LaTeX for thesis formatting",
    description:
      "Working on BTP report and the formatting is a mess. Need someone to help set up the template!",
    tags: ["LaTeX", "BTP", "academics"],
    time: "3d",
  },
];

export const chats: ChatConversation[] = [
  {
    id: "ch1",
    userId: "2",
    username: "priya_r",
    avatar: "https://picsum.photos/seed/av2/100/100",
    isOnline: true,
    lastMessage: "Sure, see you at the library!",
    lastTime: "2m",
    unread: 2,
    isRequest: false,
    messages: [
      {
        id: "m1",
        senderId: "2",
        text: "Hey! Are you free to study tonight?",
        time: "7:30 PM",
      },
      {
        id: "m2",
        senderId: "1",
        text: "Yeah, around 8? Library 4th floor?",
        time: "7:32 PM",
      },
      {
        id: "m3",
        senderId: "2",
        text: "Sure, see you at the library!",
        time: "7:35 PM",
      },
    ],
  },
  {
    id: "ch2",
    userId: "3",
    username: "karthik_m",
    avatar: "https://picsum.photos/seed/av3/100/100",
    isOnline: false,
    lastMessage: "Bro the hackathon idea is 🔥",
    lastTime: "1h",
    unread: 0,
    isRequest: false,
    messages: [
      {
        id: "m4",
        senderId: "1",
        text: "Did you check the problem statement?",
        time: "6:00 PM",
      },
      {
        id: "m5",
        senderId: "3",
        text: "Yes! I think we should go with option 2",
        time: "6:05 PM",
      },
      {
        id: "m6",
        senderId: "1",
        text: "Agreed. What about the tech stack?",
        time: "6:10 PM",
      },
      {
        id: "m7",
        senderId: "3",
        text: "Bro the hackathon idea is 🔥",
        time: "6:15 PM",
      },
    ],
  },
  {
    id: "ch3",
    userId: "5",
    username: "dev_k",
    avatar: "https://picsum.photos/seed/av5/100/100",
    isOnline: true,
    lastMessage: "Sent you the PR link",
    lastTime: "3h",
    unread: 1,
    isRequest: false,
    messages: [
      {
        id: "m8",
        senderId: "5",
        text: "Can you review my code?",
        time: "3:00 PM",
      },
      { id: "m9", senderId: "1", text: "Sure, send the link", time: "3:02 PM" },
      {
        id: "m10",
        senderId: "5",
        text: "Sent you the PR link",
        time: "3:05 PM",
      },
    ],
  },
  {
    id: "ch4",
    userId: "8",
    username: "meera_j",
    avatar: "https://picsum.photos/seed/av8/100/100",
    isOnline: false,
    lastMessage: "Let's discuss tomorrow",
    lastTime: "1d",
    unread: 0,
    isRequest: true,
    messages: [
      {
        id: "m11",
        senderId: "8",
        text: "Hi! I saw your fundae post about LaTeX",
        time: "Yesterday",
      },
      {
        id: "m12",
        senderId: "8",
        text: "Would love your help with my BTP formatting!",
        time: "Yesterday",
      },
      {
        id: "m13",
        senderId: "8",
        text: "Let's discuss tomorrow",
        time: "Yesterday",
      },
    ],
  },
  {
    id: "ch5",
    userId: "6",
    username: "anika_s",
    avatar: "https://picsum.photos/seed/av6/100/100",
    isOnline: true,
    lastMessage: "The event was amazing!",
    lastTime: "2d",
    unread: 0,
    isRequest: false,
    messages: [
      {
        id: "m14",
        senderId: "6",
        text: "Did you come to the open mic?",
        time: "Mon",
      },
      { id: "m15", senderId: "1", text: "Yes! It was incredible", time: "Mon" },
      { id: "m16", senderId: "6", text: "The event was amazing!", time: "Mon" },
    ],
  },
];

export const notifications: Notification[] = [
  {
    id: "n1",
    userId: "2",
    username: "priya_r",
    avatar: "https://picsum.photos/seed/av2/100/100",
    action: "liked your post",
    time: "2m",
    thumbnail: "https://picsum.photos/seed/post1/80/80",
    read: false,
  },
  {
    id: "n2",
    userId: "3",
    username: "karthik_m",
    avatar: "https://picsum.photos/seed/av3/100/100",
    action: "started following you",
    time: "15m",
    read: false,
  },
  {
    id: "n3",
    userId: "5",
    username: "dev_k",
    avatar: "https://picsum.photos/seed/av5/100/100",
    action: 'commented on your post: "This is fire! 🔥"',
    time: "1h",
    thumbnail: "https://picsum.photos/seed/post2/80/80",
    read: false,
  },
  {
    id: "n4",
    userId: "6",
    username: "anika_s",
    avatar: "https://picsum.photos/seed/av6/100/100",
    action: "joined your plan: ML Study Circle",
    time: "2h",
    read: false,
  },
  {
    id: "n5",
    userId: "7",
    username: "rohan_v",
    avatar: "https://picsum.photos/seed/av7/100/100",
    action: "upvoted your discussion",
    time: "3h",
    read: true,
  },
  {
    id: "n6",
    userId: "8",
    username: "meera_j",
    avatar: "https://picsum.photos/seed/av8/100/100",
    action: "saved your post",
    time: "5h",
    thumbnail: "https://picsum.photos/seed/post5/80/80",
    read: true,
  },
  {
    id: "n7",
    userId: "4",
    username: "sneha_p",
    avatar: "https://picsum.photos/seed/av4/100/100",
    action: "started following you",
    time: "8h",
    read: true,
  },
  {
    id: "n8",
    userId: "2",
    username: "priya_r",
    avatar: "https://picsum.photos/seed/av2/100/100",
    action: "replied to your comment",
    time: "1d",
    thumbnail: "https://picsum.photos/seed/post1/80/80",
    read: true,
  },
  {
    id: "n9",
    userId: "3",
    username: "karthik_m",
    avatar: "https://picsum.photos/seed/av3/100/100",
    action: "mentioned you in a discussion",
    time: "2d",
    read: true,
  },
  {
    id: "n10",
    userId: "5",
    username: "dev_k",
    avatar: "https://picsum.photos/seed/av5/100/100",
    action: "liked your comment",
    time: "2d",
    read: true,
  },
  {
    id: "n11",
    userId: "6",
    username: "anika_s",
    avatar: "https://picsum.photos/seed/av6/100/100",
    action: "sent you a fundae request",
    time: "3d",
    read: true,
  },
  {
    id: "n12",
    userId: "7",
    username: "rohan_v",
    avatar: "https://picsum.photos/seed/av7/100/100",
    action: "liked your post",
    time: "4d",
    thumbnail: "https://picsum.photos/seed/post6/80/80",
    read: true,
  },
];

export const userPostImages = [
  "https://picsum.photos/seed/grid1/300/300",
  "https://picsum.photos/seed/grid2/300/300",
  "https://picsum.photos/seed/grid3/300/300",
  "https://picsum.photos/seed/grid4/300/300",
  "https://picsum.photos/seed/grid5/300/300",
  "https://picsum.photos/seed/grid6/300/300",
  "https://picsum.photos/seed/grid7/300/300",
  "https://picsum.photos/seed/grid8/300/300",
  "https://picsum.photos/seed/grid9/300/300",
];

export interface GroupChat {
  id: string;
  name: string;
  isGroup: boolean;
  avatar: string;
  lastMessage: string;
  unread: number;
  messages: ChatMessage[];
}

export const groupChats: GroupChat[] = plans.map((plan) => ({
  id: `plan-${plan.id}`,
  name: plan.title,
  isGroup: true,
  avatar: "🎯",
  lastMessage: "Join the conversation!",
  unread: 0,
  messages: [],
}));

// ─── Highlights ─────────────────────────────────────────────────────────────

export interface Highlight {
  id: string;
  title: string;
  emoji: string;
  coverImage?: string;
  stories: Story[];
}

export const currentUserHighlights: Highlight[] = [
  {
    id: "h1",
    title: "Campus",
    emoji: "🏛️",
    coverImage: "https://picsum.photos/seed/hl1/200/200",
    stories: [
      {
        id: "hs1",
        userId: "1",
        username: "aryan_s",
        avatar: "https://picsum.photos/seed/user1/100/100",
        image: "https://picsum.photos/seed/hl1a/400/700",
        time: "1w",
        viewed: true,
      },
      {
        id: "hs2",
        userId: "1",
        username: "aryan_s",
        avatar: "https://picsum.photos/seed/user1/100/100",
        image: "https://picsum.photos/seed/hl1b/400/700",
        time: "1w",
        viewed: true,
      },
    ],
  },
  {
    id: "h2",
    title: "Hackathon",
    emoji: "💻",
    coverImage: "https://picsum.photos/seed/hl2/200/200",
    stories: [
      {
        id: "hs3",
        userId: "1",
        username: "aryan_s",
        avatar: "https://picsum.photos/seed/user1/100/100",
        image: "https://picsum.photos/seed/hl2a/400/700",
        time: "2w",
        viewed: true,
      },
    ],
  },
  {
    id: "h3",
    title: "Friends",
    emoji: "🤝",
    coverImage: "https://picsum.photos/seed/hl3/200/200",
    stories: [
      {
        id: "hs4",
        userId: "1",
        username: "aryan_s",
        avatar: "https://picsum.photos/seed/user1/100/100",
        image: "https://picsum.photos/seed/hl3a/400/700",
        time: "3w",
        viewed: true,
      },
    ],
  },
  {
    id: "h4",
    title: "Fest",
    emoji: "🎉",
    coverImage: "https://picsum.photos/seed/hl4/200/200",
    stories: [
      {
        id: "hs5",
        userId: "1",
        username: "aryan_s",
        avatar: "https://picsum.photos/seed/user1/100/100",
        image: "https://picsum.photos/seed/hl4a/400/700",
        time: "1m",
        viewed: true,
      },
    ],
  },
];

// ─── Mock Users (for search / other profiles) ───────────────────────────────

export const mockUsers: User[] = [
  {
    id: "2",
    name: "Priya Ramanujan",
    username: "priya_r",
    email: "priya@smail.iitm.ac.in",
    avatar: "https://picsum.photos/seed/av2/100/100",
    bio: "EE '25 | Photography enthusiast 📸",
    followers: 512,
    following: 230,
    posts: 38,
    isOnline: true,
    badges: ["EE '25", "Photo Club"],
  },
  {
    id: "3",
    name: "Karthik Menon",
    username: "karthik_m",
    email: "karthik@smail.iitm.ac.in",
    avatar: "https://picsum.photos/seed/av3/100/100",
    bio: "Mech '26 | Robotics | Coffee addict ☕",
    followers: 289,
    following: 145,
    posts: 21,
    isOnline: false,
    badges: ["Mech '26", "Robotics Club"],
  },
  {
    id: "4",
    name: "Sneha Krishnan",
    username: "sneha_k",
    email: "sneha@smail.iitm.ac.in",
    avatar: "https://picsum.photos/seed/av5/100/100",
    bio: "Math '25 | Quiz master 🧠",
    followers: 421,
    following: 198,
    posts: 56,
    isOnline: true,
    badges: ["Math '25", "Quiz Club"],
  },
  {
    id: "5",
    name: "Rohan Verma",
    username: "rohan_v",
    email: "rohan@smail.iitm.ac.in",
    avatar: "https://picsum.photos/seed/av7/100/100",
    bio: "CS '27 | Open source contributor 🔧",
    followers: 178,
    following: 95,
    posts: 14,
    isOnline: false,
    badges: ["CS '27", "Code Club"],
  },
  {
    id: "6",
    name: "Ananya Iyer",
    username: "ananya_i",
    email: "ananya@smail.iitm.ac.in",
    avatar: "https://picsum.photos/seed/av6/100/100",
    bio: "Chem '26 | Artist 🎨 | Guitar 🎸",
    followers: 634,
    following: 302,
    posts: 72,
    isOnline: true,
    badges: ["Chem '26", "Arts Club"],
  },
];
