const tracks = [
    { title: "Midnight Dreams", artist: "Luna Wave", emoji: "🌙", gradient: "linear-gradient(135deg, #0f0c29, #302b63)", duration: 234, freq: 440 },
    { title: "Summer Breeze", artist: "Tropical Keys", emoji: "🌴", gradient: "linear-gradient(135deg, #f093fb, #f5576c)", duration: 198, freq: 523 },
    { title: "Neon City", artist: "Synth Rider", emoji: "🌃", gradient: "linear-gradient(135deg, #4facfe, #00f2fe)", duration: 267, freq: 392 },
    { title: "Ocean Waves", artist: "Calm Horizons", emoji: "🌊", gradient: "linear-gradient(135deg, #667eea, #764ba2)", duration: 312, freq: 349 },
    { title: "Electric Soul", artist: "Voltage Beat", emoji: "⚡", gradient: "linear-gradient(135deg, #f7971e, #ffd200)", duration: 185, freq: 587 },
    { title: "Starlight", artist: "Cosmos", emoji: "⭐", gradient: "linear-gradient(135deg, #a18cd1, #fbc2eb)", duration: 243, freq: 659 },
    { title: "Deep Forest", artist: "Nature Sounds", emoji: "🌲", gradient: "linear-gradient(135deg, #134e5e, #71b280)", duration: 276, freq: 294 },
    { title: "Urban Flow", artist: "Metro Beats", emoji: "🏙️", gradient: "linear-gradient(135deg, #373b44, #4286f4)", duration: 221, freq: 494 },
    { title: "Velvet Night", artist: "Smooth Jazz Trio", emoji: "🎷", gradient: "linear-gradient(135deg, #2c3e50, #4ca1af)", duration: 298, freq: 370 },
    { title: "Crystal Cave", artist: "Ambient Echo", emoji: "💎", gradient: "linear-gradient(135deg, #ee9ca7, #ffdde1)", duration: 342, freq: 554 },
    { title: "Solar Flare", artist: "Astro Beat", emoji: "☀️", gradient: "linear-gradient(135deg, #fa709a, #fee140)", duration: 205, freq: 622 },
    { title: "Rainy Day", artist: "Lo-Fi Cafe", emoji: "🌧️", gradient: "linear-gradient(135deg, #4b6cb7, #182848)", duration: 254, freq: 330 }
];

const albumArt = document.getElementById("albumArt");
const albumEmoji = document.getElementById("albumEmoji");
const songTitle = document.getElementById("songTitle");
const songArtist = document.getElementById("songArtist");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");
const progressThumb = document.getElementById("progressThumb");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");
const volumeSlider = document.getElementById("volumeSlider");
const playlistEl = document.getElementById("playlist");
const trackCount = document.getElementById("trackCount");
const visualizer = document.getElementById("visualizer");

let currentTrack = 0;
let isPlaying = false;
let progress = 0;
let interval = null;
let shuffle = false;
let repeat = false;
let audioCtx = null;
let oscillator = null;
let gainNode = null;

function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
}

function initVisualizer() {
    visualizer.innerHTML = "";
    for (let i = 0; i < 16; i++) {
        const bar = document.createElement("div");
        bar.className = "viz-bar";
        bar.style.height = "3px";
        visualizer.appendChild(bar);
    }
}

function animateVisualizer() {
    if (!isPlaying) {
        visualizer.querySelectorAll(".viz-bar").forEach(b => b.style.height = "3px");
        return;
    }
    visualizer.querySelectorAll(".viz-bar").forEach(b => {
        b.style.height = `${Math.random() * 30 + 5}px`;
    });
    requestAnimationFrame(() => setTimeout(animateVisualizer, 100));
}

function playTone(freq) {
    stopTone();
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.value = freq;
    oscillator.type = "sine";
    gainNode.gain.value = (volumeSlider.value / 100) * 0.15;
    oscillator.start();
}

function stopTone() {
    if (oscillator) {
        oscillator.stop();
        oscillator = null;
    }
    if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
    }
}

