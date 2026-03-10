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
  const [loadingMore, setLoadingMore] = React.useState(false);

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
        const results = await searchSongs(searchQuery, 0);
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

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = Math.floor(songs.length / 20);
      const moreSongs = await searchSongs(searchQuery, nextPage);
      if (moreSongs.length > 0) {
        setSongs((prev) => [...prev, ...moreSongs]);
      }
    } catch (err) {
      console.error("Load more error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePlaySong = (song) => {
    playSong(song, songs);
  };

  // Home view
  if (!searchQuery) {
    const hour = new Date().getHours();
    let greeting = "Good evening";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";

    return (
      <div className="main-area-content">
        <div className="home-section">
          <h1 className="greeting">{greeting}</h1>
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
                <button
                  className="card-play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlaySong(song);
                  }}
                >
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

        {songs.length > 0 && (
          <div className="load-more-container" style={{ textAlign: "center", marginTop: "2rem", paddingBottom: "2rem" }}>
            <button
              className="load-more-btn"
              onClick={handleLoadMore}
              disabled={loadingMore}
              style={{
                backgroundColor: "var(--primary-color)",
                color: "white",
                border: "none",
                padding: "0.8rem 2rem",
                borderRadius: "500px",
                fontWeight: "bold",
                cursor: loadingMore ? "not-allowed" : "pointer",
                opacity: loadingMore ? 0.7 : 1,
                fontSize: "1rem"
              }}
            >
              {loadingMore ? "Loading more..." : "Load More Results"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchArea;
