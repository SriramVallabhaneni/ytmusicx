# YouTube Music Practice Markers

A lightweight Chrome extension for **YouTube Music** that adds temporary practice markers to songs.

Instead of skipping directly to the next or previous track, the normal YouTube Music skip buttons become marker-aware. This makes it easy to practice, learn, and repeat sections of songs without manually scrubbing through the timeline.

## Features

### Marker-Aware Skip Controls

The existing YouTube Music controls are enhanced:

* **Next** skips to the next marker if one exists ahead of the current playback position.
* **Previous** skips to the previous marker if one exists behind the current playback position.
* If no marker exists in the requested direction, YouTube Music behaves normally and changes songs.

### Temporary Markers

Markers are stored only for the currently playing song and are automatically cleared when you move to a different track.

This keeps the workflow focused on active practice sessions without accumulating marker data over time.

### Progress Bar Indicators

Markers appear directly on the YouTube Music progress bar, making it easy to visualize song sections and jump points.

### Keyboard Shortcuts

| Shortcut    | Action                |
| ----------- | --------------------- |
| `CTRL +M`   | Add marker            |
| `Shift + M` | Delete nearest marker |

### Simple Interface

Only two buttons are added to the player:

* Add Marker
* Delete Marker

Everything else integrates directly into the existing YouTube Music controls.

## Installation

Currently working on releasing on the Chrome Web Store. Until then:
1. Clone or download this repository.
2. Open Chrome and navigate to:

```text
chrome://extensions
```

3. Enable **Developer Mode**.
4. Click **Load unpacked**.
5. Select the extension folder.
6. Open:

```text
https://music.youtube.com
```

The marker controls should appear above the player bar.

## Usage

### Adding Markers

Click **Add Marker** or press:

```text
CTRL + M
```

A marker is created at the current playback position.

### Deleting Markers

Click **Delete Marker** or press:

```text
Shift + M
```

The marker nearest to the current playback position will be removed.

### Navigating Markers

Use the standard YouTube Music controls:

* Next
* Previous

The extension automatically intercepts those actions and jumps between markers whenever possible.

## Example Workflow

Suppose you are learning a guitar solo.

1. Play the song.
2. Add markers at:

   * Intro
   * Verse
   * Chorus
   * Solo
3. Use the normal skip buttons to move between those sections instantly.
4. When you move to another song, all markers are automatically cleared.

## Why?

Most music players only allow skipping between tracks.

When learning music, practicing choreography, transcribing solos, studying arrangements, or repeatedly reviewing specific sections, jumping between custom markers is often much more useful than jumping between songs.

This extension provides that functionality while keeping the YouTube Music interface almost unchanged.
