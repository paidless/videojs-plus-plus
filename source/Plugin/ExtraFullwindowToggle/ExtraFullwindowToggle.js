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

    const events = ['enterFullWindow', 'exitFullWindow'];
    const handleFullWindowChange = () => {
      this.updateButtonState.call(this);
      player.trigger('fullwindowchange');
    }

    player.on(events, handleFullWindowChange);
    player.on('dispose', () => {
      player.off(events, handleFullWindowChange);
    });
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

videojs.hook('setup', vjsPlayer => {
  const fullscreenToggle = vjsPlayer.findChild('FullscreenToggle')[0].component;
  const fullWindowToggle = vjsPlayer.findChild('FullWindowToggle')[0].component;

  const handleFullAnyChange = (event) => {
    if (!vjsPlayer.isFullWindow && !vjsPlayer.isFullscreen()) {
      fullWindowToggle.show();
    } else {
      fullWindowToggle.hide();
    }
    if (event.type === 'fullwindowchange') {
      fullscreenToggle.handleFullscreenChange();
    }
  }

  const events = ['fullwindowchange', 'fullscreenchange'];

  vjsPlayer.on(events, handleFullAnyChange);
  vjsPlayer.on('dispose', () => {
    vjsPlayer.off(events, handleFullAnyChange);
  });
});
