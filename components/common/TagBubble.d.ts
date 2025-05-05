import { ViewStyle, TextStyle } from 'react-native';

interface TagBubbleProps {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  selected?: boolean;
}

declare const TagBubble: React.FC<TagBubbleProps>;
export default TagBubble; 