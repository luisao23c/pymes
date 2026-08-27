export interface Event {
  _id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  category: 'bodas' | 'retratos' | 'paisajes' | 'eventos' | 'editorial' | 'otro';
  coverImage: string;
  coverThumbnail: string;
  photosCount: number;
  featured: boolean;
  createdAt: string;
}

export interface Photo {
  _id: string;
  eventId: string;
  originalName: string;
  filename: string;
  originalPath: string;
  compressedPath: string;
  thumbnailPath: string;
  width: number;
  height: number;
  size: number;
  order: number;
  caption: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  eventSlug: string;
  status: 'unread' | 'read' | 'responded';
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface DashboardStats {
  totalEvents: number;
  totalPhotos: number;
  unreadMessages: number;
}
