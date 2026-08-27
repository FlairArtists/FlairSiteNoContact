// Auto-updating playlist loader.
// With neither option filled in, fetchPlaylist() still works keylessly: it cues a hidden
// YouTube player to the playlist to read back the live video-ID list, then fetches each
// video's real title/thumbnail via YouTube's public oEmbed endpoint. Results are cached
// for 6h. Fill in an API key or proxy endpoint below only if you want richer data (exact
// publish dates, view counts) or to skip the hidden-player trick.

// OPTION A — YouTube Data API key (console.cloud.google.com → enable "YouTube Data API v3"
// → Credentials → API key → restrict to your website + that one API). Paste it here:
export const YT_API_KEY = "";

// OPTION B — a proxy/serverless endpoint that returns the same JSON shape as fetchPlaylist().
// Use this if you'd rather not expose a key in the page source. It receives ?list=<playlistId>.
export const PLAYLIST_ENDPOINT = "";

const TTL_MS = 6 * 60 * 60 * 1000; // cache for 6h so daily quota is never a concern

const CACHE_VERSION = "v2"; // bump to invalidate old cached (possibly incomplete) playlist reads

function cacheGet(id) {
  try {
    const raw = localStorage.getItem("flair_pl_" + CACHE_VERSION + "_" + id);
    if (!raw) return null;
    const { t, items } = JSON.parse(raw);
    return Date.now() - t < TTL_MS ? items : null;
  } catch (e) { return null; }
}

function cacheSet(id, items) {
  try { localStorage.setItem("flair_pl_" + CACHE_VERSION + "_" + id, JSON.stringify({ t: Date.now(), items })); } catch (e) {}
}

// Keyless fallback: drive a hidden YouTube IFrame Player cued to the playlist and
// read back its real video-ID list via the official player API (getPlaylist()).
// No API key, no proxy — just the standard youtube.com/iframe_api script.
let _ytApiPromise = null;
function loadYTApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (_ytApiPromise) return _ytApiPromise;
  _ytApiPromise = new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof prev === "function") prev();
      resolve(window.YT);
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.onerror = () => reject(new Error("YT API failed to load"));
    document.head.appendChild(s);
    setTimeout(() => reject(new Error("YT API timeout")), 10000);
  });
  return _ytApiPromise;
}

function fetchPlaylistViaPlayerAPI(playlistId) {
  return loadYTApi().then((YT) => new Promise((resolve) => {
    const host = document.createElement("div");
    host.style.cssText = "position:absolute;width:1px;height:1px;left:-9999px;top:-9999px;overflow:hidden;";
    document.body.appendChild(host);
    let done = false;
    const finish = (ids) => {
      if (done) return;
      done = true;
      try { player.destroy(); } catch (e) {}
      host.remove();
      resolve(ids);
    };
    const timer = setTimeout(() => finish(null), 9000);
    let player;
    try {
      player = new YT.Player(host, {
        width: "1",
        height: "1",
        playerVars: { listType: "playlist", list: playlistId, autoplay: 0, controls: 0 },
        events: {
          onReady: (e) => {
            clearTimeout(timer);
            // The full playlist can still be streaming in when onReady fires; poll briefly
            // for the count to stop growing before reading it back.
            let last = -1, tries = 0;
            const poll = () => {
              const ids = e.target.getPlaylist();
              const len = Array.isArray(ids) ? ids.length : 0;
              tries++;
              if (len > 0 && len === last) { finish(ids); return; }
              last = len;
              if (tries >= 12) { finish(len ? ids : null); return; }
              setTimeout(poll, 400);
            };
            poll();
          },
          onError: () => { clearTimeout(timer); finish(null); }
        }
      });
    } catch (e) { clearTimeout(timer); finish(null); }
  })).catch(() => null);
}

// Keyless title/thumbnail lookup via YouTube's public oEmbed endpoint (CORS-enabled, no key needed).
async function enrichViaOEmbed(items) {
  const results = await Promise.all(items.map(async (it) => {
    try {
      const res = await fetch("https://www.youtube.com/oembed?url=" +
        encodeURIComponent("https://www.youtube.com/watch?v=" + it.id) + "&format=json");
      if (!res.ok) return it;
      const data = await res.json();
      return { ...it, title: data.title || it.title, thumb: data.thumbnail_url || it.thumb };
    } catch (e) { return it; }
  }));
  return results;
}

// Returns [{ id, title, thumb, position }] in playlist order, or null if unavailable.
export async function fetchPlaylist(playlistId, max = 24) {
  if (!playlistId) return null;
  const hit = cacheGet(playlistId);
  if (hit) return hit;

  let url = null;
  if (PLAYLIST_ENDPOINT) {
    url = PLAYLIST_ENDPOINT + (PLAYLIST_ENDPOINT.includes("?") ? "&" : "?") + "list=" + encodeURIComponent(playlistId);
  } else if (YT_API_KEY) {
    url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=" +
      Math.min(max, 50) + "&playlistId=" + encodeURIComponent(playlistId) + "&key=" + YT_API_KEY;
  }

  if (!url) {
    const ids = await fetchPlaylistViaPlayerAPI(playlistId);
    if (!ids || !ids.length) return null;
    let items = ids.slice(0, max).map((id, i) => ({ id, title: "", thumb: "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg", position: i }));
    items = await enrichViaOEmbed(items);
    cacheSet(playlistId, items);
    return items;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data.items || data;
    if (!Array.isArray(raw)) return null;
    const items = raw.map((it) => {
      const sn = it.snippet || it;
      const th = (sn.thumbnails && (sn.thumbnails.medium || sn.thumbnails.default)) || {};
      return {
        id: (sn.resourceId && sn.resourceId.videoId) || sn.videoId || it.id,
        title: sn.title || "",
        thumb: th.url || sn.thumb || "",
        position: sn.position
      };
    }).filter((v) => v.id && v.title !== "Private video" && v.title !== "Deleted video");
    if (!items.length) return null;
    cacheSet(playlistId, items);
    return items;
  } catch (e) { return null; }
}
