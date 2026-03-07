import React from "react";
import { useMusicStoreWithActions } from "../store";
import { searchSongs } from "../api";

// Search Icon
const SearchIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

// Play Icon
const PlayIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M5 3l14 9-14 9V3z" />
  </svg>
);

const SearchArea = ({ searchQuery }) => {
  const { playSong } = useMusicStoreWithActions();
  const [songs, setSongs] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // Search for songs when query changes
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSongs([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const results = await searchSongs(searchQuery);
        setSongs(results);
      } catch (err) {
        setError("Failed to fetch songs. Please try again later.");
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 600); // Debounce search

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handlePlaySong = (song) => {
    playSong(song, songs);
  };

  // Home view
  if (!searchQuery) {
    return (
      <div className="main-area-content">
        <div className="home-section">
          <h1 className="greeting">Good evening</h1>
          <p className="subtitle">Search for a song, artist, or album to start listening.</p>
          <div className="placeholder-banner">
            <div className="banner-content">
              <h2>Discover High-Quality Music</h2>
              <p>Completely free, full-length tracks with EQ and Bass Boost.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Search results view
  return (
    <div className="main-area-content">
      <div className="search-results-section">
        <h2 className="section-title">Top Results for "{searchQuery}"</h2>

        {loading && <div className="loading-spinner">Searching JioSaavn Library...</div>}
        {error && <div className="error-message">{error}</div>}
        {!loading && !error && songs.length === 0 && searchQuery.length > 2 && (
          <div className="empty-message">No results found for "{searchQuery}"</div>
        )}

        <div className="songs-grid">
          {songs.map((song) => (
            <div
              key={song.id}
              className="song-card"
              onClick={() => handlePlaySong(song)}
            >
              <div className="song-image-container">
                <img src={song.image} alt={song.title} className="song-image" />
                <button className="card-play-btn">
                  <PlayIcon size={24} />
                </button>
              </div>
              <div className="song-info-card">
                <h3 className="song-title-card text-ellipsis">{song.title}</h3>
                <p className="song-artist-card text-ellipsis">{song.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchArea;
