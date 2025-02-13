export interface Region {
    id: string;
    name: string;
    creation_date: Date;
}

export interface Channel {
    id: string;
    code: string;
    region_id: string;
    title: string;
    description?: string;
    is_private: boolean;
    state: 'ACTIVE' | 'DELETED';
    owner_id: string;
    last_message_preview?: string;
    last_message_date?: Date;
    creation_date: Date;
}

export interface ChannelMember {
    channel_id: string;
    user_id: string;
    role: 'USER';
    join_date: Date;
}

export interface CreateChannelDto {
    title: string;
    description?: string;
    is_private: boolean;
    region_id?: string; // Defaults to 'DEFAULT'
}

export interface MessageV2 {
    id: string;
    channel_id: string;
    user_id: string;
    content: string;
    content_preview: string;
    kind: 'TEXT';
    is_deleted: boolean;
    creation_date: Date;
} 


export interface CreateMessageV2Dto {
    channel_id: string;
    content: string;
}