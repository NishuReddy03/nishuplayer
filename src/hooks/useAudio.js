import React from "react";

export const useAudio = () => {
  const audioRef = React.useRef(null);
  const audioContextRef = React.useRef(null);
  const analyzerRef = React.useRef(null);
  const sourceRef = React.useRef(null);
  const gainNodeRef = React.useRef(null);
  const bassFilterRef = React.useRef(null);
  const trebleFilterRef = React.useRef(null);
  const [bassGain, setBassGain] = React.useState(0);
  const [trebleGain, setTrebleGain] = React.useState(0);

  // Initialize audio
  React.useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audioRef.current = audio;

      // Update progress
      audio.addEventListener("timeupdate", () => {
        // Will be handled by parent component
      });

      // Handle song end
      audio.addEventListener("ended", () => {
        // Will be handled by parent component
      });

      // Handle errors
      audio.addEventListener("error", (error) => {
        console.error("Audio Playback Error:", error);
      });

      // Handle stalled state
      audio.addEventListener("stalled", () => {
        console.warn("Audio stream stalled, attempting to recover...");
      });

      audio.addEventListener("suspend", () => {
        console.warn("Audio context suspended, attempting to resume...");
      });
    }

    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Setup Web Audio API
  const setupAudioContext = React.useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      if (audioContext.state === "suspended") {
        audioContext
          .resume()
          .catch((e) => console.warn("Could not resume audio context:", e));
      }

      const source = audioContext.createMediaElementSource(audioRef.current);
      sourceRef.current = source;

      // Create gain node for volume
      const gainNode = audioContext.createGain();
      gainNodeRef.current = gainNode;

      // Create bass filter (low shelf)
      const bassFilter = audioContext.createBiquadFilter();
      bassFilter.type = "lowshelf";
      bassFilter.frequency.value = 150;
      bassFilterRef.current = bassFilter;

      // Create treble filter (high shelf)
      const trebleFilter = audioContext.createBiquadFilter();
      trebleFilter.type = "highshelf";
      trebleFilter.frequency.value = 4000;
      trebleFilterRef.current = trebleFilter;

      // Connect the audio graph
      source.connect(bassFilter);
      bassFilter.connect(trebleFilter);
      trebleFilter.connect(gainNode);
      gainNode.connect(audioContext.destination);
    } catch (error) {
      console.warn("Web Audio API not available:", error);
    }
  }, []);

  // Set song to play
  const setAudioSource = React.useCallback((url) => {
    if (!audioRef.current) return;

    setupAudioContext();

    audioRef.current.src = url;
    audioRef.current.load();
  }, [setupAudioContext]);

  // Play audio
  const play = React.useCallback(() => {
    if (!audioRef.current) return;

    setupAudioContext();

    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume().catch((e) => {
        console.warn("Could not resume audio context:", e);
      });
    }

    audioRef.current
      .play()
      .catch((error) => {
        console.warn("Play prevented:", error);
      });
  }, [setupAudioContext]);

  // Pause audio
  const pause = React.useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  // Set volume
  const setVolume = React.useCallback((volume) => {
    if (!audioRef.current) return;

    if (gainNodeRef.current) {
      // Web Audio API volume (0-1 range, but squared for better control)
      gainNodeRef.current.gain.value = volume * volume;
    } else {
      // Fallback to native audio volume
      audioRef.current.volume = volume;
    }
  }, []);

  // Seek to time
  const seek = React.useCallback((time) => {
    if (!audioRef.current || isNaN(audioRef.current.duration)) return;

    // Clamp between 0 and duration
    audioRef.current.currentTime = Math.max(
      0,
      Math.min(time * audioRef.current.duration, audioRef.current.duration)
    );
  }, []);

  // Get current time
  const getCurrentTime = React.useCallback(() => {
    if (!audioRef.current) return 0;
    return audioRef.current.currentTime;
  }, []);

  // Get duration
  const getDuration = React.useCallback(() => {
    if (!audioRef.current) return 0;
    return audioRef.current.duration || 0;
  }, []);

  // Set bass gain
  const updateBassGain = React.useCallback((value) => {
    setBassGain(value);
    if (bassFilterRef.current) {
      bassFilterRef.current.gain.value = value;
    }
  }, []);

  // Set treble gain
  const updateTrebleGain = React.useCallback((value) => {
    setTrebleGain(value);
    if (trebleFilterRef.current) {
      trebleFilterRef.current.gain.value = value;
    }
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
    updateBassGain,
    bassGain,
    updateTrebleGain,
    trebleGain,
  };
};
