// JioSaavn API service
const API_MIRRORS = [
  "https://saavn.dev",
  "https://jiosaavn-api-privatecvc2.vercel.app",
  "https://jiosaavn-api-nishu.vercel.app",
  "https://jiosaavn-api-beta.vercel.app"
];

const JAMENDO_BASE = "https://api.jamendo.com/v3.0";
const JAMENDO_CLIENT_ID = "56d30c95"; // Public client ID for Jamendo

const decodeHtml = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const fetchWithFallback = async (endpoint) => {
  for (const base of API_MIRRORS) {
    try {
      const response = await fetch(`${base}${endpoint}`, {
        signal: AbortSignal.timeout(5000) // 5s timeout per mirror
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === "SUCCESS") return data;
      }
    } catch (e) {
      console.warn(`Mirror ${base} failed, trying next...`);
    }
  }
  throw new Error("All API mirrors failed");
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

const mapJamendoData = (track) => {
  return {
    id: `jam-${track.id}`,
    title: track.name,
    artist: track.artist_name,
    album: track.album_name || "Single",
    duration: parseInt(track.duration, 10) || 0,
    image: track.album_image || track.image || "https://via.placeholder.com/150",
    url: track.audio,
    language: "global",
  };
};

const searchJamendo = async (query, limit = 10) => {
  try {
    const response = await fetch(
      `${JAMENDO_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonsearch&search=${encodeURIComponent(query)}&limit=${limit}&audioformat=mp32`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.results ? data.results.map(mapJamendoData) : [];
  } catch (e) {
    console.warn("Jamendo search failed:", e);
    return [];
  }
};

export const searchSongs = async (query, page = 0, limit = 20) => {
  if (!query.trim()) return [];

  try {
    const [saavnData, jamendoResults] = await Promise.all([
      fetchWithFallback(`/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`).catch(() => ({ data: { results: [] } })),
      searchJamendo(query, 10)
    ]);

    const saavnResults = (saavnData.data?.results || [])
      .map(mapSongData)
      .filter((song) => song.url && song.url.trim() !== "");

    return [...saavnResults, ...jamendoResults];
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
};

export const getTrending = async (language = "hindi") => {
  try {
    // If language is English or global, try Jamendo charts too
    if (language.toLowerCase() === "english") {
      const jamResponse = await fetch(`${JAMENDO_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonsearch&order=ratingweek_desc&limit=20`);
      if (jamResponse.ok) {
        const jamData = await jamResponse.json();
        if (jamData.results) return jamData.results.map(mapJamendoData);
      }
    }

    const data = await fetchWithFallback(`/modules?language=${language.toLowerCase()}`);
    if (!data.data) return [];
    const trendingList = data.data?.trending?.songs || data.data?.charts?.[0]?.songs || [];
    return trendingList.map(mapSongData).filter(s => s.url);
  } catch (error) {
    console.error("Error fetching trending:", error);
    try {
      if (language.toLowerCase() === "english") {
        const fallback = await searchJamendo("top hits", 20);
        if (fallback.length > 0) return fallback;
      }
      return await searchSongs(language, 0, 20);
    } catch (e) {
      return [];
    }
  }
};

export const getNewReleases = async (language = "hindi") => {
  try {
    const data = await fetchWithFallback(`/modules?language=${language.toLowerCase()}`);
    if (!data.data) return [];
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
    const data = await fetchWithFallback(`/songs/${songId}/suggestions`);
    if (!data.data) return [];
    return data.data
      .map(mapSongData)
      .filter((song) => song.url && song.url.trim() !== "");
  } catch (error) {
    console.error("Fetch suggestions failed:", error);
    return [];
  }
};