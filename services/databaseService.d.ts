interface Reaction {
  id: string;
  emoji: string;
  timestamp: number;
  username: string;
}

interface Reply {
  id: string;
  text: string;
  timestamp: number;
  username: string;
  createdAt: string;
}

export function addReactionToMessage(messageId: string, reaction: Reaction): Promise<void>;
export function addReplyToMessage(messageId: string, reply: Reply): Promise<void>; 