interface Reaction {
  id: string;
  emoji: string;
  timestamp: number;
  username: string;
}

interface TimestampReactionProps {
  reaction: Reaction;
  duration: number;
  onPress: () => void;
}

declare const TimestampReaction: React.FC<TimestampReactionProps>;
export default TimestampReaction; 