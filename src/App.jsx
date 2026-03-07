import React from "react";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import SearchArea from "./components/SearchArea.jsx";
import PlayerBar from "./components/PlayerBar.jsx";
import { useMusicStoreWithActions } from "./store";
import { useAudio } from "./hooks/useAudio.js";
import { useAudioProgress } from "./hooks/useAudioProgress.js";

const App = () => {
  // Theme state
  const [theme, setTheme] = React.useState(() => {
    const savedTheme = localStorage.getItem("nishu_theme");
    return savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
  });

  // Search state
  const [searchQuery, setSearchQuery] = React.useState("");

  // Player state
  const {
    currentSong,
    isPlaying,
    volume,
    progress,
    playNext,
    setProgress,
    setVolume,
  } = useMusicStoreWithActions();

  // Audio functionality
  const {
    audioRef,
    setAudioSource,
    play,
    pause,
    setVolume: setAudioVolume,
    seek,
  } = useAudio();

  // Apply theme
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("nishu_theme", theme);
  }, [theme]);

  // Set audio source when current song changes
  React.useEffect(() => {
    if (currentSong?.url) {
      setAudioSource(currentSong.url);
      if (isPlaying) {
        // Play after a short delay to ensure audio is loaded
        setTimeout(() => play(), 100);
      }
    }
  }, [currentSong, setAudioSource, play]);

  // Handle play/pause
  React.useEffect(() => {
    if (isPlaying && currentSong) {
      play();
    } else {
      pause();
    }
  }, [isPlaying, currentSong, play, pause]);

  // Handle volume changes
  React.useEffect(() => {
    setAudioVolume(volume);
  }, [volume, setAudioVolume]);

  // Handle progress updates from audio element
  const handleAudioProgress = React.useCallback(() => {
    if (audioRef.current && audioRef.current.duration) {
      const newProgress = audioRef.current.currentTime / audioRef.current.duration;
      setProgress(Math.min(1, newProgress));
    }
  }, [setProgress, audioRef]);

  // Listen to audio progress
  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener("timeupdate", handleAudioProgress);
    audio.addEventListener("ended", playNext);
    audio.addEventListener("error", () => {
      console.error("Audio playback error");
      playNext(); // Skip to next song on error
    });

    return () => {
      audio.removeEventListener("timeupdate", handleAudioProgress);
      audio.removeEventListener("ended", playNext);
      audio.removeEventListener("error", playNext);
    };
  }, [audioRef, handleAudioProgress, playNext]);

  // Handle seeking
  React.useEffect(() => {
    if (audioRef.current && currentSong) {
      seek(progress);
    }
  }, [progress, seek, currentSong, audioRef]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <div className="app-container">
      <div className="sidebar-area">
        <Sidebar />
      </div>

      <div className="topbar-area">
        <Topbar
          theme={theme}
          toggleTheme={toggleTheme}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>

      <div className="main-area">
        <SearchArea searchQuery={searchQuery} />
      </div>

      <div className="player-area">
        <PlayerBar />
      </div>
    </div>
  );
};

export default App;
