import React from "react";

// Moon Icon
const MoonIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// Sun Icon
const SunIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

// Search Icon
const SearchIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

// User Icon
const UserIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const Topbar = ({ theme, toggleTheme, searchQuery, setSearchQuery }) => {
  return (
    <div className="topbar">
      <div className="search-container">
        <SearchIcon className="search-icon" size={20} />
        <input
          type="text"
          placeholder="What do you want to listen to?"
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
        />
        {searchQuery && (
          <button className="clear-search" onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", color: "var(--text-soft)", cursor: "pointer", padding: "0 8px", fontSize: "18px" }}>
            &times;
          </button>
        )}
      </div>

      <div className="topbar-actions">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? <MoonIcon size={20} /> : <SunIcon size={20} />}
        </button>

        <button className="user-profile" title="User profile">
          <UserIcon size={20} />
        </button>
      </div>
    </div>
  );
};

export default Topbar;
