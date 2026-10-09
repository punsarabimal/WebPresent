========================================================================
SlideCraft Studio - Media Folder
========================================================================

Place images, videos, and audio files in this directory to use within
SlideCraft Studio presentations.

Supported Media Types:
- Images: .png, .jpg, .jpeg, .webp, .svg, .gif
- Videos: .mp4, .webm
- Audio:  .mp3, .wav, .ogg, .m4a

How to Connect this Folder in SlideCraft Studio:
1. In SlideCraft Studio, click "Media" in the top toolbar or Insert menu.
2. Click "Connect Media Folder" (uses the native File System Access API
   in supported Chromium browsers like Chrome, Edge, Brave, and Opera).
3. Select this folder when prompted by the browser.
4. Once granted permission, SlideCraft Studio will read all files in this
   directory, display thumbnails and duration, and let you insert them
   directly into any slide with a single click.

Fallback for browsers without File System Access API (Safari, Firefox):
- Use the "Select Folder (webkitdirectory)" button, or use the "Upload Media
  Files" button to select individual or multiple media files directly.
- Selected media files are safely stored inside your browser's local
  IndexedDB database for offline editing and presentation.

Notes:
- Due to browser sandbox security policies, web applications cannot
  arbitrarily scan local hard drives without explicit user permission.
  The connection persists during your session and handles are preserved
  in IndexedDB when supported.
========================================================================
