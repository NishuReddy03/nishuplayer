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

  // Navigation state - handle URL parameters for PWA shortcuts
  const [activeNav, setActiveNav] = React.useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    return section || "home";
  });

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Mobile audio message state
  const [showMobileAudioMessage, setShowMobileAudioMessage] = React.useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = React.useState("");

  // Handle PWA installation prompt
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = React.useState(false);

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
    isMobile,
    isMobileAudioBlocked,
    userInteracted,
  } = useAudio();

  // Apply theme
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("nishu_theme", theme);
  }, [theme]);

  // Handle PWA install prompt
  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install prompt after user has interacted with the app
      setTimeout(() => setShowInstallPrompt(true), 30000); // Show after 30 seconds
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle install button click
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  // Fetch collection when activeNav changes
  React.useEffect(() => {
    if (activeNav === "trending") {
      fetchTrending(activeLanguage);
    } else if (activeNav === "new-releases") {
      fetchNewReleases(activeLanguage);
    }
  }, [activeNav, activeLanguage, fetchTrending, fetchNewReleases]);

  // Sync mobile audio blocked state
  React.useEffect(() => {
    if (isMobile && isMobileAudioBlocked) {
      setShowMobileAudioMessage(true);
    }
  }, [isMobile, isMobileAudioBlocked]);

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
    const handlePlayPause = async () => {
      if (isPlaying && currentSong?.url) {
        console.log("Attempting to play:", currentSong.title);
        const playSuccess = await play();
        if (playSuccess === false && isMobile) {
          // On mobile, if play fails, keep the UI showing as playing but show blocked message
          console.warn("Mobile audio blocked, keeping UI in playing state");
        }
      } else if (!isPlaying) {
        pause();
      }
    };

    handlePlayPause();
  }, [isPlaying, currentSong, play, pause, isMobile]);

  // Handle volume changes
  React.useEffect(() => {
    setAudioVolume(volume);
  }, [volume, setAudioVolume]);

  // Handle progress updates from audio element
  const handleAudioProgress = React.useCallback(() => {
    if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      const newProgress = currentTime / duration;
      if (!isNaN(newProgress)) {
        setProgress(Math.min(1, Math.max(0, newProgress)));
      }
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
    }
  };

  return (
    <div className="app-container">
      <div className={`sidebar-area ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} onNavClick={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}

      <div className="topbar-area">
        <Topbar
          theme={theme}
          toggleTheme={toggleTheme}
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      </div>

      <div className="main-area">
        {renderMainContent()}
      </div>

      {/* Mobile Audio Blocked Message */}
      {isMobile && showMobileAudioMessage && (
        <div className="mobile-audio-message">
          <div className="mobile-audio-content">
            <button
              className="mobile-audio-close"
              onClick={() => setShowMobileAudioMessage(false)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="mobile-audio-icon">🔊</div>
            <h3>Enable Audio Playback</h3>
            <p>Mobile browsers require user interaction to play audio. Tap anywhere on the screen to enable sound.</p>
            <button
              className="mobile-audio-btn"
              onClick={() => {
                // Try to play again
                if (currentSong?.url) {
                  play();
                }
                setShowMobileAudioMessage(false);
              }}
            >
              Enable Audio
            </button>
          </div>
        </div>
      )}

      {/* PWA Install Prompt */}
      {showInstallPrompt && (
        <div className="mobile-audio-message">
          <div className="mobile-audio-content">
            <button
              className="mobile-audio-close"
              onClick={() => setShowInstallPrompt(false)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="mobile-audio-icon">📱</div>
            <h3>Install NishuPlayer</h3>
            <p>Install our app for a better music experience with offline support!</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button
                className="mobile-audio-btn"
                onClick={handleInstallClick}
              >
                Install App
              </button>
              <button
                className="mobile-audio-btn secondary"
                onClick={() => setShowInstallPrompt(false)}
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

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