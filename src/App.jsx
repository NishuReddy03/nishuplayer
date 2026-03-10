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

  // Navigation state
  const [activeNav, setActiveNav] = React.useState("home");

  // Search state
  const [searchQuery, setSearchQuery] = React.useState("");

  // Handle search query changes
  const handleSearchChange = (newQuery) => {
    setSearchQuery(newQuery);
    if (newQuery.trim() && activeNav !== "search") {
      setActiveNav("search");
    }
  };

  // Player state
  const {
    currentSong,
    isPlaying,
    volume,
    progress,
    favoriteSongs,
    history,
    trendingSongs,
    newReleases,
    activeLanguage,
    playNext,
    setProgress,
    setVolume,
    playSong,
    fetchTrending,
    fetchNewReleases,
    setLanguage,
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

  // Fetch collection when activeNav changes
  React.useEffect(() => {
    if (activeNav === "trending") {
      fetchTrending(activeLanguage);
    } else if (activeNav === "new-releases") {
      fetchNewReleases(activeLanguage);
    }
  }, [activeNav, activeLanguage, fetchTrending, fetchNewReleases]);

  // Set audio source when current song changes
  React.useEffect(() => {
    if (currentSong?.url) {
      console.log("Setting audio source for:", currentSong.title);
      setAudioSource(currentSong.url);
    } else if (currentSong && !currentSong.url) {
      console.warn("Current song has no URL, skipping...");
      playNext();
    }
  }, [currentSong, setAudioSource, playNext]);

  // Handle play/pause state changes
  React.useEffect(() => {
    if (isPlaying && currentSong?.url) {
      console.log("Attempting to play:", currentSong.title);
      play();
    } else if (!isPlaying) {
      pause();
    }
  }, [isPlaying, currentSong, play, pause]);

  // Handle volume changes
  React.useEffect(() => {
    setAudioVolume(volume);
  }, [volume, setAudioVolume]);

  // Handle progress updates from audio element
  const handleAudioProgress = React.useCallback(() => {
    if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration)) {
      const newProgress = audioRef.current.currentTime / audioRef.current.duration;
      setProgress(Math.min(1, Math.max(0, newProgress)));
    }
  }, [setProgress, audioRef]);

  // Listen to audio progress and events
  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener("timeupdate", handleAudioProgress);
    audio.addEventListener("ended", playNext);
    audio.addEventListener("error", (e) => {
      console.error("Audio element error:", e);
      playNext(); // Skip to next song on error
    });

    return () => {
      audio.removeEventListener("timeupdate", handleAudioProgress);
      audio.removeEventListener("ended", playNext);
      audio.removeEventListener("error", playNext);
    };
  }, [audioRef, handleAudioProgress, playNext]);

  // Handle seeking - only when initiated by user manually in the UI
  // The store's setProgress action should potentially distinguish between 
  // 'auto' updates from the audio element vs 'manual' seeking.
  // For now, we'll watch for progress changes and compare with current audio time.
  React.useEffect(() => {
    if (audioRef.current && currentSong && !isNaN(audioRef.current.duration)) {
      const audioTime = audioRef.current.currentTime;
      const targetTime = progress * audioRef.current.duration;

      // If the difference is significant (more than 2 seconds), it's likely a manual seek
      if (Math.abs(audioTime - targetTime) > 2) {
        console.log("Significant drift detected, seeking to:", targetTime);
        seek(progress);
      }
    }
  }, [progress, seek, currentSong, audioRef]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const renderMainContent = () => {
    switch (activeNav) {
      case "trending":
        return (
          <div className="main-area-content">
            <CollectionHeader
              title="Trending Now"
              activeLanguage={activeLanguage}
              onLanguageChange={setLanguage}
            />
            <SongListView
              title=""
              songs={trendingSongs}
              onPlay={(s) => playSong(s, trendingSongs)}
            />
          </div>
        );
      case "new-releases":
        return (
          <div className="main-area-content">
            <CollectionHeader
              title="New Releases"
              activeLanguage={activeLanguage}
              onLanguageChange={setLanguage}
            />
            <SongListView
              title=""
              songs={newReleases}
              onPlay={(s) => playSong(s, newReleases)}
            />
          </div>
        );
      case "liked":
        return <SongListView title="Liked Songs" songs={favoriteSongs} onPlay={(s) => playSong(s, favoriteSongs)} />;
      case "history":
        return <SongListView title="Recently Played" songs={history} onPlay={(s) => playSong(s, history)} />;
      case "search":
        return <SearchArea searchQuery={searchQuery} onPlaySong={playSong} />;
      case "home":
      default:
        return <SearchArea searchQuery="" onPlaySong={playSong} />;
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar-area">
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
      </div>

      <div className="topbar-area">
        <Topbar
          theme={theme}
          toggleTheme={toggleTheme}
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
        />
      </div>

      <div className="main-area">
        {renderMainContent()}
      </div>

      <div className="player-area">
        <PlayerBar />
      </div>
    </div>
  );
};

// Header component for Collections with Language Selector
const CollectionHeader = ({ title, activeLanguage, onLanguageChange }) => {
  const languages = [
    { id: "hindi", label: "Hindi" },
    { id: "english", label: "English" },
    { id: "telugu", label: "Telugu" },
    { id: "punjabi", label: "Punjabi" },
    { id: "tamil", label: "Tamil" },
  ];

  return (
    <div className="collection-header">
      <h1 className="section-title">{title}</h1>
      <div className="language-pills">
        {languages.map((lang) => (
          <button
            key={lang.id}
            className={`pill ${activeLanguage === lang.id ? "active" : ""}`}
            onClick={() => onLanguageChange(lang.id)}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Generic list view for Liked/History
const SongListView = ({ title, songs, onPlay }) => {
  return (
    <div className="main-area-content">
      <div className="search-results-section">
        {title && <h2 className="section-title">{title}</h2>}
        {songs.length === 0 ? (
          <div className="empty-message">Nothing here yet. Start listening!</div>
        ) : (
          <div className="songs-grid">
            {songs.map((song) => (
              <div key={song.id} className="song-card" onClick={() => onPlay(song)}>
                <div className="song-image-container">
                  <img src={song.image} alt={song.title} className="song-image" />
                  <button
                    className="card-play-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlay(song);
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z" /></svg>
                  </button>
                </div>
                <div className="song-info-card">
                  <h3 className="song-title-card text-ellipsis">{song.title}</h3>
                  <p className="song-artist-card text-ellipsis">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;