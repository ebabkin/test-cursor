export interface Channel {
  id: string;
  code: string;
  regionId: string;
  title: string;
  description?: string;
  isPrivate: boolean;
  state: 'ACTIVE' | 'DELETED';
  ownerId: string;
  createdAt: Date;
  lastMessagePreview?: string;
}

export interface CreateChannelDto {
  title: string;
  description?: string;
  isPrivate?: boolean;
  regionId?: string;
}

export interface ChannelMember {
  channelId: string;
  userId: string;
  role: 'USER';
  joinedAt: Date;
}

export interface Message {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  kind: 'TEXT';
  isDeleted: boolean;
  createdAt: Date;
}

export interface CreateMessageDto {
  content: string;
  kind?: 'TEXT';
} 