import React from "react";

// Home Icon
const HomeIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

// Search Icon
const SearchIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

// Library Icon
const LibraryIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

// Heart Icon
const HeartIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

// Plus Icon
const PlusIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

// Globe Icon
const GlobeIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// History Icon
const HistoryIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Sidebar = ({ activeNav, setActiveNav, onNavClick }) => {
  const handleNavClick = (nav) => {
    setActiveNav(nav);
    if (onNavClick) onNavClick();
  };
  return (
    <div className="sidebar">
      <div className="logo-container">
        <h2 onClick={() => handleNavClick("home")} style={{ cursor: "pointer" }}>NishuPlayer</h2>
      </div>

      <div className="nav-section">
        <ul>
          <li
            className={`nav-item ${activeNav === "home" ? "active" : ""}`}
            onClick={() => handleNavClick("home")}
          >
            <HomeIcon size={24} />
            <span>Home</span>
          </li>
          <li
            className={`nav-item ${activeNav === "search" ? "active" : ""}`}
            onClick={() => handleNavClick("search")}
          >
            <SearchIcon size={24} />
            <span>Search</span>
          </li>
          <li
            className={`nav-item ${activeNav === "library" ? "active" : ""}`}
            onClick={() => handleNavClick("library")}
          >
            <LibraryIcon size={24} />
            <span>Your Library</span>
          </li>
        </ul>
      </div>

      <div className="nav-section">
        <h3 className="nav-section-title">Your Collections</h3>
        <ul>
          <li
            className={`nav-item ${activeNav === "liked" ? "active" : ""}`}
            onClick={() => handleNavClick("liked")}
          >
            <HeartIcon size={24} />
            <span>Liked Songs</span>
          </li>
          <li
            className={`nav-item ${activeNav === "history" ? "active" : ""}`}
            onClick={() => handleNavClick("history")}
          >
            <HistoryIcon size={24} />
            <span>Recently Played</span>
          </li>
        </ul>
      </div>

      <div className="nav-section">
        <h3 className="nav-section-title">Explore</h3>
        <ul>
          <li
            className={`nav-item ${activeNav === "trending" ? "active" : ""}`}
            onClick={() => handleNavClick("trending")}
          >
            <GlobeIcon size={24} />
            <span>Trending Now</span>
          </li>
          <li
            className={`nav-item ${activeNav === "new-releases" ? "active" : ""}`}
            onClick={() => handleNavClick("new-releases")}
          >
            <PlusIcon size={24} />
            <span>New Releases</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
