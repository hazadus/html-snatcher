const tracks = [
  {
    url: "https://storage.yandexcloud.net/snatcher/Swamp81020715.mp3",
    name: "Swamp81020715",
  },
  {
    url: "https://storage.yandexcloud.net/snatcher/Swamp81160715.mp3",
    name: "Swamp81160715",
  },
  {
    url: "https://storage.yandexcloud.net/snatcher/RA483_150831_Sassy-J-residentadvisor.net.mp3",
    name: "RA483 Sassy-J",
  },
  {
    url: "https://storage.yandexcloud.net/snatcher/Soulful_Smooth_Jazzy_Deep_House_Vinyl_Studio_Session_with_Noah_Coinflip.mp3",
    name: "Soulful Smooth Jazzy Deep House",
  },
  {
    url: "https://storage.yandexcloud.net/snatcher/Jazzy_Soulful_Deep_House_Mix_-_Vinyl_Studio_Session_with_Noah_Coinflip.mp3",
    name: "Jazzy Soulful Deep House Mix",
  },
];

let currentTrackIndex = -1;
let isPlaying = false;
let cuePoints = {};
let trackPositions = {};

const audio = new Audio();
const playPauseBtn = document.getElementById("playPauseBtn");
const cueBtn = document.getElementById("cueBtn");
const progressBar = document.getElementById("progressBar");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const trackListEl = document.getElementById("trackList");
const cueListEl = document.getElementById("cueList");
const currentTrackNameEl = document.getElementById("currentTrackName");

// Load saved data
function loadSavedData() {
  const savedCuePoints = localStorage.getItem("cuePoints");
  const savedPositions = localStorage.getItem("trackPositions");

  if (savedCuePoints) {
    try {
      cuePoints = JSON.parse(savedCuePoints);
    } catch (e) {
      cuePoints = {};
    }
  }

  if (savedPositions) {
    try {
      trackPositions = JSON.parse(savedPositions);
    } catch (e) {
      trackPositions = {};
    }
  }
}

// Save data to localStorage
function saveData() {
  localStorage.setItem("cuePoints", JSON.stringify(cuePoints));
  localStorage.setItem("trackPositions", JSON.stringify(trackPositions));
}

// Format time
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Create track list
function createTrackList() {
  tracks.forEach((track, index) => {
    const trackItem = document.createElement("div");
    trackItem.className = "track-item";
    trackItem.innerHTML = `<div class="track-name">${track.name}</div>`;
    trackItem.addEventListener("click", () => loadTrack(index));
    trackListEl.appendChild(trackItem);
  });
}

// Load track
function loadTrack(index) {
  // Save current track position
  if (currentTrackIndex !== -1 && !isNaN(audio.currentTime)) {
    trackPositions[currentTrackIndex] = audio.currentTime;
    saveData();
  }

  // Update UI
  document.querySelectorAll(".track-item").forEach((item, i) => {
    item.classList.toggle("active", i === index);
  });

  currentTrackIndex = index;
  currentTrackNameEl.textContent = tracks[index].name;

  // Load new track
  audio.src = tracks[index].url;

  // Restore saved position
  if (trackPositions[index]) {
    audio.currentTime = trackPositions[index];
  }

  // Update cue points display
  updateCuePointsDisplay();

  // Auto play if was playing
  if (isPlaying) {
    audio.play();
  }
}

// Play/Pause
function togglePlayPause() {
  if (currentTrackIndex === -1) {
    loadTrack(0);
  }

  if (isPlaying) {
    audio.pause();
    playPauseBtn.textContent = "▶️ Play";
  } else {
    audio.play();
    playPauseBtn.textContent = "⏸️ Pause";
  }
  isPlaying = !isPlaying;
}

// Add cue point
function addCuePoint() {
  if (currentTrackIndex === -1 || isNaN(audio.currentTime)) return;

  const trackKey = currentTrackIndex.toString();
  if (!cuePoints[trackKey]) {
    cuePoints[trackKey] = [];
  }

  const cueTime = audio.currentTime;
  cuePoints[trackKey].push(cueTime);
  cuePoints[trackKey].sort((a, b) => a - b);

  saveData();
  updateCuePointsDisplay();
}

// Update cue points display
function updateCuePointsDisplay() {
  const trackKey = currentTrackIndex.toString();
  const trackCues = cuePoints[trackKey] || [];

  if (trackCues.length === 0) {
    cueListEl.innerHTML =
      '<span class="no-cues">Нет сохраненных cue-точек</span>';
  } else {
    cueListEl.innerHTML = "";
    trackCues.forEach((cue, index) => {
      const cueItem = document.createElement("div");
      cueItem.className = "cue-item";
      cueItem.innerHTML = `
                        <span onclick="jumpToCue(${index})">${formatTime(
        cue
      )}</span>
                        <button class="cue-delete" onclick="deleteCue(${index})">×</button>
                    `;
      cueListEl.appendChild(cueItem);
    });
  }
}

// Jump to cue point
window.jumpToCue = function (index) {
  const trackKey = currentTrackIndex.toString();
  const trackCues = cuePoints[trackKey] || [];
  if (trackCues[index] !== undefined) {
    audio.currentTime = trackCues[index];
    if (!isPlaying) {
      togglePlayPause();
    }
  }
};

// Delete cue point
window.deleteCue = function (index) {
  const trackKey = currentTrackIndex.toString();
  if (cuePoints[trackKey]) {
    cuePoints[trackKey].splice(index, 1);
    if (cuePoints[trackKey].length === 0) {
      delete cuePoints[trackKey];
    }
    saveData();
    updateCuePointsDisplay();
  }
};

// Update progress
audio.addEventListener("timeupdate", () => {
  if (!isNaN(audio.duration)) {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = progressPercent + "%";
    currentTimeEl.textContent = formatTime(audio.currentTime);
  }
});

// Update duration
audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});

// Progress bar click
progressBar.addEventListener("click", (e) => {
  if (!isNaN(audio.duration)) {
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
  }
});

// Event listeners
playPauseBtn.addEventListener("click", togglePlayPause);
cueBtn.addEventListener("click", addCuePoint);

// Save position on pause
audio.addEventListener("pause", () => {
  if (currentTrackIndex !== -1 && !isNaN(audio.currentTime)) {
    trackPositions[currentTrackIndex] = audio.currentTime;
    saveData();
  }
});

// Track ended
audio.addEventListener("ended", () => {
  isPlaying = false;
  playPauseBtn.textContent = "▶️ Play";
  trackPositions[currentTrackIndex] = 0;
  saveData();
});

// Initialize
loadSavedData();
createTrackList();
