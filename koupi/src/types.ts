export type Status = 'completed' | 'active' | 'locked';

export interface Resource {
  id: number;
  lessonId: number;
  title: string;
  url: string;
  type: 'pdf' | 'link' | 'video';
}

export interface Comment {
  id: string | number;
  lessonId: number;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

export interface Lesson {
  id: number;
  moduleId: number;
  title: string;
  duration: string;
  status: Status;
  thumbnail: string;
  videoUrl?: string; // Added videoUrl
  description: string;
  isFavorite?: boolean;
  resources?: Resource[];
}

export interface Notification {
  id: string | number; // Support string IDs for easier uniqueness
  title: string;
  message: string;
  type: 'streak' | 'lesson' | 'system';
  timestamp: string;
  read: boolean;
}

export interface UserStats {
  streak: number;
  lastVisit: string;
  totalPoints: number;
  completedLessons: number[];
  isVIP?: boolean;
}

export interface Module {
  id: number;
  title: string;
  description: string;
  thumbnail?: string; // Added thumbnail
  lessons: number[];
}

export type View = 'landing' | 'course' | 'lesson' | 'profile' | 'admin' | 'resources' | 'vip' | 'ai';
export type Tab = 'Deskripsyon' | 'Resous' | 'Nòt' | 'Kòmantè';
