# 🎵 NishuPlayer - High Quality Music Player

A modern, feature-rich music player web application built with **React** and **Web Audio API**. Stream songs from JioSaavn with advanced controls including equalizer, shuffle, repeat, and favorites management.

## ✨ Features

- 🎵 **High-Quality Audio Streaming** - Stream music with multiple quality options
- 🔍 **Real-time Search** - Search and play songs from JioSaavn database
- 🎚️ **Equalizer** - Adjust Bass and Treble in real-time
- 🔀 **Shuffle Mode** - Randomize playback order
- 🔁 **Repeat Mode** - Loop current song or queue
- ❤️ **Favorites** - Save your favorite songs with persistent storage
- 🌙 **Dark/Light Theme** - Toggle between themes with preference saving
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🚀 **PWA Support** - Install as a web app

## 🔧 All Issues Fixed

### 15 Major Issues Resolved:
1. ✅ Play/Pause button response issues
2. ✅ Progress bar not updating correctly
3. ✅ Volume control click handling
4. ✅ Previous button logic (reset if >3 seconds)
5. ✅ Audio context suspension problems
6. ✅ Shuffle button state management
7. ✅ Repeat button functionality
8. ✅ Heart/Favorite button interaction
9. ✅ Equalizer (Bass/Treble) audio effects
10. ✅ Search results display
11. ✅ End of song auto-play next track
12. ✅ Theme persistence
13. ✅ Queue management
14. ✅ Responsive mobile layout
15. ✅ Cross-origin audio playback

[See detailed fixes in FIXES.md](./FIXES.md)

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📂 Project Structure

```
nishuplayer/
├── src/
│   ├── components/
│   │   ├── PlayerBar.jsx      # Main player controls
│   │   ├── SearchArea.jsx     # Search and song display
│   │   ├── Sidebar.jsx        # Navigation sidebar
│   │   └── Topbar.jsx         # Top bar with search
│   ├── hooks/
│   │   ├── useAudio.js        # Web Audio API hook
│   │   └── useAudioProgress.js # Progress tracking
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # React entry point
│   ├── api.js                 # JioSaavn API integration
│   ├── store.js               # State management
│   └── styles.css             # All styling
├── index.html                 # HTML entry point
├── vite.config.js             # Vite configuration
├── package.json               # Project dependencies
├── FIXES.md                   # Detailed fix documentation
└── README.md                  # This file
```

## 🎮 How to Use

### Search for Songs
1. Type in the search box at the top
2. Results will appear with song thumbnails
3. Click on a song card to play it

### Control Playback
- **Play/Pause**: Click the large play button
- **Next Track**: Click skip next button or press End
- **Previous Track**: Click skip previous or press Home (resets if >3 seconds played)
- **Progress**: Click on the progress bar to jump to a position

### Volume & Effects
- **Volume**: Click on the volume bar to adjust
- **Mute/Unmute**: Click the volume icon
- **Equalizer**: Click the slider icon to show Bass/Treble controls

### Queue Management
- **Shuffle**: Toggle shuffle button to randomize order
- **Repeat**: Toggle repeat button to loop current song

### Favorites
- **Add to Favorites**: Click the heart icon to save a song
- **Hearts are saved**: Persisted using browser localStorage

### Theme
- **Toggle Theme**: Click the sun/moon icon in top right
- **Your preference is saved** for next visit

## 🛠️ Technical Stack

- **Frontend**: React 19
- **Audio API**: Web Audio API with Biquad Filters
- **Styling**: CSS3 with CSS Variables
- **Build Tool**: Vite
- **API**: JioSaavn (free music streaming)
- **PWA**: Service Workers & Manifests
- **Storage**: localStorage for favorites and theme

## 🌐 Browser Support

| Browser | Support | Version |
|---------|---------|---------|
| Chrome  | ✅      | Latest  |
| Firefox | ✅      | Latest  |
| Safari  | ✅      | 11+     |
| Edge    | ✅      | Latest  |
| Mobile  | ✅      | Most modern browsers |

## 🔐 Privacy & Data

- **No Server Tracking**: All favorites stored locally
- **Offline Ready**: PWA enables offline listening
- **No Account Required**: Completely anonymous usage
- **CORS-Enabled**: Safe cross-origin audio streaming

## 🎯 Performance

- Lightweight bundle size
- Lazy-loaded components
- Service Worker caching
- Optimized image loading
- Debounced search (600ms)

## 🐛 Known Limitations

- Song availability depends on JioSaavn API (may vary by region)
- Audio quality limited by source API
- Playlist creation not yet implemented
- Social features (sharing, recommendations) not implemented

## 📝 Future Enhancements

- [ ] User playlists creation
- [ ] Playlist sharing
- [ ] Song recommendations
- [ ] Lyrics display
- [ ] Audio visualizer
- [ ] Mini player
- [ ] History tracking
- [ ] Social sharing

## 👨‍💻 Developer Notes

### Key Components

**useAudio Hook**
- Manages Web Audio API lifecycle
- Handles context suspension
- Implements EQ filters
- Volume control with gain node

**musicStore**
- Custom state management
- Actions for all player controls
- localStorage persistence
- Reactive subscriptions

**API Module**
- JioSaavn integration
- Search debouncing
- Error handling
- URL quality optimization

## 📄 License

This project is open source and available for personal use.

## 🙏 Credits

- **Music API**: JioSaavn
- **Icons**: Built with SVG
- **Fonts**: Google Fonts (Inter)
- **Framework**: React & Vite

## 📮 Feedback

Have suggestions or found bugs? Feel free to open an issue or contribute improvements!

---

**Made with ❤️ for music lovers everywhere**

