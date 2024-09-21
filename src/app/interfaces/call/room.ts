import { Profile } from '../user/profile';

export interface Room {
  room_id: string;
  room_name: string;
  room_description: string;
  room_creator: Profile;
  room_created: Date;
  room_updated: Date;
  room_members: RoomMember[];
  seats: number;
  is_private: boolean;
  password: string;
  is_active: boolean;
}

export interface RoomMember {
  is_admin: boolean;
  profile: Profile;
}

export interface RoomMessage {
  message_id: string;
  room_id: string;
  message: string;
  message_sender: Profile;
  message_created: Date;
  message_updated: Date;
  is_edited: boolean;
  is_deleted: boolean;
  reply_to?: Partial<RoomMessage>;
  quoted_message?: Partial<RoomMessage>;
}

export interface RoomMessageReaction {
  reaction_id: string;
  message_id: string;
  reaction: string;
  reaction_sender: Profile;
  reaction_created: Date;
}

export interface MediaStream {
  stream_id: string;
  stream: MediaStream;
  stream_created: Date;
  stream_updated: Date;
}
