import React from "react";
import { useMusicStoreWithActions } from "../store";

// Icon components (inline SVGs)
const PlayIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M5 3l14 9-14 9V3z" />
  </svg>
);

const PauseIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <rect x="6" y="3" width="4" height="18" />
    <rect x="14" y="3" width="4" height="18" />
  </svg>
);

const SkipPrevIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M6 6v12M18 6l-12 6 12 6V6z" />
  </svg>
);

const SkipNextIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M18 18V6M6 6l12 6-12 6v-12z" />
  </svg>
);

const ShuffleIcon = ({ size = 24, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M21 16V4a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h4l3 3 3-3h4a2 2 0 0 0 2-2z" />
  </svg>
);

const RepeatIcon = ({ size = 24, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M17 2l4 4-4 4M3 18l-4-4 4-4M3 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3" />
  </svg>
);

const VolumeIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
);

const MuteIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M16.6915026,12.4744748 L21.0151496,8.15087374 C21.8001121,7.36590827 21.8001121,6.11172425 21.0151496,5.32675879 C20.2301871,4.54179332 18.9759731,4.54179332 18.1910105,5.32675879 L13.8673635,9.64013049 L9.54371654,5.32675879 C8.75875107,4.54179332 7.50456705,4.54179332 6.71960158,5.32675879 C5.93463612,6.11172425 5.93463612,7.36590827 6.71960158,8.15087374 L11.0432486,12.4744748 L6.71960158,16.7980864 C5.93463612,17.5830519 5.93463612,18.8372359 6.71960158,19.6222014 C7.50456705,20.407166 8.75875107,20.407166 9.54371654,19.6222014 L13.8673635,15.2985847 L18.1910105,19.6222014 C18.9759731,20.407166 20.2301871,20.407166 21.0151496,19.6222014 C21.8001121,18.8372359 21.8001121,17.5830519 21.0151496,16.7980864 L16.6915026,12.4744748 Z M3,3 L0,6 L0,18 C0,19.1045695 0.8954305,20 2,20 L9,20 L14,25 L14,3 L9,3 L3,3 Z" />
  </svg>
);

const HeartIcon = ({ size = 24, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const AutoplayIcon = ({ size = 24, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M10 8l6 4-6 4V8z" fill={active ? "white" : "currentColor"} />
  </svg>
);

const PlayerBar = () => {
  const {
    currentSong,
    isPlaying,
    volume,
    progress,
    isShuffle,
    isRepeat,
    autoplay,
    favoriteSongs,
    togglePlayPause,
    playNext,
    playPrevious,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    toggleAutoplay,
    toggleFavorite,
    setProgress,
    seekTo,
  } = useMusicStoreWithActions();

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const clickX = e.clientX - progressBar.getBoundingClientRect().left;
    const width = progressBar.getBoundingClientRect().width;
    const newProgress = Math.max(0, Math.min(1, clickX / width));
    setProgress(newProgress);
  };

  const handleVolumeClick = (e) => {
    const volumeBar = e.currentTarget;
    const clickX = e.clientX - volumeBar.getBoundingClientRect().left;
    const width = volumeBar.getBoundingClientRect().width;
    const newVolume = Math.max(0, Math.min(1, clickX / width));
    setVolume(newVolume);
  };

  const isFavorite = currentSong ? favoriteSongs.some((s) => s.id === currentSong.id) : false;

  return (
    <div className="playerbar">
      {/* Now Playing Section */}
      <div className="now-playing">
        {currentSong ? (
          <>
            <img
              src={currentSong.image}
              alt="Album Art"
              className="album-art-placeholder"
            />
            <div className="song-info">
              <div className="song-title text-ellipsis">{currentSong.title}</div>
              <div className="song-artist text-ellipsis">{currentSong.artist}</div>
            </div>
            <button
              className="heart-btn"
              onClick={() => toggleFavorite(currentSong)}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <HeartIcon size={16} filled={isFavorite} />
            </button>
          </>
        ) : (
          <div className="empty-state">Select a song to play</div>
        )}
      </div>

      {/* Player Controls Section */}
      <div className="player-controls">
        <div className="control-buttons">
          <button
            className={`control-btn small ${isShuffle ? "active" : ""}`}
            onClick={toggleShuffle}
            title="Toggle shuffle"
          >
            <ShuffleIcon size={18} active={isShuffle} />
          </button>

          <button
            className="control-btn"
            onClick={playPrevious}
            title="Previous track"
          >
            <SkipPrevIcon size={24} />
          </button>

          <button
            className="play-pause-btn"
            onClick={togglePlayPause}
            disabled={!currentSong}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <PauseIcon size={24} />
            ) : (
              <PlayIcon size={24} />
            )}
          </button>

          <button
            className="control-btn"
            onClick={playNext}
            title="Next track"
          >
            <SkipNextIcon size={24} />
          </button>

          <button
            className={`control-btn small ${isRepeat ? "active" : ""}`}
            onClick={toggleRepeat}
            title="Toggle repeat"
          >
            <RepeatIcon size={18} active={isRepeat} />
          </button>

          <button
            className={`control-btn small ${autoplay ? "active" : ""}`}
            onClick={toggleAutoplay}
            title="Toggle autoplay (related songs)"
          >
            <AutoplayIcon size={18} active={autoplay} />
          </button>
        </div>

        {/* Progress Bar Section */}
        <div className="progress-container">
          <span className="time-text">
            {currentSong ? formatTime(progress * currentSong.duration) : "0:00"}
          </span>
          <div className="progress-bar" onClick={handleProgressClick}>
            <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
          <span className="time-text">
            {currentSong ? formatTime(currentSong.duration) : "0:00"}
          </span>
        </div>
      </div>

      {/* Player Utils Section */}
      <div className="player-utils">
        {/* Volume Control */}
        <div className="volume-control">
          <button
            className="util-btn"
            onClick={() => setVolume(volume === 0 ? 1 : 0)}
            title={volume === 0 ? "Unmute" : "Mute"}
          >
            {volume === 0 ? (
              <MuteIcon size={20} />
            ) : (
              <VolumeIcon size={20} />
            )}
          </button>
          <div className="volume-bar" onClick={handleVolumeClick}>
            <div className="volume-fill" style={{ width: `${volume * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerBar;