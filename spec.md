# InstiConnect

## Current State
Fully connected Instagram-style app with Firebase Auth + Firestore + Cloudinary. All mock data removed. Core features: feed, stories, plans, discussions, fundaes, chat, profile, notifications, settings.

## Requested Changes (Diff)

### Add
- Delete button for posts (owner only) → removes from Firestore `posts` collection
- Delete button for stories (owner only) → removes from Firestore `stories` collection
- Delete button for highlights (owner only) → removes from Firestore `users/{uid}/highlights`
- Delete button for chat messages (sender only) → removes from Firestore `chats/{chatId}/messages`
- Delete confirmation prompt before any destructive action
- Sign out button fix in Profile/Settings — calls `firebaseSignOut(auth)` and redirects to Login

### Modify
- PostDetailModal: add trash icon (visible only when currentUser.uid === post.userId)
- StoryViewer: add trash icon on own stories
- Profile highlights section: add delete option per highlight
- ChatScreen: long-press message to show delete option (own messages only)
- Settings sign-out button: wire to real `signOut()` from AuthContext

### Remove
- Nothing

## Implementation Plan
1. PostDetailModal — add delete icon button visible only to owner; call `deleteDoc(doc(db, 'posts', postId))` then close modal
2. StoryViewer — add delete icon for own stories; call `deleteDoc(doc(db, 'stories', storyId))` then advance/close
3. Profile highlights — add × button per highlight item; call `deleteDoc` on the highlight doc
4. ChatScreen — long-press message shows a bottom sheet with Delete option; calls `deleteDoc` on the message doc
5. Settings/Profile sign-out — ensure the sign-out button calls `signOut()` from AuthContext and navigates to Login page
6. All delete actions show a brief confirmation dialog before executing
