/* eslint-disable */
/* VERSION: 1.7.1 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('video.js')) :
  typeof define === 'function' && define.amd ? define(['video.js'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.videojs));
}(this, (function (videojs) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var videojs__default = /*#__PURE__*/_interopDefaultLegacy(videojs);

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

  var ClickableComponent = videojs__default['default'].getComponent('ClickableComponent');
  /**
   * Displays the live indicator when duration is Infinity.
   * 
   * https://github.com/videojs/video.js/blob/eb8f802391392406ad9801a76934aa7a98dd1bdb/src/js/control-bar/seek-to-live.js
   *
   * @extends Component
   */

  var LiveNotice = /*#__PURE__*/function (_ClickableComponent) {
    _inheritsLoose(LiveNotice, _ClickableComponent);

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
    function LiveNotice(player, options) {
      var _this;

      _this = _ClickableComponent.call(this, player, options) || this;

      _this.updateLiveEdgeStatus();

      if (_this.player_.liveTracker) {
        _this.updateLiveEdgeStatusHandler_ = function (e) {
          return _this.updateLiveEdgeStatus(e);
        };

        _this.on(_this.player_.liveTracker, 'liveedgechange', _this.updateLiveEdgeStatusHandler_);
      }

      return _this;
    }
    /**
     * Create the `Component`'s DOM element
     *
     * @return {Element}
     *         The element that was created.
     */


    var _proto = LiveNotice.prototype;

    _proto.createEl = function createEl() {
      var el = videojs__default['default'].dom.createEl('div', {
        className: 'vjs-live-notice',
        innerHTML: "\n        <div class=\"vjs-live-notice-spot vjs-icon-circle\"></div>\n        Live\n      "
      });
      return el;
    }
    /**
     * Update the state of this button if we are at the live edge
     * or not
     * 
     * https://github.com/videojs/video.js/blob/eb8f802391392406ad9801a76934aa7a98dd1bdb/src/js/control-bar/seek-to-live.js#L57-L72
     */
    ;

    _proto.updateLiveEdgeStatus = function updateLiveEdgeStatus() {
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
    ;

    _proto.handleClick = function handleClick() {
      this.player_.liveTracker.seekToLiveEdge();
    }
    /**
     * Dispose of the element and stop tracking
     * 
     * https://github.com/videojs/video.js/blob/eb8f802391392406ad9801a76934aa7a98dd1bdb/src/js/control-bar/seek-to-live.js#L83-L94
     */
    ;

    _proto.dispose = function dispose() {
      if (this.player_.liveTracker) {
        this.off(this.player_.liveTracker, 'liveedgechange', this.updateLiveEdgeStatusHandler_);
      }

      this.textEl_ = null;

      _ClickableComponent.prototype.dispose.call(this);
    };

    return LiveNotice;
  }(ClickableComponent);

  videojs__default['default'].registerComponent('LiveNotice', LiveNotice);

  var Plugin = videojs__default['default'].getPlugin('plugin');
  var defaults = {
    dvr: true
  };

  var Live = /*#__PURE__*/function (_Plugin) {
    _inheritsLoose(Live, _Plugin);

    function Live(player, options) {
      var _this;

      if (options === void 0) {
        options = {};
      }

      _this = _Plugin.call(this, player, options) || this;
      _this.options = videojs__default['default'].mergeOptions(defaults, options);

      _this.createLiveNotive(player);

      _this.start(player);

      return _this;
    }

    var _proto = Live.prototype;

    _proto.createLiveNotive = function createLiveNotive(player) {
      var _player$findChild$ = player.findChild('DurationDisplay')[0],
          parent = _player$findChild$.parent,
          index = _player$findChild$.index;
      var noticeEl = new LiveNotice(player);
      parent.addChild(noticeEl, {}, index);
      this.on('dispose', function () {
        parent.removeChild(noticeEl);
      });
    };

    _proto.start = function start(player) {
      var onTimeupdate = this.onTimeUpdate.bind(this);
      player.addClass('vjs-live-streaming');

      if (this.options.dvr) {
        player.addClass('vjs-live-dvr');
      }

      player.on('timeupdate', onTimeupdate);
      this.on('dispose', function () {
        player.off('timeupdate', onTimeupdate);
        player.removeClass('vjs-live-streaming');
        player.removeClass('vjs-live-dvr');
        player.removeClass('vjs-live');
      });
    };

    _proto.onTimeUpdate = function onTimeUpdate() {
      var player = this.player;
      var duration = player.duration();

      if (duration === Infinity || player.currentTime() >= duration) {
        player.addClass('vjs-live');
      } else {
        player.removeClass('vjs-live');
      }
    };

    return Live;
  }(Plugin);

  videojs__default['default'].registerPlugin('live', Live);

})));
//# sourceMappingURL=index.js.map
