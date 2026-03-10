// JioSaavn API service
const API_BASE = "https://jiosaavn-api-privatecvc2.vercel.app";

const decodeHtml = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const mapSongData = (song) => {
  // Get best quality audio URL
  let audioUrl = "";
  if (song.downloadUrl && Array.isArray(song.downloadUrl)) {
    const sortedByQuality = song.downloadUrl
      .map((item) => ({
        ...item,
        qualityNum: parseInt(item.quality.replace("kbps", "")) || 0,
      }))
      .sort((a, b) => b.qualityNum - a.qualityNum);
    audioUrl = sortedByQuality[0]?.link || "";
  } else if (song.url) {
    audioUrl = song.url;
  }

  // Get best quality image
  let imageUrl = "";
  if (song.image && Array.isArray(song.image)) {
    imageUrl = song.image[song.image.length - 1]?.link || song.image[song.image.length - 1]?.url || "";
  } else if (typeof song.image === "string") {
    imageUrl = song.image;
  }

  // Handle artist mapping (can be string, array of strings, or array of objects)
  let artist = "Unknown Artist";
  if (song.primaryArtists) {
    if (typeof song.primaryArtists === "string") {
      artist = song.primaryArtists;
    } else if (Array.isArray(song.primaryArtists)) {
      artist = song.primaryArtists
        .map((a) => (typeof a === "object" ? a.name : a))
        .join(", ");
    }
  } else if (song.subtitle) {
    artist = song.subtitle;
  }

  return {
    id: song.id || song.songId || `${song.name}-${song.album?.name || ""}-${Math.random()}`,
    title: decodeHtml(song.name || song.title || "Unknown Title"),
    artist: decodeHtml(artist),
    album: decodeHtml(song.album?.name || song.album || "Unknown Album"),
    duration: parseInt(song.duration, 10) || 0,
    image: imageUrl || "https://via.placeholder.com/150",
    url: audioUrl,
    language: song.language || "unknown",
  };
};

export const searchSongs = async (query, page = 0, limit = 20) => {
  if (!query.trim()) return [];

  try {
    const response = await fetch(
      `${API_BASE}/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );

    if (!response.ok) throw new Error("API fetch failed");

    const data = await response.json();
    if (data.status !== "SUCCESS" || !data.data?.results) return [];

    return data.data.results
      .map(mapSongData)
      .filter((song) => song.url && song.url.trim() !== "");
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
};

export const getTrending = async (language = "hindi") => {
  try {
    const response = await fetch(`${API_BASE}/modules?language=${language.toLowerCase()}`);
    if (!response.ok) throw new Error("Trending fetch failed");

    const data = await response.json();
    if (data.status !== "SUCCESS") return [];

    const trendingList = data.data?.trending?.songs || data.data?.charts?.[0]?.songs || [];
    return trendingList.map(mapSongData).filter(s => s.url);
  } catch (error) {
    console.error("Error fetching trending:", error);
    // Fallback to a search-based trending if modules fail
    try {
      return await searchSongs(language, 0, 20);
    } catch (e) {
      return [];
    }
  }
};

export const getNewReleases = async (language = "hindi") => {
  try {
    const response = await fetch(`${API_BASE}/modules?language=${language.toLowerCase()}`);
    if (!response.ok) throw new Error("New releases fetch failed");

    const data = await response.json();
    if (data.status !== "SUCCESS") return [];

    const newSongs = data.data?.new_trending?.songs || [];
    if (newSongs.length > 0) {
      return newSongs.map(mapSongData).filter(s => s.url);
    }

    // Fallback search
    return await searchSongs(`latest ${language}`, 0, 20);
  } catch (error) {
    console.error("Error fetching new releases:", error);
    return [];
  }
};

export const getSongSuggestions = async (songId) => {
  try {
    const response = await fetch(`${API_BASE}/songs/${songId}/suggestions`);
    if (!response.ok) throw new Error("Suggestions fetch failed");

    const data = await response.json();
    if (data.status !== "SUCCESS" || !data.data) return [];

    return data.data
      .map(mapSongData)
      .filter((song) => song.url && song.url.trim() !== "");
  } catch (error) {
    console.error("Fetch suggestions failed:", error);
    return [];
  }
};