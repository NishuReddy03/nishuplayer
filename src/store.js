// Music Player Store with Zustand-like pattern
import React from "react";

const createStore = (initializer) => {
  let state = undefined;
  const listeners = new Set();

  const setState = (updater, replace = false) => {
    const nextState = typeof updater === "function" ? updater(state) : updater;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = replace ? nextState : (typeof nextState === "object" && nextState !== null ? { ...state, ...nextState } : nextState);
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
  const history = JSON.parse(localStorage.getItem("nishu_history") || "[]");

  return {
    currentSong: null,
    queue: [],
    isPlaying: false,
    volume: 1,
    progress: 0,
    isShuffle: false,
    isRepeat: false,
    autoplay: true,
    favoriteSongs: Array.isArray(favoriteSongs) ? favoriteSongs : [],
    history: Array.isArray(history) ? history : [],
    trendingSongs: [],
    newReleases: [],
    activeLanguage: "hindi",
    searchPage: 0,
    playlists: [],

    // Action: Play a song
    playSong: (song, queue = null) => {
      if (!song) return;

      setState((state) => {
        // Add to history
        const newHistory = [song, ...state.history.filter((s) => s.id !== song.id)].slice(0, 50);
        localStorage.setItem("nishu_history", JSON.stringify(newHistory));

        return {
          currentSong: song,
          queue: queue || state.queue,
          isPlaying: true,
          progress: 0,
          history: newHistory,
        };
      });
    },

    // Action: Play next song
    playNext: async () => {
      const state = getState();
      const { queue, currentSong, isShuffle, isRepeat, autoplay } = state;

      if (!currentSong || queue.length === 0) return;

      if (isRepeat) {
        // Repeat current song
        setState({ progress: 0, isPlaying: true });
        return;
      }

      let nextSong = null;
      const currentIndex = queue.findIndex((s) => s.id === currentSong.id);

      if (isShuffle) {
        // Play random song
        const randomIndex = Math.floor(Math.random() * queue.length);
        nextSong = queue[randomIndex];
      } else {
        // Play next song in queue
        const nextIndex = currentIndex + 1;

        if (nextIndex < queue.length) {
          nextSong = queue[nextIndex];
        }
      }

      if (nextSong) {
        // Use playSong to ensure it's added to history
        state.playSong(nextSong, queue);
      } else if (autoplay) {
        // Queue ended, try autoplay
        try {
          const { getSongSuggestions } = await import("./api");
          const suggestions = await getSongSuggestions(currentSong.id);
          if (suggestions && suggestions.length > 0) {
            state.playSong(suggestions[0], suggestions);
          } else {
            setState({ isPlaying: false, progress: 0 });
          }
        } catch (error) {
          console.error("Autoplay failed:", error);
          setState({ isPlaying: false, progress: 0 });
        }
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
        state.playSong(queue[previousIndex], queue);
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
      if (!song) return;
      setState((state) => {
        const isFavorite = state.favoriteSongs.some((s) => s.id === song.id);
        const newFavorites = isFavorite
          ? state.favoriteSongs.filter((s) => s.id !== song.id)
          : [...state.favoriteSongs, song];

        localStorage.setItem("nishu_favorites", JSON.stringify(newFavorites));
        return { favoriteSongs: newFavorites };
      });
    },

    // Action: Toggle autoplay
    toggleAutoplay: () => setState((state) => ({ autoplay: !state.autoplay })),

    // Action: Fetch trending
    fetchTrending: async (language) => {
      try {
        const { getTrending } = await import("./api");
        const songs = await getTrending(language);
        setState({
          trendingSongs: songs,
          activeLanguage: language
        });
      } catch (error) {
        console.error("Fetch trending failed:", error);
      }
    },

    // Action: Fetch new releases
    fetchNewReleases: async (language) => {
      try {
        const { getNewReleases } = await import("./api");
        const songs = await getNewReleases(language);
        setState({
          newReleases: songs,
          activeLanguage: language
        });
      } catch (error) {
        console.error("Fetch new releases failed:", error);
      }
    },

    // Action: Set active language
    setLanguage: (lang) => setState({ activeLanguage: lang }),

    // Action: Load more search results
    loadMoreSearchResults: async (query) => {
      const state = getState();
      const nextPage = state.searchPage + 1;
      try {
        const { searchSongs } = await import("./api");
        const moreSongs = await searchSongs(query, nextPage);
        if (moreSongs.length > 0) {
          setState({
            queue: [...state.queue, ...moreSongs],
            searchPage: nextPage,
          });
        }
      } catch (error) {
        console.error("Load more failed:", error);
      }
    },

    // Action: Reset search page
    resetSearchPage: () => setState({ searchPage: 0 }),
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
    toggleAutoplay: s.toggleAutoplay,
    toggleFavorite: s.toggleFavorite,
    fetchTrending: s.fetchTrending,
    fetchNewReleases: s.fetchNewReleases,
    setLanguage: s.setLanguage,
    loadMoreSearchResults: s.loadMoreSearchResults,
    resetSearchPage: s.resetSearchPage,
  }));

  return { ...state, ...actions };
};