function loadTrack(idx) {
    currentTrack = idx;
    const track = tracks[idx];
    albumEmoji.textContent = track.emoji;
    albumArt.style.background = track.gradient;
    songTitle.textContent = track.title;
    songArtist.textContent = track.artist;
    totalTimeEl.textContent = formatTime(track.duration);
    progress = 0;
    updateProgress();
    renderPlaylist();

    if (isPlaying) playTone(track.freq);
}

function togglePlay() {
    isPlaying = !isPlaying;
    playBtn.textContent = isPlaying ? "⏸" : "▶";
    albumArt.classList.toggle("playing", isPlaying);

    if (isPlaying) {
        playTone(tracks[currentTrack].freq);
        animateVisualizer();
        interval = setInterval(() => {
            progress++;
            if (progress >= tracks[currentTrack].duration) {
                nextTrack();
                return;
            }
            updateProgress();
        }, 1000);
    } else {
        stopTone();
        clearInterval(interval);
    }
}

function updateProgress() {
    const track = tracks[currentTrack];
    const pct = (progress / track.duration) * 100;
    progressFill.style.width = pct + "%";
    progressThumb.style.left = pct + "%";
    currentTimeEl.textContent = formatTime(progress);
}

function nextTrack() {
    clearInterval(interval);
    stopTone();
    let next;
    if (shuffle) {
        next = Math.floor(Math.random() * tracks.length);
    } else {
        next = (currentTrack + 1) % tracks.length;
    }
    loadTrack(next);
    if (isPlaying) {
        playTone(tracks[next].freq);
        animateVisualizer();
        interval = setInterval(() => {
            progress++;
            if (progress >= tracks[currentTrack].duration) {
                if (repeat) {
                    progress = 0;
                } else {
                    nextTrack();
                }
                return;
            }
            updateProgress();
        }, 1000);
    }
}

function prevTrack() {
    clearInterval(interval);
    stopTone();
    if (progress > 3) {
        progress = 0;
        updateProgress();
        if (isPlaying) playTone(tracks[currentTrack].freq);
        return;
    }
    const prev = (currentTrack - 1 + tracks.length) % tracks.length;
    loadTrack(prev);
    if (isPlaying) {
        playTone(tracks[prev].freq);
        animateVisualizer();
        interval = setInterval(() => {
            progress++;
            if (progress >= tracks[currentTrack].duration) { nextTrack(); return; }
            updateProgress();
        }, 1000);
    }
}

function renderPlaylist() {
    playlistEl.innerHTML = tracks.map((t, i) => `
        <div class="track-item ${i === currentTrack ? 'active' : ''}" data-idx="${i}">
            <span class="track-num">${i === currentTrack && isPlaying ? '♪' : i + 1}</span>
            <div class="track-art" style="background:${t.gradient}">${t.emoji}</div>
            <div class="track-details">
                <div class="track-name">${t.title}</div>
                <div class="track-artist">${t.artist}</div>
            </div>
            <span class="track-duration">${formatTime(t.duration)}</span>
        </div>
    `).join("");

    playlistEl.querySelectorAll(".track-item").forEach(item => {
        item.addEventListener("click", () => {
            const idx = parseInt(item.dataset.idx);
            clearInterval(interval);
            stopTone();
            loadTrack(idx);
            isPlaying = true;
            playBtn.textContent = "⏸";
            albumArt.classList.add("playing");
            playTone(tracks[idx].freq);
            animateVisualizer();
            interval = setInterval(() => {
                progress++;
                if (progress >= tracks[currentTrack].duration) { nextTrack(); return; }
                updateProgress();
            }, 1000);
        });
    });

    trackCount.textContent = `${tracks.length} tracks`;
}

progressBar.addEventListener("click", (e) => {
    const rect = progressBar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    progress = Math.floor(pct * tracks[currentTrack].duration);
    updateProgress();
});

volumeSlider.addEventListener("input", () => {
    if (gainNode) {
        gainNode.gain.value = (volumeSlider.value / 100) * 0.15;
    }
});

playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextTrack);
prevBtn.addEventListener("click", prevTrack);
shuffleBtn.addEventListener("click", () => {
    shuffle = !shuffle;
    shuffleBtn.classList.toggle("active", shuffle);
});
repeatBtn.addEventListener("click", () => {
    repeat = !repeat;
    repeatBtn.classList.toggle("active", repeat);
});

initVisualizer();
loadTrack(0);
renderPlaylist();
