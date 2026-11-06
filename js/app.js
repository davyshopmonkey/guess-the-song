(() => {
  "use strict";

  // Fragmentlengtes per poging (in seconden), net als bij Songless.
  const STEPS = [0.1, 0.5, 2, 4, 8, 16];
  const MAX = STEPS[STEPS.length - 1];
  const LS = { stats: "rhn-stats-v1", queue: "rhn-queue-v1", cache: "rhn-cache-v1", seen: "rhn-seen-help" };

  // ---------- Helpers ----------
  const $ = (id) => document.getElementById(id);
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/ø/g, "o").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
  const stripParens = (s) => s.replace(/\s*[([].*?[)\]]\s*/g, " ").replace(/\s+-\s+.*$/, "").trim();
  const artistParts = (a) => a.split(/\s*(?:&|,|\bx\b|\bfeat\.?|\bft\.?|\bwith\b)\s*/i).map(norm).filter(Boolean);
  const fmt = (n) => String(n).replace(".", ",");
  const shuffle = (arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* geen opslag */ } };
  const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  let toastTimer;
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add("hidden"), 2200);
  }

  // ---------- Data ----------
  const ALL = new Map(); // key -> song
  for (const cat of CATEGORIES) {
    cat.list = [];
    for (const line of cat.songs.split("\n")) {
      const [artist, title] = line.split(" — ").map((s) => s && s.trim());
      if (!artist || !title) continue;
      const key = norm(artist) + "|" + norm(title);
      if (!ALL.has(key)) {
        ALL.set(key, { key, artist, title, label: `${title} — ${artist}`, search: norm(`${title} ${artist}`), parts: artistParts(artist) });
      }
      cat.list.push(key);
    }
  }
  const MIX = { id: "mix", name: "Alles door elkaar", emoji: "🎲", color: "#8b5cf6", list: [...ALL.keys()] };
  const CATS = [MIX, ...CATEGORIES];
  const catById = (id) => CATS.find((c) => c.id === id);

  // ---------- Audio-bron (iTunes, met Deezer als reserve) ----------
  function jsonp(url, timeout = 8000) {
    return new Promise((resolve, reject) => {
      const cb = "__rhn" + Math.random().toString(36).slice(2);
      const s = document.createElement("script");
      const done = () => { clearTimeout(timer); delete window[cb]; s.remove(); };
      const timer = setTimeout(() => { done(); reject(new Error("timeout")); }, timeout);
      window[cb] = (data) => { done(); resolve(data); };
      s.onerror = () => { done(); reject(new Error("network")); };
      s.src = url + (url.includes("?") ? "&" : "?") + "callback=" + cb;
      document.head.appendChild(s);
    });
  }

  const BAD = ["karaoke", "instrumental", "tribute", "cover", "made famous", "originally performed", "live", "remix", "acoustic", "re recorded", "8 bit", "lullaby", "piano version"];

  function scoreCandidate(song, c) {
    const ra = norm(c.artist);
    const artistOk = song.parts.some((p) => ra.includes(p) || p.includes(ra));
    if (!artistOk) return -1;
    const nt = norm(stripParens(song.title)) || norm(song.title);
    const rt = norm(stripParens(c.title)) || norm(c.title);
    let s = 0;
    if (rt === nt) s += 6;
    else if (rt.startsWith(nt) || nt.startsWith(rt)) s += 4;
    else if (rt.includes(nt) || nt.includes(rt)) s += 2;
    else return -1;
    const ours = norm(song.title);
    const blob = norm(`${c.title} ${c.album || ""}`);
    for (const w of BAD) if (blob.includes(w) && !ours.includes(w)) s -= 3;
    return s;
  }

  function pickBest(song, candidates) {
    let best = null, bestScore = 0;
    for (const c of candidates) {
      if (!c.preview) continue;
      const sc = scoreCandidate(song, c);
      if (sc > bestScore) { best = c; bestScore = sc; }
    }
    return best;
  }

  async function fromItunes(song) {
    const term = `${song.parts[0]} ${stripParens(song.title)}`;
    const url = `https://itunes.apple.com/search?media=music&entity=song&limit=20&country=NL&term=${encodeURIComponent(term)}`;
    const data = await jsonp(url);
    const cands = (data.results || []).map((r) => ({
      artist: r.artistName, title: r.trackName, album: r.collectionName, preview: r.previewUrl,
      art: r.artworkUrl100 && r.artworkUrl100.replace("100x100bb", "300x300bb"), link: r.trackViewUrl,
    }));
    return pickBest(song, cands);
  }

  async function fromDeezer(song) {
    const q = `${song.parts[0]} ${stripParens(song.title)}`;
    const data = await jsonp(`https://api.deezer.com/search?output=jsonp&limit=20&q=${encodeURIComponent(q)}`);
    const cands = (data.data || []).map((r) => ({
      artist: r.artist && r.artist.name, title: r.title, album: r.album && r.album.title, preview: r.preview,
      art: r.album && r.album.cover_medium, link: r.link,
    }));
    return pickBest(song, cands);
  }

  async function resolvePreview(song) {
    const cache = load(LS.cache, {});
    if (cache[song.key]) return cache[song.key];
    let hit = null;
    try { hit = await fromItunes(song); } catch { /* probeer reserve */ }
    if (hit) { cache[song.key] = hit; save(LS.cache, cache); return hit; }
    try { hit = await fromDeezer(song); } catch { /* niets gevonden */ }
    return hit; // Deezer-links verlopen, dus niet cachen
  }

  // ---------- Wachtrij: geen herhalingen tot alles een keer geweest is ----------
  function nextKey(cat, exclude) {
    const queues = load(LS.queue, {});
    let q = (queues[cat.id] || []).filter((k) => ALL.has(k) && cat.list.includes(k));
    if (!q.length) q = shuffle([...cat.list]);
    let key = q.shift();
    if (exclude.has(key) && q.length) { q.push(key); key = q.shift(); }
    queues[cat.id] = q;
    save(LS.queue, queues);
    return key;
  }

  // ---------- Statistieken ----------
  const emptyStats = () => ({ played: 0, won: 0, streak: 0, best: 0, dist: [0, 0, 0, 0, 0, 0, 0] });
  function recordResult(catId, won, attempt) {
    const all = load(LS.stats, {});
    for (const id of [catId, "_total"]) {
      const s = all[id] || emptyStats();
      s.played++;
      if (won) { s.won++; s.streak++; s.best = Math.max(s.best, s.streak); s.dist[attempt]++; }
      else { s.streak = 0; s.dist[6]++; }
      all[id] = s;
    }
    save(LS.stats, all);
  }
  const getStats = (id) => load(LS.stats, {})[id] || emptyStats();

  // ---------- Audio-speler ----------
  const audio = new Audio();
  audio.preload = "auto";
  let playing = false, raf = 0, limit = 0, scale = MAX;

  function setPlayIcon(isPlaying) {
    $("icon-play").classList.toggle("hidden", isPlaying);
    $("icon-stop").classList.toggle("hidden", !isPlaying);
  }

  function tick() {
    const t = audio.currentTime;
    $("bar-progress").style.width = Math.min(100, (t / scale) * 100) + "%";
    $("time-now").textContent = "0:" + String(Math.floor(t)).padStart(2, "0");
    if (t >= limit || audio.ended) { stop(); return; }
    raf = requestAnimationFrame(tick);
  }

  function play(seconds) {
    if (!audio.src) return;
    limit = seconds;
    audio.currentTime = 0;
    const p = audio.play();
    if (p && p.catch) p.catch(() => { stop(); toast("Afspelen lukt niet, probeer opnieuw"); });
    playing = true;
    setPlayIcon(true);
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    audio.pause();
    playing = false;
    cancelAnimationFrame(raf);
    setPlayIcon(false);
    setTimeout(() => { if (!playing) { $("bar-progress").style.width = "0"; $("time-now").textContent = "0:00"; } }, 350);
  }

  // ---------- Spelstatus ----------
  const state = { cat: null, song: null, meta: null, guesses: [], over: false, loadId: 0, recent: new Set() };
  const attempt = () => state.guesses.length;

  async function newRound() {
    stop();
    const id = ++state.loadId;
    Object.assign(state, { song: null, meta: null, guesses: [], over: false });
    $("result").classList.add("hidden");
    $("guess-area").classList.remove("hidden");
    $("guess-input").value = "";
    hideSuggestions();
    $("btn-play").disabled = true;
    $("player").classList.add("loading");
    $("status").textContent = "Nummer laden…";
    $("time-end").textContent = "0:16";
    audio.removeAttribute("src");
    renderGame();

    for (let tries = 0; tries < 8; tries++) {
      const key = nextKey(state.cat, state.recent);
      const song = ALL.get(key);
      const meta = await resolvePreview(song);
      if (id !== state.loadId) return; // gebruiker is al verder
      if (!meta) continue;
      state.song = song;
      state.meta = meta;
      state.recent.add(key);
      if (state.recent.size > 20) state.recent.delete(state.recent.values().next().value);
      audio.src = meta.preview;
      audio.load();
      const ready = () => {
        if (id !== state.loadId) return;
        $("player").classList.remove("loading");
        $("btn-play").disabled = false;
        renderGame();
      };
      audio.addEventListener("canplay", ready, { once: true });
      setTimeout(ready, 2500); // iOS laadt pas na een tik
      return;
    }
    $("player").classList.remove("loading");
    $("status").textContent = "Kon geen fragmenten laden. Check je internetverbinding.";
    const retry = document.createElement("button");
    retry.className = "btn ghost";
    retry.textContent = "Opnieuw proberen";
    retry.onclick = newRound;
    $("status").append(" ", retry);
  }

  function renderGame() {
    const cat = state.cat;
    $("game-cat").textContent = `${cat.emoji} ${cat.name}`;
    const s = getStats(cat.id);
    $("game-streak").textContent = s.streak ? `🔥 Reeks: ${s.streak}` : (s.played ? `${s.won}/${s.played} geraden` : "");

    // Pogingen
    const ol = $("guesses");
    ol.innerHTML = "";
    const icons = { skip: "⏭️", wrong: "❌", near: "🟨", correct: "✅" };
    for (let i = 0; i < STEPS.length; i++) {
      const li = document.createElement("li");
      const g = state.guesses[i];
      if (g) {
        li.className = g.type;
        li.innerHTML = `<span class="ico">${icons[g.type]}</span><span>${g.type === "skip" ? "Overgeslagen" : escapeHtml(g.label)}</span>`;
      } else if (i === attempt() && !state.over) {
        li.className = "current";
      }
      ol.appendChild(li);
    }

    // Balk
    const unlocked = state.over ? MAX : STEPS[Math.min(attempt(), STEPS.length - 1)];
    $("bar-unlocked").style.width = (unlocked / MAX) * 100 + "%";

    if (!state.over && state.song) {
      $("status").textContent = `Fragment: ${fmt(STEPS[attempt()])} ${STEPS[attempt()] === 1 ? "seconde" : "seconden"}`;
      const a = attempt();
      $("btn-skip").textContent = a < STEPS.length - 1 ? `Overslaan (+${fmt(+(STEPS[a + 1] - STEPS[a]).toFixed(1))}s)` : "Opgeven";
    }
  }

  function guess(song) {
    if (state.over || !state.song) return;
    if (state.guesses.some((g) => g.key === song.key)) { toast("Die heb je al geprobeerd"); return; }
    let type = "wrong";
    if (song.key === state.song.key) type = "correct";
    else if (song.parts.some((p) => state.song.parts.includes(p))) type = "near";
    state.guesses.push({ type, key: song.key, label: song.label });
    $("guess-input").value = "";
    hideSuggestions();
    if (type === "correct") return finish(true);
    if (type === "near") toast("Goede artiest, ander nummer!");
    if (attempt() >= STEPS.length) return finish(false);
    renderGame();
  }

  function skip() {
    if (state.over || !state.song) return;
    state.guesses.push({ type: "skip" });
    if (attempt() >= STEPS.length) return finish(false);
    renderGame();
    play(STEPS[attempt()]); // laat direct het langere fragment horen
  }

  function finish(won) {
    stop();
    state.over = true;
    state.won = won;
    recordResult(state.cat.id, won, attempt() - 1);
    renderGame();
    $("guess-area").classList.add("hidden");
    const titles = ["Wauw! 🤯", "Geweldig! 🔥", "Top! 🎉", "Goed zo! 👏", "Net op tijd! 😅", "Op het nippertje! 😮‍💨"];
    $("result-title").textContent = won ? titles[attempt() - 1] : "Helaas! 😢";
    const { song, meta } = state;
    $("result-song").textContent = song.title;
    $("result-artist").textContent = song.artist;
    $("result-art").style.visibility = meta.art ? "visible" : "hidden";
    $("result-art").src = meta.art || "";
    const q = encodeURIComponent(`${song.artist} ${song.title}`);
    $("link-spotify").href = `https://open.spotify.com/search/${q}`;
    $("link-apple").href = meta.link && meta.link.includes("apple.com") ? meta.link : `https://music.apple.com/nl/search?term=${q}`;
    $("link-youtube").href = `https://www.youtube.com/results?search_query=${q}`;
    $("result-squares").textContent = squares();
    $("status").textContent = "Druk op play om het hele fragment te horen";
    $("result").classList.remove("hidden");
    $("btn-next").focus();
  }

  function squares() {
    const map = { skip: "⬛", wrong: "🟥", near: "🟨", correct: "🟩" };
    return STEPS.map((_, i) => (state.guesses[i] ? map[state.guesses[i].type] : "⬜")).join("");
  }

  async function share() {
    const text = `🎵 Raad het Nummer — ${state.cat.name}\n${state.won ? `Geraden in ${fmt(STEPS[attempt() - 1])}s!` : "Niet geraden…"}\n🔊${squares()}\n${location.href}`;
    try {
      if (navigator.share && matchMedia("(pointer: coarse)").matches) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); toast("Gekopieerd naar klembord!"); }
    } catch { /* geannuleerd */ }
  }

  // ---------- Zoeken / autocomplete ----------
  let matches = [], active = -1;

  function search(qRaw) {
    const q = norm(qRaw);
    if (!q) return [];
    const words = q.split(" ");
    const res = [];
    for (const s of ALL.values()) {
      if (!words.every((w) => s.search.includes(w))) continue;
      const t = norm(s.title);
      const rank = t.startsWith(q) ? 0 : s.search.includes(q) ? 1 : 2;
      res.push([rank, s]);
    }
    return res.sort((a, b) => a[0] - b[0] || a[1].title.localeCompare(b[1].title)).slice(0, 8).map((r) => r[1]);
  }

  function showSuggestions() {
    const ul = $("suggestions");
    matches = search($("guess-input").value);
    active = matches.length ? 0 : -1;
    if (!matches.length) { hideSuggestions(); return; }
    ul.innerHTML = matches.map((s, i) =>
      `<li role="option" data-i="${i}" class="${i === active ? "active" : ""}">${escapeHtml(s.title)} <small>— ${escapeHtml(s.artist)}</small></li>`).join("");
    ul.classList.remove("hidden");
  }
  function hideSuggestions() { $("suggestions").classList.add("hidden"); matches = []; active = -1; }
  function setActive(i) {
    active = (i + matches.length) % matches.length;
    [...$("suggestions").children].forEach((li, j) => li.classList.toggle("active", j === active));
    $("suggestions").children[active].scrollIntoView({ block: "nearest" });
  }

  function submit() {
    const val = $("guess-input").value;
    const exact = [...ALL.values()].find((s) => norm(s.label) === norm(val));
    const pick = exact || (active >= 0 && matches[active]);
    if (pick) guess(pick);
    else if (val.trim()) toast("Kies een nummer uit de lijst");
    else toast("Typ een titel of artiest");
  }

  // ---------- Schermen ----------
  function renderHome() {
    $("cat-grid").innerHTML = CATS.map((c) => {
      const s = getStats(c.id);
      const meta = s.played ? `${s.won}/${s.played} geraden${s.streak ? ` · 🔥${s.streak}` : ""}` : `${c.list.length} nummers`;
      return `<button class="cat ${c.id === "mix" ? "all" : ""}" style="--c:${c.color}" data-id="${c.id}">
        <span class="emoji">${c.emoji}</span><span class="name">${c.name}</span><span class="meta">${meta}</span></button>`;
    }).join("");
  }

  function route() {
    const id = location.hash.replace(/^#\/?/, "");
    const cat = catById(id);
    if (cat) {
      $("screen-home").classList.add("hidden");
      $("screen-game").classList.remove("hidden");
      if (state.cat !== cat) { state.cat = cat; newRound(); }
    } else {
      stop();
      state.cat = null;
      state.loadId++;
      renderHome();
      $("screen-game").classList.add("hidden");
      $("screen-home").classList.remove("hidden");
    }
    window.scrollTo(0, 0);
  }

  function renderStats() {
    const sel = $("stats-cat");
    const s = getStats(sel.value);
    const pct = s.played ? Math.round((s.won / s.played) * 100) : 0;
    $("stat-row").innerHTML = [[s.played, "Gespeeld"], [pct + "%", "Geraden"], [s.streak, "Reeks"], [s.best, "Beste reeks"]]
      .map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join("");
    const max = Math.max(1, ...s.dist);
    const labels = ["1", "2", "3", "4", "5", "6", "✕"];
    $("dist").innerHTML = s.dist.map((n, i) =>
      `<div class="dist-row ${i === 6 ? "miss" : ""}"><span>${labels[i]}</span><div class="dist-bar" style="width:${Math.max(8, (n / max) * 100)}%">${n}</div></div>`).join("");
  }

  // ---------- Events ----------
  $("cat-grid").addEventListener("click", (e) => {
    const b = e.target.closest(".cat");
    if (b) location.hash = "#/" + b.dataset.id;
  });
  $("btn-home").onclick = $("logo").onclick = () => { location.hash = ""; };
  $("btn-play").onclick = () => {
    if (playing) return stop();
    if (state.over) { scale = audio.duration || 30; play(scale); }
    else { scale = MAX; play(STEPS[attempt()]); }
    $("time-end").textContent = "0:" + String(Math.round(scale)).padStart(2, "0");
  };
  $("btn-skip").onclick = skip;
  $("btn-submit").onclick = submit;
  $("btn-next").onclick = newRound;
  $("btn-share").onclick = share;

  const input = $("guess-input");
  input.addEventListener("input", showSuggestions);
  input.addEventListener("focus", () => input.value && showSuggestions());
  input.addEventListener("blur", () => setTimeout(hideSuggestions, 150));
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" && matches.length) { e.preventDefault(); setActive(active + 1); }
    else if (e.key === "ArrowUp" && matches.length) { e.preventDefault(); setActive(active - 1); }
    else if (e.key === "Enter") { e.preventDefault(); submit(); }
    else if (e.key === "Escape") hideSuggestions();
  });
  $("suggestions").addEventListener("mousedown", (e) => {
    const li = e.target.closest("li");
    if (li) { e.preventDefault(); guess(matches[+li.dataset.i]); }
  });

  document.addEventListener("keydown", (e) => {
    if (e.code !== "Space" || document.activeElement === input || state.cat === null) return;
    if (document.querySelector("dialog[open]")) return;
    e.preventDefault();
    if (!$("btn-play").disabled) $("btn-play").click();
  });

  $("btn-help").onclick = () => $("dlg-help").showModal();
  $("btn-stats").onclick = () => {
    const sel = $("stats-cat");
    sel.innerHTML = `<option value="_total">Alle categorieën</option>` + CATS.map((c) => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join("");
    sel.value = state.cat ? state.cat.id : "_total";
    renderStats();
    $("dlg-stats").showModal();
  };
  $("stats-cat").onchange = renderStats;
  $("btn-reset").onclick = () => {
    if (!confirm("Alle statistieken wissen?")) return;
    save(LS.stats, {});
    renderStats();
    if (state.cat) renderGame(); else renderHome();
  };

  // Ticks op de balk bij elke stap
  $("bar-ticks").innerHTML = STEPS.slice(0, -1).map((s) => `<span style="left:${(s / MAX) * 100}%"></span>`).join("");

  window.addEventListener("hashchange", route);
  route();
  if (!localStorage.getItem(LS.seen)) { save(LS.seen, 1); $("dlg-help").showModal(); }
})();
