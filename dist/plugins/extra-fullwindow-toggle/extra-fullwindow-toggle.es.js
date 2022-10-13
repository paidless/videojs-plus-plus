/* eslint-disable */
/* VERSION: 1.7.7 */
import videojs from 'video.js';

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

/**
 * Returns whether an object is `Promise`-like (i.e. has a `then` method).
 *
 * @param  {Object}  value
 *         An object that may or may not be `Promise`-like.
 *
 * @return {boolean}
 *         Whether or not the object is `Promise`-like.
 */
function isPromise(value) {
  return value !== undefined && value !== null && typeof value.then === 'function';
}
/**
 * Silence a Promise-like object.
 *
 * This is useful for avoiding non-harmful, but potentially confusing "uncaught
 * play promise" rejection error messages.
 *
 * @param  {Object} value
 *         An object that may or may not be `Promise`-like.
 */

function silencePromise(value) {
  if (isPromise(value)) {
    value.then(null, function (e) {});
  }
}

var Button = videojs.getComponent('Button');

var FullWindowToggle = /*#__PURE__*/function (_Button) {
  _inheritsLoose(FullWindowToggle, _Button);

  /**
   * Create a Full window toggle button instance.
   *
   * @param     {Player} player
   *            A Video.js Player instance.
   *
   * @param     {Object} [options]
   *            An optional options object.
   */
  function FullWindowToggle(player, options) {
    var _this;

    _this = _Button.call(this, player, options) || this;

    _this.updateButtonState(); // Patches exitFullscreenHelper
    // Code from: https://github.com/paidless/videojs-yt-style/blob/7b6f1620b5c925d4a4a602df83b0b58d1b0d5843/src/js/features/fullwindow-toggle-manager.js#L11-L33
    // Ref: https://github.com/videojs/video.js/blob/9ca2e8764a2cced1efdad730b8c66c4b42a33f7f/src/js/player.js#L2976-L2992


    player.exitFullscreenHelper_ = function exitFullscreenHelper_() {
      if (this.isFullWindow) {
        return this.exitFullWindow();
      }

      if (this.fsApi_.requestFullscreen) {
        var promise = document[this.fsApi_.exitFullscreen]();

        if (promise) {
          // we're splitting the promise here, so, we want to catch the
          // potential error so that this chain doesn't have unhandled errors
          silencePromise(promise.then(function () {
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

    var events = ['enterFullWindow', 'exitFullWindow', 'fullscreenchange'];

    var handleFullWindowChange = function handleFullWindowChange(event) {
      _this.updateButtonState.call(_assertThisInitialized(_this));

      if (!_this.player_.isFullscreen()) {
        _this.show();
      } else {
        _this.hide();
      }

      if (event.type !== 'fullscreenchange') {
        var fullscreenToggle = _this.getFullscreenToggle();

        if (fullscreenToggle) {
          fullscreenToggle.handleFullscreenChange();
        }

        player.trigger('fullwindowchange');
      }
    };

    player.on(events, handleFullWindowChange);
    player.on('dispose', function () {
      player.off(events, handleFullWindowChange);
    });
    return _this;
  }

  var _proto = FullWindowToggle.prototype;

  _proto.getFullscreenToggle = function getFullscreenToggle() {
    var findComponents = this.player_.findChild('fullscreenToggle');

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
  ;

  _proto.buildCSSClass = function buildCSSClass() {
    return "vjs-fullwindow-control " + _Button.prototype.buildCSSClass.call(this);
  }
  /**
   * Button click handle.
   *
   * 
   * @param     {Object} [event]
   *            Event data.
   */
  ;

  _proto.handleClick = function handleClick(event) {
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
  ;

  _proto.updateButtonState = function updateButtonState() {
    if (!this.player_.isFullWindow) {
      this.controlText('Fullwindow');
    } else {
      this.controlText('Exit Fullwindow');
    }
  };

  return FullWindowToggle;
}(Button);

videojs.registerComponent('FullWindowToggle', FullWindowToggle);
var controlBarChildren = videojs.getComponent('ControlBar').prototype.options_.children;
var fullScreenButtonIndex = controlBarChildren.indexOf('FullscreenToggle');
controlBarChildren.splice(fullScreenButtonIndex, 0, 'FullWindowToggle');
//# sourceMappingURL=extra-fullwindow-toggle.es.js.map
