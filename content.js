/**
 * Continuum - Your timeline never breaks
 * Seamlessly saves and restores your YouTube video progress
 */

class ContinuumTracker {
  constructor() {
    this.videoElement = null;
    this.currentVideoId = null;
    this.timestampInterval = null;
    this.isRestoringTimestamp = false;
    this.lastUrl = location.href;
    this.initialized = false;

    this.init();
  }

  /**
   * Initialize the tracker
   */
  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupVideoTracking());
    } else {
      this.setupVideoTracking();
    }

    this.setupNavigationWatcher();
  }

  /**
   * Extract video ID from YouTube URL
   * @returns {string|null} Video ID or null if not found
   */
  getVideoId() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('v');
    } catch (error) {
      console.warn('Continuum: Failed to parse video ID from URL:', error);
      return null;
    }
  }

  /**
   * Store timestamp for a video in Chrome storage
   * @param {string} videoId - YouTube video ID
   * @param {number} currentTime - Current playback time in seconds
   */
  async storeTimestamp(videoId, currentTime) {
    try {
      const timestampData = { [videoId]: Math.floor(currentTime) };
      await chrome.storage.local.set(timestampData);
    } catch (error) {
      console.error('Continuum: Failed to store timestamp:', error);
    }
  }

  /**
   * Retrieve stored timestamp for a video
   * @param {string} videoId - YouTube video ID
   * @returns {Promise<number|null>} Stored timestamp or null
   */
  async getStoredTimestamp(videoId) {
    try {
      const result = await chrome.storage.local.get([videoId]);
      return result[videoId] || null;
    } catch (error) {
      console.error('Continuum: Failed to retrieve timestamp:', error);
      return null;
    }
  }

  /**
   * Remove stored timestamp for a video
   * @param {string} videoId - YouTube video ID
   */
  async removeTimestamp(videoId) {
    try {
      await chrome.storage.local.remove([videoId]);
    } catch (error) {
      console.error('Continuum: Failed to remove timestamp:', error);
    }
  }

  /**
   * Start periodic timestamp tracking
   */
  startTimestampTracking() {
    this.stopTimestampTracking(); // Clear any existing interval

    this.timestampInterval = setInterval(async () => {
      if (this.videoElement &&
          !this.videoElement.paused &&
          !this.videoElement.ended &&
          this.currentVideoId) {
        await this.storeTimestamp(this.currentVideoId, this.videoElement.currentTime);
      }
    }, 1000); // Update every second
  }

  /**
   * Stop timestamp tracking
   */
  stopTimestampTracking() {
    if (this.timestampInterval) {
      clearInterval(this.timestampInterval);
      this.timestampInterval = null;
    }
  }

  /**
   * Initialize video element tracking for current video
   */
  async initializeVideoTracking() {
    // Find the video element (YouTube uses ytd-player as container)
    const playerContainer = document.querySelector('ytd-player');
    if (!playerContainer) {
      // YouTube loads dynamically, retry later
      setTimeout(() => this.initializeVideoTracking(), 1000);
      return;
    }

    this.videoElement = document.querySelector('video');
    if (!this.videoElement) {
      // Video element not ready yet
      setTimeout(() => this.initializeVideoTracking(), 1000);
      return;
    }

    this.currentVideoId = this.getVideoId();
    if (!this.currentVideoId) {
      // Not on a video page
      return;
    }

    console.log(`Continuum: Initialized for video ${this.currentVideoId}`);

    // Attempt to restore saved timestamp
    await this.restoreTimestamp();

    // Set up video event listeners
    this.setupVideoEventListeners();

    // Start tracking if video is already playing
    if (!this.videoElement.paused) {
      this.startTimestampTracking();
    }
  }

  /**
   * Restore saved timestamp for current video
   */
  async restoreTimestamp() {
    if (this.isRestoringTimestamp) return;

    try {
      const storedTime = await this.getStoredTimestamp(this.currentVideoId);
      if (storedTime && storedTime > 0) {
        this.isRestoringTimestamp = true;
        console.log(`Continuum: Restoring timestamp to ${storedTime}s`);

        // Wait for video to be fully ready
        setTimeout(async () => {
          try {
            this.videoElement.currentTime = storedTime;
            await this.removeTimestamp(this.currentVideoId);
            console.log('Continuum: Timestamp restored successfully');
          } catch (error) {
            console.error('Continuum: Failed to restore timestamp:', error);
          } finally {
            this.isRestoringTimestamp = false;
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Continuum: Error during timestamp restoration:', error);
      this.isRestoringTimestamp = false;
    }
  }

  /**
   * Set up event listeners for video element
   */
  setupVideoEventListeners() {
    if (!this.videoElement) return;

    this.videoElement.addEventListener('play', () => {
      console.log('Continuum: Video started playing');
      this.startTimestampTracking();
    });

    this.videoElement.addEventListener('pause', () => {
      console.log('Continuum: Video paused');
      this.stopTimestampTracking();
    });

    this.videoElement.addEventListener('ended', () => {
      console.log('Continuum: Video ended');
      this.stopTimestampTracking();
      if (this.currentVideoId) {
        this.removeTimestamp(this.currentVideoId);
      }
    });

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.stopTimestampTracking();
    });
  }

  /**
   * Handle navigation changes (YouTube SPA behavior)
   */
  handleNavigationChange() {
    const newVideoId = this.getVideoId();

    // Clean up if navigating away from current video
    if (this.currentVideoId && newVideoId !== this.currentVideoId) {
      this.stopTimestampTracking();
      this.videoElement = null;
      this.currentVideoId = null;
    }

    // Initialize tracking for new video
    if (newVideoId && newVideoId !== this.currentVideoId) {
      setTimeout(() => this.initializeVideoTracking(), 1000);
    }
  }

  /**
   * Set up watchers for YouTube navigation changes
   */
  setupNavigationWatcher() {
    // Watch for URL changes via DOM mutations (YouTube SPA)
    new MutationObserver(() => {
      const currentUrl = location.href;
      if (currentUrl !== this.lastUrl) {
        this.lastUrl = currentUrl;
        this.handleNavigationChange();
      }
    }).observe(document, { subtree: true, childList: true });

    // Watch for programmatic navigation via History API
    const originalPushState = history.pushState;
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.handleNavigationChange();
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.handleNavigationChange();
    };

    // Watch for browser back/forward buttons
    window.addEventListener('popstate', () => this.handleNavigationChange());
  }

  /**
   * Set up initial video tracking
   */
  setupVideoTracking() {
    if (this.initialized) return;
    this.initialized = true;
    this.initializeVideoTracking();
  }
}

// Initialize the Continuum tracker
new ContinuumTracker();