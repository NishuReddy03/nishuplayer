import React from "react";

export const useAudio = () => {
  const audioRef = React.useRef(null);
  const audioContextRef = React.useRef(null);
  const gainNodeRef = React.useRef(null);
  const sourceNodeRef = React.useRef(null);
  const bassNodeRef = React.useRef(null);
  const trebleNodeRef = React.useRef(null);

  const [isAudioContextReady, setIsAudioContextReady] = React.useState(false);
  const [isMobileAudioBlocked, setIsMobileAudioBlocked] = React.useState(false);
  const [userInteracted, setUserInteracted] = React.useState(false);
  const [isUsingWebAudio, setIsUsingWebAudio] = React.useState(false);

  // Detect mobile devices - improved detection
  const isMobile = React.useMemo(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
                          (window.innerWidth <= 768 && window.innerHeight <= 1024);

    // Also check for touch capability
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return isMobileDevice || hasTouch;
  }, []);

  // Initialize Web Audio API for mobile with better error handling
  const initializeWebAudio = React.useCallback(async () => {
    if (!isMobile || audioContextRef.current) return;

    try {
      // Create AudioContext with better compatibility
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        console.warn("Web Audio API not supported, falling back to HTML5 Audio");
        setIsUsingWebAudio(false);
        return;
      }

      audioContextRef.current = new AudioContextClass();
      gainNodeRef.current = audioContextRef.current.createGain();
      
      // Initialize Filters
      bassNodeRef.current = audioContextRef.current.createBiquadFilter();
      bassNodeRef.current.type = "lowshelf";
      bassNodeRef.current.frequency.value = 150;

      trebleNodeRef.current = audioContextRef.current.createBiquadFilter();
      trebleNodeRef.current.type = "highshelf";
      trebleNodeRef.current.frequency.value = 4000;

      // Connect Graph: Bass -> Treble -> Gain -> Destination
      bassNodeRef.current.connect(trebleNodeRef.current);
      trebleNodeRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);

      console.log("Web Audio API initialized for mobile device");
      setIsUsingWebAudio(true);
    } catch (error) {
      console.error("Failed to initialize Web Audio API:", error);
      setIsUsingWebAudio(false);
    }
  }, [isMobile]);

  // Resume AudioContext on user interaction
  const resumeAudioContext = React.useCallback(async () => {
    if (!audioContextRef.current) return;

    try {
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
        console.log("AudioContext resumed");
      }
      setIsAudioContextReady(true);
      setUserInteracted(true);
    } catch (error) {
      console.error("Failed to resume AudioContext:", error);
    }
  }, []);

  // Handle user interaction for mobile with multiple event types
  React.useEffect(() => {
    if (!isMobile) return;

    const handleUserInteraction = async (event) => {
      console.log("User interaction detected:", event.type);
      setUserInteracted(true);

      // Initialize Web Audio if not already done
      if (!isUsingWebAudio) {
        await initializeWebAudio();
      }

      // Resume AudioContext
      await resumeAudioContext();

      // Remove listeners after first interaction
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('touchend', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    // Add multiple event listeners for better mobile support
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('touchend', handleUserInteraction, { once: true });
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchend', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [isMobile, isUsingWebAudio, initializeWebAudio, resumeAudioContext]);

  // Initialize audio element
  React.useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "auto";
      audio.volume = 1;
      // Important for cross-domain streaming from open APIs
      audio.crossOrigin = "anonymous";

      audio.addEventListener("canplay", () => {
        if (isUsingWebAudio && audioContextRef.current && audioContextRef.current.state === 'running') {
          try {
            // ONLY create the source once
            if (!sourceNodeRef.current) {
              sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audio);
              sourceNodeRef.current.connect(bassNodeRef.current);
            }
          } catch (e) {
            console.warn("Web Audio connection failed, falling back to direct playback", e);
          }
        }
      });

      audio.addEventListener("error", (error) => {
        console.error("Audio Error:", audio.error?.message);
        // Fallback: If anonymous fails (CORS), try without it
        if (audio.crossOrigin === "anonymous") {
          console.log("Retrying without CORS...");
          audio.removeAttribute("crossOrigin");
          audio.load();
          audio.play().catch(() => {});
        }
        if (isMobile) {
          setIsMobileAudioBlocked(true);
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
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [isUsingWebAudio]);

  // Set audio source
  const setAudioSource = React.useCallback((url) => {
    if (!audioRef.current || !url) return;

    // Ensure URL is HTTPS to avoid mixed-content blocks on mobile
    const secureUrl = url.replace("http://", "https://");
    audioRef.current.src = secureUrl;
    audioRef.current.load();
  }, []);

  // Play audio with user interaction handling
  const play = React.useCallback(async () => {
    if (!audioRef.current) {
      console.error("No audio element available");
      return false;
    }

    // On mobile, ensure user has interacted and AudioContext is ready
    if (isMobile) {
      if (!userInteracted) {
        console.warn("Mobile: Waiting for user interaction before playing audio");
        setIsMobileAudioBlocked(true);
        return false;
      }

      if (isUsingWebAudio && audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await resumeAudioContext();
      }
    }

    // Wait for audio to be ready if it's not loaded yet
    if (audioRef.current.readyState < 2) { // HAVE_CURRENT_DATA or higher
      await new Promise((resolve, reject) => {
        const onCanPlay = () => {
          audioRef.current.removeEventListener("canplay", onCanPlay);
          resolve();
        };
        audioRef.current.addEventListener("canplay", onCanPlay);
        
        // Faster timeout for mobile (5s) to prevent UI hang
        setTimeout(resolve, 5000);
      });
    }

    try {
      // Check if we need user interaction
      if (audioRef.current.paused || audioRef.current.ended) {
        await audioRef.current.play();
        console.log("Audio started playing");

        // On mobile, verify audio is actually working
        if (isMobile) {
          setTimeout(() => {
            if (audioRef.current && !audioRef.current.paused) {
              // Check if audio context is running for Web Audio
              if (isUsingWebAudio) {
                if (audioContextRef.current && audioContextRef.current.state === 'running') {
                  setIsMobileAudioBlocked(false);
                  console.log("Web Audio playback confirmed");
                } else {
                  setIsMobileAudioBlocked(true);
                  console.warn("Web Audio context not running");
                }
              } else {
                // For HTML5 Audio fallback, check basic playback
                setIsMobileAudioBlocked(false);
                console.log("HTML5 Audio playback confirmed");
              }
            }
          }, 1000); // Increased delay for better detection
        }

        return true;
      }
      return true;
    } catch (error) {
      console.error("Play failed:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);

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
  }, [isMobile, userInteracted, isUsingWebAudio, resumeAudioContext]);

  // Pause audio
  const pause = React.useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      console.log("Audio paused");
    }
  }, []);

  // Set volume with better Web Audio support
  const setVolume = React.useCallback((volume) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));

    if (isUsingWebAudio && gainNodeRef.current) {
      // Use Web Audio gain node for mobile
      try {
        gainNodeRef.current.gain.value = clampedVolume;
        console.log("Web Audio volume set to:", clampedVolume);
      } catch (error) {
        console.error("Failed to set Web Audio volume:", error);
        // Fall back to HTML5 Audio
        if (audioRef.current) {
          audioRef.current.volume = clampedVolume;
        }
      }
    } else if (audioRef.current) {
      // Use HTML5 Audio volume for desktop or fallback
      audioRef.current.volume = clampedVolume;
      console.log("HTML5 Audio volume set to:", clampedVolume);
    }
  }, [isUsingWebAudio]);

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
    isUsingWebAudio,
    isAudioContextReady,
  };
};
