// Shared "live highlights" feed — sample entries; replace with real clips.
// Add new entries anywhere; pages sort by date (newest first) at render time.
// category: "live" (weddings/concerts/festivals) or "corporate" (company events).
window.FLAIR_VIDEOS = [
  { title: "Yashraaj LIVE — Concert Highlights", ip: "Yashraaj LIVE", artist: "Yashraaj Kapil", category: "live", date: "2026-06-20", duration: "4:12" },
  { title: "Sufiyat with Yashraaj — Sufi Night (Wedding)", ip: "Sufiyat with Yashraaj", artist: "Yashraaj Kapil", category: "live", date: "2026-05-18", duration: "5:30" },
  { title: "Sufiyat with Yashraaj — Corporate Gala", ip: "Sufiyat with Yashraaj", artist: "Yashraaj Kapil", category: "corporate", date: "2026-04-26", duration: "4:40" },
  { title: "Sufiyat with Yashraaj — Qawwali Segment", ip: "Sufiyat with Yashraaj", artist: "Yashraaj Kapil", category: "live", date: "2026-02-10", duration: "7:14" },
  { title: "Sufiyat with Yashraaj — Annual Day Set", ip: "Sufiyat with Yashraaj", artist: "Yashraaj Kapil", category: "corporate", date: "2026-01-30", duration: "5:02" },
  { title: "Tanush — Sangeet Set", ip: "Tanush", artist: "Yashraaj Kapil", category: "live", date: "2026-05-02", duration: "3:48" },
  { title: "Tanush — Corporate Offsite", ip: "Tanush", artist: "Yashraaj Kapil", category: "corporate", date: "2026-03-15", duration: "4:18" },
  { title: "Tanush — Reception Reel", ip: "Tanush", artist: "Yashraaj Kapil", category: "live", date: "2026-02-28", duration: "3:20" },
  { title: "Tanush — Product Launch Night", ip: "Tanush", artist: "Yashraaj Kapil", category: "corporate", date: "2026-01-12", duration: "3:55" },
  { title: "Vibez Unplugged — Sundowner Session", ip: "Vibez Unplugged", artist: "Yashraaj Kapil", category: "live", date: "2026-04-14", duration: "4:55" },
  { title: "Yashraaj LIVE — Festival Encore", ip: "Yashraaj LIVE", artist: "Yashraaj Kapil", category: "live", date: "2026-03-22", duration: "2:58" },
  { title: "Vibez Unplugged — Ghazal Moment", ip: "Vibez Unplugged", artist: "Yashraaj Kapil", category: "live", date: "2026-01-19", duration: "4:02" },
  { title: "Gujarati Garba — Navratri Opening", ip: "Gujarati Garba", artist: "Yashraaj Kapil", category: "live", date: "2025-10-03", duration: "6:05" },
  { title: "Gujarati Garba — Raas Finale", ip: "Gujarati Garba", artist: "Yashraaj Kapil", category: "live", date: "2025-10-11", duration: "5:40" }
];

window.FLAIR_DATE_LABEL = function (iso) {
  const m = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const [y, mo, d] = iso.split("-");
  return m[+mo - 1] + " " + (+d) + " '" + y.slice(2);
};
