interface DetailedWaveformProps {
  waveform: number[];
  playbackPosition: number;
  onPress: (position: number) => void;
  onLongPress: (position: number) => void;
  selectedTimestamp: number;
  duration: number;
  showTimestamps: boolean;
  showSelectedMarker: boolean;
}

declare const DetailedWaveform: React.FC<DetailedWaveformProps>;
export default DetailedWaveform; 