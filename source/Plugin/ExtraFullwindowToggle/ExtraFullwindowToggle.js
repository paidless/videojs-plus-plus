import videojs from 'video.js';
import { silencePromise } from '../../Utils/Promise';
import './ExtraFullwindowToggle.scss';

const Button = videojs.getComponent('Button');

class FullWindowToggle extends Button {

  /**
   * Create a Full window toggle button instance.
   *
   * @param     {Player} player
   *            A Video.js Player instance.
   *
   * @param     {Object} [options]
   *            An optional options object.
   */
  constructor(player, options) {
    super(player, options);

    this.updateButtonState();

    // Patches exitFullscreenHelper
    // Code from: https://github.com/paidless/videojs-yt-style/blob/7b6f1620b5c925d4a4a602df83b0b58d1b0d5843/src/js/features/fullwindow-toggle-manager.js#L11-L33
    // Ref: https://github.com/videojs/video.js/blob/9ca2e8764a2cced1efdad730b8c66c4b42a33f7f/src/js/player.js#L2976-L2992
    player.exitFullscreenHelper_ = function exitFullscreenHelper_() {
      if (this.isFullWindow) {
        return this.exitFullWindow();
      }
  
      if (this.fsApi_.requestFullscreen) {
        const promise = document[this.fsApi_.exitFullscreen]();
  
        if (promise) {
          // we're splitting the promise here, so, we want to catch the
          // potential error so that this chain doesn't have unhandled errors
          silencePromise(promise.then(function() {
            return this.isFullscreen(false);
          }));
        }
  
        return promise;
      } else if (this.tech_.supportsFullScreen() && !this.options_.preferFullWindow === true) {
        this.techCall_('exitFullScreen');
      } else {
        this.exitFullWindow();
      }
    };

    const events = ['enterFullWindow', 'exitFullWindow', 'fullscreenchange'];
    const handleFullWindowChange = (event) => {
      this.updateButtonState.call(this);

      if (!this.player_.isFullscreen()) {
        this.show();
      } else {
        this.hide();
      }

      if (event.type !== 'fullscreenchange') {
        const fullscreenToggle = this.getFullscreenToggle();
        if (fullscreenToggle) {
          fullscreenToggle.handleFullscreenChange();
        }

        player.trigger('fullwindowchange');
      }
    }

    player.on(events, handleFullWindowChange);
    player.on('dispose', () => {
      player.off(events, handleFullWindowChange);
    });
  }

  getFullscreenToggle() {
    const findComponents = this.player_.findChild('fullscreenToggle');

    if (findComponents.length > 0) {
      return findComponents[0].component;
    }
  }

  /**
   * Set button css class.
   *
   * @return    {string}
   *            Return css class.
   */
  buildCSSClass() {
    return `vjs-fullwindow-control ${super.buildCSSClass()}`;
  }

  /**
   * Button click handle.
   *
   * 
   * @param     {Object} [event]
   *            Event data.
   */
  handleClick(event) {
    if (!this.player_.isFullWindow) {
      this.player_.enterFullWindow();
    } else {
      this.player_.exitFullWindow();
    }

    this.updateButtonState();
  }

  /**
   * Button state update.
   */
  updateButtonState() {
    if (!this.player_.isFullWindow) {
      this.controlText('Fullwindow');
    } else {
      this.controlText('Exit Fullwindow');
    }
  }
}

videojs.registerComponent('FullWindowToggle', FullWindowToggle);

const controlBarChildren = videojs.getComponent('ControlBar').prototype.options_
  .children;
const fullScreenButtonIndex = controlBarChildren.indexOf('FullscreenToggle');

controlBarChildren.splice(fullScreenButtonIndex, 0, 'FullWindowToggle');
