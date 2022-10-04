import videojs from 'video.js';

const ClickableComponent = videojs.getComponent('ClickableComponent');

/**
 * Displays the live indicator when duration is Infinity.
 * 
 * https://github.com/videojs/video.js/blob/eb8f802391392406ad9801a76934aa7a98dd1bdb/src/js/control-bar/seek-to-live.js
 *
 * @extends Component
 */
class LiveNotice extends ClickableComponent {

  /**
   * Creates an instance of this class.
   * 
   * https://github.com/videojs/video.js/blob/eb8f802391392406ad9801a76934aa7a98dd1bdb/src/js/control-bar/seek-to-live.js#L15-L33
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
  constructor(player, options) {
    super(player, options);

    this.updateLiveEdgeStatus();

    if (this.player_.liveTracker) {
      this.updateLiveEdgeStatusHandler_ = (e) => this.updateLiveEdgeStatus(e);
      this.on(this.player_.liveTracker, 'liveedgechange', this.updateLiveEdgeStatusHandler_);
    }
  }

  /**
   * Create the `Component`'s DOM element
   *
   * @return {Element}
   *         The element that was created.
   */
  createEl() {
    const el = videojs.dom.createEl('div', {
      className: 'vjs-live-notice',
      innerHTML: `
        <div class="vjs-live-notice-spot vjs-icon-circle"></div>
        Live
      `
    });

    return el;
  }

  /**
   * Update the state of this button if we are at the live edge
   * or not
   * 
   * https://github.com/videojs/video.js/blob/eb8f802391392406ad9801a76934aa7a98dd1bdb/src/js/control-bar/seek-to-live.js#L57-L72
   */
  updateLiveEdgeStatus() {
    // default to live edge
    if (!this.player_.liveTracker || this.player_.liveTracker.atLiveEdge()) {
      this.setAttribute('aria-disabled', true);
      this.addClass('vjs-at-live-edge');
    } else {
      this.setAttribute('aria-disabled', false);
      this.removeClass('vjs-at-live-edge');
    }
  }

  /**
   * On click bring us as near to the live point as possible.
   * This requires that we wait for the next `live-seekable-change`
   * event which will happen every segment length seconds.
   * 
   * https://github.com/videojs/video.js/blob/eb8f802391392406ad9801a76934aa7a98dd1bdb/src/js/control-bar/seek-to-live.js#L74-L81
   */
  handleClick() {
    this.player_.liveTracker.seekToLiveEdge();
  }

  /**
   * Dispose of the element and stop tracking
   * 
   * https://github.com/videojs/video.js/blob/eb8f802391392406ad9801a76934aa7a98dd1bdb/src/js/control-bar/seek-to-live.js#L83-L94
   */
  dispose() {
    if (this.player_.liveTracker) {
      this.off(this.player_.liveTracker, 'liveedgechange', this.updateLiveEdgeStatusHandler_);
    }
    this.textEl_ = null;

    super.dispose();
  }
}

videojs.registerComponent('LiveNotice', LiveNotice);

export default LiveNotice;
