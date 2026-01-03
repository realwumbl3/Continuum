<div align="center">
  <img src="icon.svg" alt="Continuum Logo" width="128" height="128" />
  <h1>Continuum</h1>
  <p><em>Seamless YouTube continuity</em></p>
</div>

## What is Continuum?

Continuum is a browser extension that seamlessly saves and restores your YouTube video progress. Never lose your place again — pick up exactly where you left off, every time you return to a video.

## Features

- **Automatic Progress Saving**: Continuously tracks your playback position as you watch
- **Seamless Restoration**: Automatically resumes playback from where you left off
- **Cross-Session Persistence**: Your progress is saved even after closing the browser
- **Lightweight & Efficient**: Minimal resource usage with smart tracking
- **Privacy-Focused**: Only stores video IDs and timestamps locally

## Installation

### From Source
1. Clone this repository:
   ```bash
   git clone https://github.com/realwumbl3/continuum/
   cd continuum
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the icons:
   ```bash
   npm run build-icons
   ```

4. Load the extension in your browser:
   - **Chrome/Edge**: Go to `chrome://extensions/`, enable "Developer mode", click "Load unpacked", and select the project folder
   - **Firefox**: Go to `about:debugging`, click "This Firefox", click "Load Temporary Add-on", and select `manifest.json`

### From Chrome Web Store
*Coming soon - stay tuned!*

## How It Works

Continuum works by:
1. **Monitoring YouTube**: Tracks video playback on all YouTube pages
2. **Saving Progress**: Stores your current timestamp every few seconds
3. **Detecting Returns**: Recognizes when you return to a previously watched video
4. **Restoring Position**: Automatically seeks to your saved position

The extension uses Chrome's storage API to persist data locally, ensuring your viewing history stays private and secure.

## Development

### Project Structure
- `content.js` - Main extension logic for tracking and restoring progress
- `manifest.json` - Extension configuration and permissions
- `build-icons.js` - Icon generation script using Sharp
- `icon.svg` - Source icon file (gradient design with continuum ring and play button)

### Building Icons
The extension includes multiple icon sizes generated from the SVG source:
```bash
npm run build-icons
```
This creates PNG icons at 16x16, 32x32, 48x48, and 128x128 pixels.

## Permissions

Continuum requires minimal permissions:
- **Storage**: To save and retrieve video timestamps
- **Host Access**: Limited to `*.youtube.com` for video tracking functionality

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## License

This project is open source. See the repository for licensing information.

---

<div align="center">
  <p>Made with ❤️ for seamless YouTube viewing</p>
  <p><a href="https://github.com/realwumbl3/continuum">GitHub</a> • <a href="https://github.com/realwumbl3/continuum/issues">Issues</a></p>
</div>