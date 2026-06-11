const SKIP_TOLERANCE = 1.0;
const DELETE_RADIUS = 2.0;

let isProgrammaticClick = false;

function getPlayer() {
  return document.querySelector("video") || document.querySelector("audio");
}

function getTrackKey() {
  const title =
    document.querySelector(".title.ytmusic-player-bar")?.textContent?.trim() ||
    document.querySelector("ytmusic-player-bar .title")?.textContent?.trim() ||
    "unknown-title";

  const artist =
    document.querySelector(".byline.ytmusic-player-bar")?.textContent?.trim() ||
    document.querySelector("ytmusic-player-bar .byline")?.textContent?.trim() ||
    "unknown-artist";

  return `${title}::${artist}`;
}

let currentTrackKey = null;
let sessionMarkers = [];

function getCurrentTrackKey() {
  return new URL(location.href).searchParams.get("v") || getTrackKey();
}

async function getMarkers() {
  const key = getCurrentTrackKey();

  if (currentTrackKey === null) {
    currentTrackKey = key;
  }

  if (key !== currentTrackKey) {
    currentTrackKey = key;
    sessionMarkers = [];
    renderMarkerStatus(sessionMarkers);
    renderProgressMarkers();
  }

  return sessionMarkers;
}

async function saveMarkers(markers) {
  sessionMarkers = [...new Set(markers.map(t => Number(t.toFixed(2))))]
    .sort((a, b) => a - b);

  renderMarkerStatus(sessionMarkers);
  renderProgressMarkers();
}

async function addMarker() {
  const player = getPlayer();
  if (!player) {
    console.log("YTM Markers: No player found.");
    return;
  }

  const markers = await getMarkers();
  markers.push(player.currentTime);

  await saveMarkers(markers);
  console.log("YTM Markers: Added marker at", player.currentTime);
}

async function deleteNearestMarker() {
  const player = getPlayer();
  if (!player) return;

  const markers = await getMarkers();
  const current = player.currentTime;

  if (markers.length === 0) return;

  const nearest = markers
    .map(time => ({
      time,
      distance: Math.abs(time - current)
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  if (!nearest || nearest.distance > DELETE_RADIUS) {
    console.log("YTM Markers: No nearby marker to delete.");
    return;
  }

  const updated = markers.filter(time => time !== nearest.time);
  await saveMarkers(updated);

  console.log("YTM Markers: Deleted marker at", nearest.time);
}

async function markerSkipForward() {
  const player = getPlayer();
  if (!player) return nativeNext();

  const markers = await getMarkers();
  const current = player.currentTime;

  const nextMarker = markers.find(time => time > current + SKIP_TOLERANCE);

  if (nextMarker !== undefined) {
    player.currentTime = nextMarker;
    player.play();
    console.log("YTM Markers: Jumped forward to", nextMarker);
  } else {
    nativeNext();
  }
}

async function markerSkipBack() {
  const player = getPlayer();
  if (!player) return nativePrevious();

  const markers = await getMarkers();
  const current = player.currentTime;

  const previousMarker = [...markers]
    .reverse()
    .find(time => time < current - SKIP_TOLERANCE);

  if (previousMarker !== undefined) {
    player.currentTime = previousMarker;
    player.play();
    console.log("YTM Markers: Jumped back to", previousMarker);
  } else {
    nativePrevious();
  }
}

function getNextButton() {
  return document.querySelector(
    "ytmusic-player-bar .next-button, .next-button"
  );
}

function getPreviousButton() {
  return document.querySelector(
    "ytmusic-player-bar .previous-button, .previous-button"
  );
}

function nativeNext() {
  const button = getNextButton();
  if (!button) return;

  isProgrammaticClick = true;
  button.click();
  setTimeout(() => {
    isProgrammaticClick = false;
  }, 0);
}

function nativePrevious() {
  const button = getPreviousButton();
  if (!button) return;

  isProgrammaticClick = true;
  button.click();
  setTimeout(() => {
    isProgrammaticClick = false;
  }, 0);
}

function interceptSkipButtons() {
  const next = getNextButton();
  const previous = getPreviousButton();

  if (next && !next.dataset.ytmMarkersIntercepted) {
    next.dataset.ytmMarkersIntercepted = "true";

    next.addEventListener(
      "click",
      event => {
        if (isProgrammaticClick) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        markerSkipForward();
      },
      true
    );
  }

  if (previous && !previous.dataset.ytmMarkersIntercepted) {
    previous.dataset.ytmMarkersIntercepted = "true";

    previous.addEventListener(
      "click",
      event => {
        if (isProgrammaticClick) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        markerSkipBack();
      },
      true
    );
  }
}

function injectControls() {
  if (document.querySelector("#ytm-marker-controls")) return;

  const controls = document.createElement("div");
  controls.id = "ytm-marker-controls";

  controls.innerHTML = `
    <button id="ytm-add-marker" title="Add marker at current time">Add Marker [CTRL+M]</button>
    <button id="ytm-delete-marker" title="Delete nearest marker">Delete Marker [SHIFT+M]</button>
    <span id="ytm-marker-status">0 markers</span>
  `;

  document.body.appendChild(controls);

  document.querySelector("#ytm-add-marker").addEventListener("click", addMarker);
  document.querySelector("#ytm-delete-marker").addEventListener("click", deleteNearestMarker);

  updateMarkerStatus();
}

async function updateMarkerStatus() {
  const markers = await getMarkers();
  renderMarkerStatus(markers);
}

function renderMarkerStatus(markers) {
  const status = document.querySelector("#ytm-marker-status");
  if (!status) return;

  status.textContent = `${markers.length} marker${markers.length === 1 ? "" : "s"}`;
}

function getProgressBar() {
  return document.querySelector("#progress-bar") ||
         document.querySelector("tp-yt-paper-slider#progress-bar") ||
         document.querySelector("ytmusic-player-bar tp-yt-paper-slider");
}

async function renderProgressMarkers() {
  const player = getPlayer();
  const progressBar = getProgressBar();

  if (!player || !progressBar || !player.duration) return;

  let markerLayer = document.querySelector("#ytm-progress-marker-layer");

  if (!markerLayer) {
    markerLayer = document.createElement("div");
    markerLayer.id = "ytm-progress-marker-layer";
    progressBar.appendChild(markerLayer);
  }

  const markers = await getMarkers();

  markerLayer.innerHTML = "";

  for (const marker of markers) {
    if (marker < 0 || marker > player.duration) continue;

    const dot = document.createElement("div");
    dot.className = "ytm-progress-marker-dot";
    dot.style.left = `${(marker / player.duration) * 100}%`;
    dot.title = formatTime(marker);

    markerLayer.appendChild(dot);
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function setupKeyboardShortcuts() {
  if (window.ytmMarkersKeyboardSetup) return;
  window.ytmMarkersKeyboardSetup = true;

  document.addEventListener("keydown", event => {
    const target = event.target;

    if (
      target &&
      (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
    ) {
      return;
    }

    if (event.key.toLowerCase() === "m" && event.ctrlKey) {
      event.preventDefault();
      addMarker();
    }

    if (event.key.toLowerCase() === "m" && event.shiftKey) {
      event.preventDefault();
      deleteNearestMarker();
    }
  });
}

function setup() {
  injectControls();
  interceptSkipButtons();
  renderProgressMarkers();
  setupKeyboardShortcuts();
}

setInterval(setup, 1000);
setInterval(updateMarkerStatus, 3000);