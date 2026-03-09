import React from "react";

export const useAudio = () => {
  const audioRef = React.useRef(null);
  const [isAudioContextReady, setIsAudioContextReady] = React.useState(false);

  // Initialize audio element
  React.useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.preload = "metadata";
      audio.volume = 1;

      // Handle successful loading
      audio.addEventListener("loadedmetadata", () => {
        console.log("Audio metadata loaded");
      });

      // Handle can play
      audio.addEventListener("canplay", () => {
        console.log("Audio can play");
      });

      // Handle errors
      audio.addEventListener("error", (error) => {
        console.error("Audio Playback Error:", error);
        console.error("Error code:", audio.error?.code);
        console.error("Error message:", audio.error?.message);
      });

      // Handle load start
      audio.addEventListener("loadstart", () => {
        console.log("Audio load started");
      });

      // Handle stalled
      audio.addEventListener("stalled", () => {
        console.warn("Audio stalled, retrying...");
        // Try to reload the audio
        if (audio.src) {
          audio.load();
        }
      });

      audioRef.current = audio;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  // Set audio source
  const setAudioSource = React.useCallback((url) => {
    if (!audioRef.current || !url) return;

    console.log("Setting audio source:", url);
    audioRef.current.src = url;
    audioRef.current.load();
  }, []);

  // Play audio with user interaction handling
  const play = React.useCallback(async () => {
    if (!audioRef.current) {
      console.error("No audio element available");
      return;
    }

    try {
      // Check if we need user interaction
      if (audioRef.current.paused) {
        await audioRef.current.play();
        console.log("Audio started playing");
      }
    } catch (error) {
      console.error("Play failed:", error);
      // If autoplay is blocked, we need user interaction
      if (error.name === "NotAllowedError") {
        console.warn("Autoplay blocked - requires user interaction");
        // You might want to show a play button or message to user
      }
    }
  }, []);

  // Pause audio
  const pause = React.useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      console.log("Audio paused");
    }
  }, []);

  // Set volume
  const setVolume = React.useCallback((volume) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  // Seek to position
  const seek = React.useCallback((position) => {
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      const time = position * audioRef.current.duration;
      audioRef.current.currentTime = Math.max(0, Math.min(time, audioRef.current.duration));
    }
  }, []);

  // Get current time
  const getCurrentTime = React.useCallback(() => {
    return audioRef.current?.currentTime || 0;
  }, []);

  // Get duration
  const getDuration = React.useCallback(() => {
    return audioRef.current?.duration || 0;
  }, []);

  return {
    audioRef,
    setAudioSource,
    play,
    pause,
    setVolume,
    seek,
    getCurrentTime,
    getDuration,
  };
};
