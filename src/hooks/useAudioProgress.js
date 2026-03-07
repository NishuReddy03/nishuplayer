import React from "react";

export const useAudioProgress = (audioRef, isPlaying, onProgressUpdate) => {
  React.useEffect(() => {
    if (!audioRef.current) return;

    const updateProgress = () => {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;

      if (duration && !isNaN(duration)) {
        const progress = currentTime / duration;
        onProgressUpdate?.(progress);
      }
    };

    if (isPlaying) {
      const interval = setInterval(updateProgress, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying, onProgressUpdate, audioRef]);
};
