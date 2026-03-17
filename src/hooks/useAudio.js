import React from "react";

export const useAudio = () => {
  const audioRef = React.useRef(null);
  const [isAudioContextReady, setIsAudioContextReady] = React.useState(false);
  const [isMobileAudioBlocked, setIsMobileAudioBlocked] = React.useState(false);
  const [userInteracted, setUserInteracted] = React.useState(false);

  // Detect mobile devices
  const isMobile = React.useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768 && window.innerHeight <= 1024);
  }, []);

  // Handle user interaction for mobile
  React.useEffect(() => {
    if (!isMobile) return;

    const handleUserInteraction = () => {
      setUserInteracted(true);
      // Try to resume any audio context
      if (audioRef.current && audioRef.current.paused === false) {
        // Audio is already playing, good
      }
      // Remove listeners after first interaction
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };

    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('click', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };
  }, [isMobile]);

  // Initialize audio element
  React.useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      // Remove crossOrigin to avoid potential issues
      // audio.crossOrigin = "anonymous";
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
        console.warn("Audio stalled");
        // Note: Removed automatic reload as it can interrupt playback
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
      return false;
    }

    // On mobile, ensure user has interacted
    if (isMobile && !userInteracted) {
      console.warn("Mobile: Waiting for user interaction before playing audio");
      setIsMobileAudioBlocked(true);
      return false;
    }

    // Wait for audio to be ready if it's not loaded yet
    if (audioRef.current.readyState < 2) { // HAVE_CURRENT_DATA or higher
      console.log("Audio not ready, waiting for canplay event");
      await new Promise((resolve) => {
        const onCanPlay = () => {
          audioRef.current.removeEventListener("canplay", onCanPlay);
          resolve();
        };
        audioRef.current.addEventListener("canplay", onCanPlay);

        // Timeout after 10 seconds
        setTimeout(() => {
          audioRef.current.removeEventListener("canplay", onCanPlay);
          resolve();
        }, 10000);
      });
    }

    try {
      // Check if we need user interaction
      if (audioRef.current.paused || audioRef.current.ended) {
        await audioRef.current.play();
        console.log("Audio started playing");

        // On mobile, check if audio is actually audible after a short delay
        if (isMobile) {
          setTimeout(() => {
            if (audioRef.current && !audioRef.current.paused && audioRef.current.volume === 0) {
              console.warn("Mobile: Audio appears muted, user may need to adjust volume");
              setIsMobileAudioBlocked(true);
            } else {
              setIsMobileAudioBlocked(false);
            }
          }, 500);
        }

        return true;
      }
      return true;
    } catch (error) {
      console.error("Play failed:", error);

      // If autoplay is blocked, we need user interaction
      if (error.name === "NotAllowedError") {
        console.warn("Autoplay blocked - requires user interaction");
        if (isMobile) {
          setIsMobileAudioBlocked(true);
        }
        return false;
      } else if (error.name === "AbortError") {
        console.warn("Play aborted, will retry after load completes");
        // Wait for canplay and retry
        const retryPlay = () => {
          if (audioRef.current && (audioRef.current.paused || audioRef.current.ended)) {
            audioRef.current.play().catch(e => {
              console.error("Retry play failed:", e);
              if (isMobile) setIsMobileAudioBlocked(true);
            });
          }
        };
        audioRef.current.addEventListener("canplay", retryPlay, { once: true });
        // Timeout after 5 seconds
        setTimeout(() => {
          audioRef.current?.removeEventListener("canplay", retryPlay);
        }, 5000);
        return false;
      }
      return false;
    }
  }, [isMobile, userInteracted]);

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
    isMobile,
    isMobileAudioBlocked,
    userInteracted,
  };
};
