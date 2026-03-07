// JioSaavn API service
const API_BASE = "https://jiosaavn-api-privatecvc2.vercel.app";

export const searchSongs = async (query) => {
  if (!query.trim()) {
    return [];
  }

  try {
    const response = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error("API fetch failed");
    }

    const data = await response.json();

    if (data.status !== "SUCCESS" || !data.data?.results) {
      return [];
    }

    return data.data.results
      .map((song) => {
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
        }

        // Get best quality image
        let imageUrl = "";
        if (song.image && Array.isArray(song.image)) {
          imageUrl = song.image[song.image.length - 1]?.link || "";
        }

        // Decode HTML entities
        const decodeHtml = (html) => {
          const txt = document.createElement("textarea");
          txt.innerHTML = html;
          return txt.value;
        };

        return {
          id: song.id || Math.random().toString(36),
          title: decodeHtml(song.name || "Unknown Title"),
          artist: decodeHtml(song.primaryArtists || "Unknown Artist"),
          album: decodeHtml(song.album?.name || "Unknown Album"),
          duration: parseInt(song.duration, 10) || 0,
          image: imageUrl,
          url: audioUrl,
          language: song.language || "unknown",
        };
      })
      .filter((song) => song.url !== ""); // Only return songs with playable URLs
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
};
