export interface IMessage {
  _id: string;
  chat: string;
  sender: string | {
    _id: string;
    name: string;
    image?: string;
    avatar?: string;
  };
  content: string;
  createdAt: Date | string;
  isTemp?: boolean;
  read?: boolean;
}