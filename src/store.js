// Music Player Store with Zustand-like pattern
import React from "react";

const createStore = (initializer) => {
  let state = undefined;
  const listeners = new Set();

  const setState = (updater, replace) => {
    const newState = typeof updater === "function" ? updater(state) : updater;
    if (!Object.is(newState, state)) {
      const previousState = state;
      state = replace ? (typeof newState === "object" && newState !== null ? newState : Object.assign({}, state, newState)) : newState;
      listeners.forEach((listener) => listener(state, previousState));
    }
  };

  const getState = () => state;

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const store = { setState, getState, subscribe };
  state = initializer(setState, getState, store);
  return store;
};

export const musicStore = createStore((setState, getState) => {
  const favoriteSongs = JSON.parse(localStorage.getItem("nishu_favorites") || "[]");
  
  return {
    currentSong: null,
    queue: [],
    isPlaying: false,
    volume: 1,
    progress: 0,
    isShuffle: false,
    isRepeat: false,
    favoriteSongs,
    playlists: [],

    // Action: Play a song
    playSong: (song, queue = null) => {
      setState((state) => ({
        currentSong: song,
        queue: queue || state.queue,
        isPlaying: true,
        progress: 0,
      }));
    },

    // Action: Play next song
    playNext: () => {
      const state = getState();
      const { queue, currentSong, isShuffle, isRepeat } = state;

      if (!currentSong || queue.length === 0) return;

      if (isRepeat) {
        // Repeat current song
        setState({ progress: 0, isPlaying: true });
        return;
      }

      if (isShuffle) {
        // Play random song
        const randomIndex = Math.floor(Math.random() * queue.length);
        setState({
          currentSong: queue[randomIndex],
          progress: 0,
          isPlaying: true,
        });
        return;
      }

      // Play next song in queue
      const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
      const nextIndex = currentIndex + 1;

      if (nextIndex < queue.length) {
        setState({
          currentSong: queue[nextIndex],
          progress: 0,
          isPlaying: true,
        });
      } else {
        // End of queue
        setState({ isPlaying: false, progress: 0 });
      }
    },

    // Action: Play previous song
    playPrevious: () => {
      const state = getState();
      const { queue, currentSong, progress } = state;

      if (!currentSong || queue.length === 0) return;

      // If more than 3 seconds elapsed, reset to beginning
      if (progress * currentSong.duration > 3) {
        setState({ progress: 0 });
        return;
      }

      // Go to previous song
      const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
      const previousIndex = currentIndex - 1;

      if (previousIndex >= 0) {
        setState({
          currentSong: queue[previousIndex],
          progress: 0,
          isPlaying: true,
        });
      } else {
        setState({ progress: 0 });
      }
    },

    // Action: Toggle play/pause
    togglePlayPause: () => {
      const state = getState();
      if (state.currentSong) {
        setState({ isPlaying: !state.isPlaying });
      }
    },

    // Action: Set volume
    setVolume: (volume) => setState({ volume }),

    // Action: Set progress
    setProgress: (progress) => setState({ progress }),

    // Action: Toggle shuffle
    toggleShuffle: () => setState((state) => ({ isShuffle: !state.isShuffle })),

    // Action: Toggle repeat
    toggleRepeat: () => setState((state) => ({ isRepeat: !state.isRepeat })),

    // Action: Toggle favorite
    toggleFavorite: (song) => {
      setState((state) => {
        const isFavorite = state.favoriteSongs.some((s) => s.id === song.id);
        const newFavorites = isFavorite
          ? state.favoriteSongs.filter((s) => s.id !== song.id)
          : [...state.favoriteSongs, song];
        
        localStorage.setItem("nishu_favorites", JSON.stringify(newFavorites));
        return { favoriteSongs: newFavorites };
      });
    },
  };
});

// Hook to use store
export const useMusicStore = (selector = (state) => state) => {
  const store = musicStore;
  const [state, setState] = React.useState(() => selector(store.getState()));

  React.useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState(selector(store.getState()));
    });
    return unsubscribe;
  }, []);

  return state;
};

// Merge actions with state selector
export const useMusicStoreWithActions = () => {
  const state = useMusicStore();
  const actions = useMusicStore((s) => ({
    playSong: s.playSong,
    playNext: s.playNext,
    playPrevious: s.playPrevious,
    togglePlayPause: s.togglePlayPause,
    setVolume: s.setVolume,
    setProgress: s.setProgress,
    toggleShuffle: s.toggleShuffle,
    toggleRepeat: s.toggleRepeat,
    toggleFavorite: s.toggleFavorite,
  }));

  return { ...state, ...actions };
};
