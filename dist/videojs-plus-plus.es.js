/* eslint-disable */
/* VERSION: 1.7.5 */
import videojs from 'video.js';

function findChild(parent, name, result) {
  var children = [];

  if (parent && parent.childIndex_ && Object.keys(parent.childIndex_).length) {
    for (var componentId in parent.childIndex_) {
      var component = parent.childIndex_[componentId];

      if (component && component.name_ == name) {
        var _result$push;

        result.push((_result$push = {
          parent: parent,
          component: component,
          index: parent.children_.indexOf(component)
        }, _result$push[name] = component, _result$push));
      }

      children.push(findChild(component, name, result));
    }
  }

  return {
    name: name,
    parent: parent,
    children: children
  };
}

videojs.getComponent('Component').prototype.findChild = function (name) {
  var result = [];
  findChild(this, name, result);
  return result;
};

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

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

var getDuration = /*#__PURE__*/function (_videojs$getPlugin) {
  _inheritsLoose(getDuration, _videojs$getPlugin);

  function getDuration(player, options) {
    return _videojs$getPlugin.call(this, player, options) || this;
  }

  var _proto = getDuration.prototype;

  _proto.value = function value() {
    var duration = this.player.duration();
    return duration === Infinity ? this.player.liveTracker.liveCurrentTime() : duration;
  };

  return getDuration;
}(videojs.getPlugin('plugin'));

videojs.registerPlugin('getDuration', getDuration);

var _videojs$browser = videojs.browser,
    IS_IPHONE = _videojs$browser.IS_IPHONE,
    IOS_VERSION = _videojs$browser.IOS_VERSION;
videojs.hook('setup', function (vjsPlayer) {
  vjsPlayer.playsinline(vjsPlayer.options_.playsinline !== false);
  vjsPlayer.addClass('video-js');

  if (IS_IPHONE) {
    vjsPlayer.addClass('vjs-is-iphone');

    if (IOS_VERSION < 11) {
      vjsPlayer.addClass('vjs-iphone-below-11');
    }
  }
});

var Component = videojs.getComponent('Component');
var ControlBar = videojs.getComponent('ControlBar');

var ControlSeparator = /*#__PURE__*/function (_Component) {
  _inheritsLoose(ControlSeparator, _Component);

  function ControlSeparator(player, options) {
    var _this;

    _this = _Component.call(this, player, options) || this;

    _this.addClass('vjs-control-separator');

    _this.addClass(options.className || '');

    return _this;
  }

  return ControlSeparator;
}(Component);

videojs.registerComponent('ControlSeparator', ControlSeparator);
videojs.hook('beforesetup', function (_, options) {
  var children = ControlBar.prototype.options_.children.slice(0);
  var index = children.indexOf('CustomControlSpacer');

  if (index > -1) {
    ControlBar.prototype.options_.children = [{
      name: 'ControlSeparator',
      className: 'top',
      children: []
    }, {
      name: 'ControlSeparator',
      className: 'middle',
      children: children.splice(0, index + 1)
    }, {
      name: 'ControlSeparator',
      className: 'bottom',
      children: children
    }];
  }

  return options;
}); // prevent control bar immediately shown

videojs.hook('setup', function (vjsPlayer) {
  var enableMobileView = vjsPlayer.options_.mobileView !== false;

  var matchDimension = function matchDimension(value) {
    return window.matchMedia ? window.matchMedia("(max-width: " + value + "px)").matches : window.innerWidth <= value;
  };

  if (matchDimension(480) && enableMobileView) {
    // Prevent control bar shown immediately after playing
    vjsPlayer.controlBar.hide();
    vjsPlayer.one('playing', function () {
      // Show control bar after `userinactive` (depends on `inactivityTimeout`) or user action
      var events = ['mouseover', 'userinactive', 'touchstart'];
      vjsPlayer.one(events, function callback() {
        vjsPlayer.off(events, callback);
        vjsPlayer.controlBar.show();
      }); // If player do not autoplay start,
      // the first click to play action cause player inactive ( maybe a bug of videojs )
      // Then clcik on the player before `inactivityTimeout`, the control bar will no shown as the player still inactive
      // So we need to make sure player is active after second click

      vjsPlayer.one('touchend', function () {
        vjsPlayer.userActive(true);
      });
    });
    vjsPlayer.addClass('vjs-mobile-view');
  }
});

var Dom = videojs.dom;
var TimeTooltip = videojs.getComponent('TimeTooltip'); // https://github.com/Ami-OS/video.js/blob/65750e311661e70f170e3652573caacf6f21fcce/src/js/control-bar/progress-control/time-tooltip.js#L54-L133

TimeTooltip.prototype.update = function update(seekBarRect, seekBarPoint, content) {
  var tooltipRect = Dom.getBoundingClientRect(this.el_);
  var playerRect = Dom.getBoundingClientRect(this.player_.el());
  var seekBarPointPx = seekBarRect.width * seekBarPoint; // do nothing if either rect isn't available
  // for example, if the player isn't in the DOM for testing

  if (!playerRect || !tooltipRect) {
    return;
  } // This is the space right of the `seekBarPoint` in the `SeekBar`


  var spaceRightOfPoint = seekBarRect.width - seekBarPointPx; // This is the space left of the `seekBarPoint` in the `SeekBar`

  var spaceLeftOfPoint = seekBarRect.width - spaceRightOfPoint; // This is the number of pixels by which the tooltip will need to be pulled
  // further to the right to center it over the `seekBarPoint`.

  var pullTooltipBy = tooltipRect.width / 2; // The center of `seekBar`

  var centerPosition = seekBarRect.width / 2; // Offset value of the `centerPosition`

  var centerOffsetOfPoint = centerPosition - seekBarPointPx; // If `tooltipRect` is greater than `seekBarRect` then center the tooltip,
  // else patch the offset value of the tooltip overflow space.

  if (tooltipRect.width > seekBarRect.width) {
    pullTooltipBy += centerOffsetOfPoint;
  } else if (spaceLeftOfPoint < pullTooltipBy) {
    pullTooltipBy += pullTooltipBy - spaceLeftOfPoint;
  } else if (spaceRightOfPoint < pullTooltipBy) {
    pullTooltipBy -= pullTooltipBy - spaceRightOfPoint;
  } // prevent small width fluctuations within 0.4px from
  // changing the value below.
  // This really helps for live to prevent the play
  // progress time tooltip from jittering


  pullTooltipBy = Math.round(pullTooltipBy);
  this.el_.style.right = "-" + pullTooltipBy + "px";
  this.write(content);
};

var Component$1 = videojs.getComponent('Component');

var ProgressBarPadding = /*#__PURE__*/function (_Component) {
  _inheritsLoose(ProgressBarPadding, _Component);

  // The constructor of a component receives two arguments: the
  // player it will be associated with and an object of options.
  function ProgressBarPadding(player, options) {
    if (options === void 0) {
      options = {};
    }

    // It is important to invoke the superclass before anything else,
    // to get all the features of components out of the box!
    return _Component.call(this, player, options) || this;
  } // The `createEl` function of a component creates its DOM element.


  var _proto = ProgressBarPadding.prototype;

  _proto.createEl = function createEl() {
    return videojs.dom.createEl('div', {
      // Prefixing classes of elements within a player with "vjs-"
      // is a convention used in Video.js.
      className: 'vjs-progress-bar-padding'
    });
  };

  return ProgressBarPadding;
}(Component$1);

videojs.registerComponent('ProgressBarPadding', ProgressBarPadding);
videojs.getComponent('seekBar').prototype.options_.children.push('ProgressBarPadding');

/**
 * Keep a number between a min and a max value
 * 
 * https://github.com/videojs/video.js/blob/4238f5c1d88890547153e7e1de7bd0d1d8e0b236/src/js/utils/clamp.js#L1-L19
 *
 * @param {number} number
 *        The number to clamp
 *
 * @param {number} min
 *        The minimum value
 * @param {number} max
 *        The maximum value
 *
 * @return {number}
 *         the clamped number
 */
var clamp = function clamp(number, min, max) {
  number = Number(number);
  return Math.min(max, Math.max(min, isNaN(number) ? min : number));
};

var Dom$1 = videojs.dom;
var SeekBar = videojs.getComponent('SeekBar');
/**
 * Update time display position
 * 
 * Call this function with:
 *   updateTimeDisplay.apply(this, arguments);
 */

var updateTimeDisplay = function updateTimeDisplay(event) {
  // https://github.com/videojs/video.js/blob/4238f5c1d88890547153e7e1de7bd0d1d8e0b236/src/js/control-bar/progress-control/progress-control.js#L51-L91
  var mouseTimeDisplay = this.getChild('mouseTimeDisplay');
  var seekBarEl = this.el();
  var seekBarRect = Dom$1.getBoundingClientRect(seekBarEl);
  var seekBarPoint = Dom$1.getPointerPosition(seekBarEl, event).x; // The default skin has a gap on either side of the `SeekBar` (this). This means
  // that it's possible to trigger this behavior outside the boundaries of
  // the `SeekBar` (this). This ensures we stay within it at all times.

  seekBarPoint = clamp(seekBarPoint, 0, 1);

  if (mouseTimeDisplay) {
    // https://github.com/videojs/video.js/blob/4238f5c1d88890547153e7e1de7bd0d1d8e0b236/src/js/control-bar/progress-control/mouse-time-display.js#L45-L63
    mouseTimeDisplay.update(seekBarRect, seekBarPoint);
  }
}; // Always added MouseTimeDisplay tooltips to a player
// Ref: https://github.com/videojs/video.js/blob/df927de320998e161272d52235df85982ae86c6f/src/js/control-bar/progress-control/seek-bar.js#L509-L512


if (!SeekBar.prototype.options_.children.includes('mouseTimeDisplay')) {
  SeekBar.prototype.options_.children.splice(1, 0, 'mouseTimeDisplay');
} // getPercent and handleMouseMove patches from:
//   https://github.com/videojs/video.js/issues/4460#issuecomment-312861657


SeekBar.prototype.getPercent = function getPercent() {
  var time = this.player_.currentTime();
  var percent = time / this.player_.getDuration().value();
  return percent >= 1 ? 1 : percent;
};

SeekBar.prototype.handleMouseMove = function handleMouseMove(event) {
  var player = this.player_;
  updateTimeDisplay.apply(this, arguments); // if (!videojs.dom.isSingleLeftClick(event) || isAdPlaying(player)) {

  if (!videojs.dom.isSingleLeftClick(event)) {
    return;
  }

  var newTime = this.calculateDistance(event) * player.getDuration().value();

  if (newTime === player.getDuration().value()) {
    newTime = newTime - 0.1;
  }

  player.currentTime(newTime);
  this.update();
};

videojs.getComponent('ControlBar').prototype.options_.children = ['PlayToggle', 'CustomControlSpacer', 'VolumePanel', 'CurrentTimeDisplay', 'TimeDivider', 'DurationDisplay', 'ProgressControl', 'CustomControlSpacer', 'SettingMenuButton', 'FullscreenToggle'];
videojs.hook('setup', function (vjsPlayer) {
  vjsPlayer.on('mouseleave', function () {
    vjsPlayer.userActive(false);
  });
  vjsPlayer.ready(function () {
    vjsPlayer.controls(vjsPlayer.options_.controls !== false);
  });
});

var Title = /*#__PURE__*/function (_videojs$getComponent) {
  _inheritsLoose(Title, _videojs$getComponent);

  function Title(player, options) {
    var _this;

    _this = _videojs$getComponent.call(this, player, options) || this;
    _this.title_ = options.playerOptions.title || '';

    _this.update(_this.title_);

    return _this;
  }

  var _proto = Title.prototype;

  _proto.createEl = function createEl() {
    var el = _videojs$getComponent.prototype.createEl.call(this, 'div', {
      className: 'vjs-title'
    });

    this.contentEl_ = videojs.dom.createEl('div', {
      className: 'vjs-title-field'
    });
    el.appendChild(this.contentEl_);
    return el;
  };

  _proto.update = function update(title_) {
    if (!title_) {
      this.hide();
    } else {
      this.show();
    }

    this.player_.cache_.title = this.title_;
    this.title_ = title_;
    this.contentEl_.innerHTML = title_;
  };

  return Title;
}(videojs.getComponent('Component'));

var title = function title(title_) {
  var videoTitle = this.player_.getChild('VideoTitle');

  if (typeof title_ === 'undefined') {
    return videoTitle.title_;
  }

  videoTitle.update(title_);
};

videojs.registerPlugin('title', title);
videojs.registerComponent('VideoTitle', Title);
videojs.getComponent('Player').prototype.options_.children.splice(2, 0, 'VideoTitle');

var PlayToggleButton = videojs.getComponent('PlayToggle');
var ClickableComponent = videojs.getComponent('ClickableComponent');

var PlayToggleLayer = /*#__PURE__*/function (_ClickableComponent) {
  _inheritsLoose(PlayToggleLayer, _ClickableComponent);

  function PlayToggleLayer() {
    return _ClickableComponent.apply(this, arguments) || this;
  }

  var _proto = PlayToggleLayer.prototype;

  _proto.createEl = function createEl() {
    return videojs.dom.createEl('div', {
      className: 'vjs-play-toggle-layer'
    });
  };

  _proto.handleClick = function handleClick(evt) {
    if (this.player_.userActive() || this.player_.paused()) {
      PlayToggleButton.prototype.handleClick.call(this, evt);
    }
  };

  return PlayToggleLayer;
}(ClickableComponent);

videojs.registerComponent('PlayToggleLayer', PlayToggleLayer);
var playerChildren = videojs.getComponent('Player').prototype.options_.children;
var loadSpinnerIndex = playerChildren.indexOf('loadingSpinner');
playerChildren.splice(loadSpinnerIndex, 0, 'PlayToggleLayer');

var MenuItem = videojs.getComponent('MenuItem');

var ContextMenuItem = /*#__PURE__*/function (_MenuItem) {
  _inheritsLoose(ContextMenuItem, _MenuItem);

  function ContextMenuItem(player, options) {
    var _this;

    _this = _MenuItem.call(this, player, _extends({}, options, {
      selectable: true
    })) || this;

    _this.addClass('vjs-context-menu-item');

    _this.controlText(options.label);

    return _this;
  }

  var _proto = ContextMenuItem.prototype;

  _proto.createEl = function createEl() {
    var _MenuItem$prototype$c;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var el = (_MenuItem$prototype$c = _MenuItem.prototype.createEl).call.apply(_MenuItem$prototype$c, [this].concat(args));

    el.insertAdjacentHTML('afterbegin', "<span aria-hidden=\"true\" class=\"vjs-icon-placeholder " + (this.options_.icon || '') + "\"></span>");
    return el;
  };

  _proto.handleClick = function handleClick() {
    var ContextMenu = this.player_.findChild('ContextMenu')[0].component;
    ContextMenu.hide();
  };

  return ContextMenuItem;
}(MenuItem);

videojs.registerComponent('ContextMenuItem', ContextMenuItem);

var ContextMenuToggleLoop = /*#__PURE__*/function (_ContextMenuItem) {
  _inheritsLoose(ContextMenuToggleLoop, _ContextMenuItem);

  function ContextMenuToggleLoop(player) {
    var _this;

    _this = _ContextMenuItem.call(this, player, {
      name: 'ContextMenuToggleLoop',
      label: 'Loop',
      icon: 'vjs-icon-loop'
    }) || this;

    _this.addClass('vjs-checkbox');

    player.on('loadstart', _this.update.bind(_assertThisInitialized(_this)));
    return _this;
  }

  var _proto = ContextMenuToggleLoop.prototype;

  _proto.update = function update() {
    this.selected(this.player_.loop());
  };

  _proto.handleClick = function handleClick() {
    _ContextMenuItem.prototype.handleClick.call(this);

    this.player_.loop(!this.player_.loop());
    this.update();
  };

  return ContextMenuToggleLoop;
}(ContextMenuItem);

videojs.registerComponent('ContextMenuToggleLoop', ContextMenuToggleLoop);

var AboutThisPlayer = /*#__PURE__*/function (_ContextMenuItem) {
  _inheritsLoose(AboutThisPlayer, _ContextMenuItem);

  function AboutThisPlayer(player) {
    return _ContextMenuItem.call(this, player, {
      name: 'AboutThisPlayer',
      label: 'About This Player',
      icon: 'vjs-icon-github'
    }) || this;
  }

  var _proto = AboutThisPlayer.prototype;

  _proto.handleClick = function handleClick() {
    _ContextMenuItem.prototype.handleClick.call(this);

    window.open('https://github.com/paidless/videojs-plus-plus', '_blank');
  };

  return AboutThisPlayer;
}(ContextMenuItem);

videojs.registerComponent('AboutThisPlayer', AboutThisPlayer);

var ClickableComponent$1 = videojs.getComponent('ClickableComponent'); // for mobile view

var CloseContextMenu = /*#__PURE__*/function (_ClickableComponent) {
  _inheritsLoose(CloseContextMenu, _ClickableComponent);

  function CloseContextMenu() {
    return _ClickableComponent.apply(this, arguments) || this;
  }

  var _proto = CloseContextMenu.prototype;

  _proto.buildCSSClass = function buildCSSClass() {
    return 'vjs-close-menu-layer vjs-close-context-menu';
  };

  _proto.handleClick = function handleClick() {
    this.options_.menu.hide();
  };

  return CloseContextMenu;
}(ClickableComponent$1);

videojs.registerComponent('CloseContextMenu', CloseContextMenu);

var Menu = videojs.getComponent('Menu');

var ContextMenu = /*#__PURE__*/function (_Menu) {
  _inheritsLoose(ContextMenu, _Menu);

  function ContextMenu(player, options) {
    var _this;

    _this = _Menu.call(this, player, options) || this;

    _this.addClass('vjs-context-menu');

    _this.hide();

    _this.player_.on('contextmenu', _this.onContextmenu.bind(_assertThisInitialized(_this)));

    return _this;
  }

  var _proto = ContextMenu.prototype;

  _proto.createEl = function createEl() {
    var _Menu$prototype$creat;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var el = (_Menu$prototype$creat = _Menu.prototype.createEl).call.apply(_Menu$prototype$creat, [this].concat(args));

    var layer = new CloseContextMenu(this.player_, {
      menu: this
    });
    el.insertBefore(layer.el_, el.firstElementChild);
    return el;
  };

  _proto.show = function show(x, y) {
    _Menu.prototype.show.call(this);

    this.el_.append.style.width = '';
    this.el_.append.style.height = '';
    this.el_.style.width = '';
    this.el_.style.height = '';
    var rect = this.player_.el().getBoundingClientRect();

    var _this$el_$getBounding = this.el_.getBoundingClientRect(),
        width = _this$el_$getBounding.width,
        height = _this$el_$getBounding.height;

    var posX = rect.width - width;
    var posY = rect.height - height;
    var calcX = 0;
    var calcY = 0;

    if (x > posX) {
      calcX = (x - posX) * -1;
    }

    if (y > posY) {
      calcY = (y - posY) * -1;
    }

    var marginTop = calcY;
    var marginLeft = calcX;
    this.el_.style.top = y + 'px';
    this.el_.style.left = x + 'px';
    this.el_.style.marginTop = marginTop + 'px';
    this.el_.style.marginLeft = marginLeft + 'px';
    this.el_.append.style.width = width + 'px';
    this.el_.append.style.height = height + 'px';
    this.el_.style.width = width + 'px';
    this.el_.style.height = height + 'px';
  };

  _proto.onContextmenu = function onContextmenu(event) {
    event.preventDefault();
    var rect = this.player_.el().getBoundingClientRect();
    var clientX = event.clientX,
        clientY = event.clientY;

    if (clientY > rect.y && clientY - rect.height < rect.y && clientX > rect.x && clientX - rect.width < rect.x) {
      var x = clientX - rect.x;
      var y = clientY - rect.y;
      this.show(x, y);
    } else {
      this.hide();
    }
  };

  _proto.handleClick = function handleClick(evt) {
    if (evt.button || evt.button === 0) {
      if (evt.button !== 2) {
        this.hide();
      }
    }
  };

  return ContextMenu;
}(Menu);

ContextMenu.prototype.options_ = {
  children: ['ContextMenuToggleLoop', 'AboutThisPlayer']
};
videojs.registerComponent('ContextMenu', ContextMenu);
videojs.getComponent('Player').prototype.options_.children.push('ContextMenu');

var ClickableComponent$2 = videojs.getComponent('ClickableComponent');

var CloseSettingMenu = /*#__PURE__*/function (_ClickableComponent) {
  _inheritsLoose(CloseSettingMenu, _ClickableComponent);

  function CloseSettingMenu() {
    return _ClickableComponent.apply(this, arguments) || this;
  }

  var _proto = CloseSettingMenu.prototype;

  _proto.buildCSSClass = function buildCSSClass() {
    return 'vjs-close-menu-layer vjs-close-setting-menu';
  };

  _proto.handleClick = function handleClick() {
    this.options_.menu.menuButton_.hideMenu();
  };

  return CloseSettingMenu;
}(ClickableComponent$2);

videojs.registerComponent('CloseSettingMenu', CloseSettingMenu);

var Menu$1 = videojs.getComponent('Menu');

var SettingMenu = /*#__PURE__*/function (_Menu) {
  _inheritsLoose(SettingMenu, _Menu);

  function SettingMenu(player, options) {
    var _this;

    _this = _Menu.call(this, player, _extends({}, options, {
      name: 'SettingMenu'
    })) || this;

    _this.addClass('vjs-setting-menu');

    return _this;
  }

  var _proto = SettingMenu.prototype;

  _proto.init = function init() {
    if (!this.contentEl_) {
      return;
    }

    this.mainMenuItems = this.children().slice(0);
    this.transform(this.mainMenuItems);
    /**
     *  Since the width of setting menu depends on screen width.
     *  If player is initialized on small screen size then resize to a bigger screen,
     *  the width of setting menu will be too wide as the origin width is affected by css,
     *  A class `vjs-setting-menu-ready` as a condition for css on small screen,
     *  therefore the origin width will not be affected.
     */

    this.addClass('vjs-setting-menu-ready');
  };

  _proto.createEl = function createEl() {
    var el = _Menu.prototype.createEl.call(this);

    var layer = new CloseSettingMenu(this.player_, {
      menu: this
    });
    el.insertBefore(layer.el_, el.firstElementChild);
    return el;
  };

  _proto.update = function update(children) {
    var _this2 = this;

    if (children === void 0) {
      children = [];
    }

    var children_ = this.children().slice(0);
    children_.forEach(function (child) {
      _this2.removeChild(child);
    });
    children.forEach(function (child) {
      _this2.addChild(child);
    });
  };

  _proto.resize = function resize(_ref) {
    var width = _ref.width,
        height = _ref.height;
    this.contentEl_.style.width = width + 'px';
    this.contentEl_.style.height = height + 'px';
  };

  _proto.getMenuDimension = function getMenuDimension(items) {
    var player = this.player_;
    var tempMenu = new SettingMenuTemp(player);
    tempMenu.update(items);
    player.addChild(tempMenu);
    var rect = tempMenu.contentEl_.getBoundingClientRect(); // remove subMenuItem form tempMenu first, otherwise they will also be disposed

    tempMenu.update();
    tempMenu.dispose(); // remove tempMenu in `player.children`

    player.removeChild(tempMenu);
    return rect;
  };

  _proto.transform = function transform(items) {
    var dimensions = this.getMenuDimension(items);
    this.update(items);
    this.resize(dimensions);
  };

  _proto.restore = function restore() {
    this.transform(this.mainMenuItems);
  };

  _proto.removeStyle = function removeStyle() {
    this.contentEl_.removeAttribute('style');
  };

  _proto.hide = function hide() {// Disable default hide function
    // As the default hide function violate the calculation of menu dimension
  };

  return SettingMenu;
}(Menu$1);

var SettingMenuTemp = /*#__PURE__*/function (_SettingMenu) {
  _inheritsLoose(SettingMenuTemp, _SettingMenu);

  function SettingMenuTemp(player) {
    var _this3;

    _this3 = _SettingMenu.call(this, player, {
      name: 'SettingMenuTemp'
    }) || this;

    _this3.addClass('vjs-setting-menu-temp');

    return _this3;
  }

  return SettingMenuTemp;
}(SettingMenu);

videojs.registerComponent('SettingMenu', SettingMenu);

var MenuItem$1 = videojs.getComponent('MenuItem');

var SettingMenuItem = /*#__PURE__*/function (_MenuItem) {
  _inheritsLoose(SettingMenuItem, _MenuItem);

  function SettingMenuItem(player, options) {
    var _this;

    _this = _MenuItem.call(this, player, videojs.mergeOptions({
      selectable: false
    }, options)) || this;
    _this.menu = options.menu;
    return _this;
  }

  return SettingMenuItem;
}(MenuItem$1);

videojs.registerComponent('SettingMenuItem', SettingMenuItem);

var SettingOnOffItem = /*#__PURE__*/function (_SettingMenuItem) {
  _inheritsLoose(SettingOnOffItem, _SettingMenuItem);

  function SettingOnOffItem() {
    return _SettingMenuItem.apply(this, arguments) || this;
  }

  var _proto = SettingOnOffItem.prototype;

  _proto.createEl = function createEl() {
    var options = this.options_;
    var el = videojs.dom.createEl('li', {
      className: 'vjs-menu-item vjs-setting-onoff-item',
      innerHTML: "\n        <div class=\"vjs-icon-placeholder " + (this.options_.icon || '') + "\"></div>\n        <div>" + this.localize(options.label) + "</div>\n        <div class=\"vjs-spacer\"></div>\n        <div>\n          <div class=\"vjs-onoff-button\"></div>\n        </div>\n      "
    });
    return el;
  };

  _proto.update = function update(active) {
    this.active = typeof active === 'undefined' ? !this.active : active;

    if (this.active) {
      this.addClass('vjs-active');
    } else {
      this.removeClass('vjs-active');
    }
  };

  _proto.handleClick = function handleClick() {
    this.update();
  };

  _proto.selected = function selected() {};

  return SettingOnOffItem;
}(SettingMenuItem);

videojs.registerComponent('SettingOnOffItem', SettingOnOffItem);

var SettingSubOptionTitle = /*#__PURE__*/function (_SettingMenuItem) {
  _inheritsLoose(SettingSubOptionTitle, _SettingMenuItem);

  function SettingSubOptionTitle(player, options) {
    var _this;

    _this = _SettingMenuItem.call(this, player, options) || this;

    _this.addChild('Component', {}, 0);

    _this.addClass('vjs-settings-sub-menu-item');

    _this.addClass('vjs-settings-sub-menu-title');

    return _this;
  }

  var _proto = SettingSubOptionTitle.prototype;

  _proto.handleClick = function handleClick() {
    this.options_.menu.restore();
  };

  return SettingSubOptionTitle;
}(SettingMenuItem);

videojs.registerComponent('SettingSubOptionTitle', SettingSubOptionTitle);

var SettingSubOptionItem = /*#__PURE__*/function (_SettingMenuItem) {
  _inheritsLoose(SettingSubOptionItem, _SettingMenuItem);

  function SettingSubOptionItem(player, options) {
    var _this;

    _this = _SettingMenuItem.call(this, player, options) || this;
    _this.selectable = true; // FIXME: should be remove

    Object.assign(_assertThisInitialized(_this), options);

    _this.addChild('Component', {}, 0);

    _this.addClass('vjs-settings-sub-menu-item');

    _this.addClass('vjs-settings-sub-menu-option');

    _this.update();

    return _this;
  }

  var _proto = SettingSubOptionItem.prototype;

  _proto.update = function update() {
    this.selected(this.value === this.parent.selected.value);
  };

  _proto.handleClick = function handleClick() {
    this.parent.onChange({
      index: this.options_.index
    });
    this.menu.restore();
  };

  return SettingSubOptionItem;
}(SettingMenuItem);

videojs.registerComponent('SettingSubOptionItem', SettingSubOptionItem);

/**
 * @param {Array<Object|number|string>} entries
 */

function parseEntries(entries, selectedIndex) {
  entries = entries.map(function (data, index) {
    if (data !== null && typeof data !== 'object') {
      data = {
        value: data,
        label: data
      };
    }

    var isDefault = false;

    if (typeof selectedIndex === 'undefined' && data["default"] === true) {
      isDefault = true;
      selectedIndex = index;
    }

    return _extends({}, data, {
      index: index,
      "default": isDefault
    });
  });
  return {
    entries: entries,
    selected: entries[selectedIndex || 0]
  };
}

var SettingOptionItem = /*#__PURE__*/function (_SettingMenuItem) {
  _inheritsLoose(SettingOptionItem, _SettingMenuItem);

  function SettingOptionItem(player, options) {
    var _this;

    if (options === void 0) {
      options = {};
    }

    _this = _SettingMenuItem.call(this, player, options) || this;

    _this.setEntries(_this.options_.entries);

    if (!_this.entries.length) {
      _this.hide();
    }

    return _this;
  }

  var _proto = SettingOptionItem.prototype;

  _proto.createEl = function createEl() {
    var _this$options_ = this.options_,
        icon = _this$options_.icon,
        label = _this$options_.label;
    var el = videojs.dom.createEl('li', {
      className: 'vjs-menu-item vjs-setting-menu-item',
      innerHTML: "\n        <div class=\"vjs-icon-placeholder " + (icon || '') + "\"></div>\n        <div class=\"vjs-setting-menu-label\">" + this.localize(label) + "</div>\n        <div class=\"vjs-spacer\"></div>\n      "
    });
    this.selectedValueEl = videojs.dom.createEl('div', {
      className: 'vjs-setting-menu-value'
    });
    el.appendChild(this.selectedValueEl);
    return el;
  };

  _proto.setEntries = function setEntries(entries_, selectedIndex) {
    var _this2 = this;

    if (entries_ === void 0) {
      entries_ = [];
    }

    Object.assign(this, parseEntries(entries_, selectedIndex));
    this.updateSelectedValue();
    var SubOptionItem = videojs.getComponent(this.name_ + "Child") || SettingSubOptionItem;
    this.subMenuItems = [new SettingSubOptionTitle(this.player_, {
      label: this.options_.label,
      menu: this.menu
    })].concat(this.entries.map(function (_ref, index) {
      var label = _ref.label,
          value = _ref.value;
      return new SubOptionItem(_this2.player_, {
        index: index,
        label: label,
        value: value,
        parent: _this2,
        menu: _this2.menu
      });
    }));
  };

  _proto.handleClick = function handleClick() {
    this.menu.transform(this.subMenuItems);
  };

  _proto.select = function select(index) {
    this.selected = this.entries[index];
    this.updateSelectedValue();
  };

  _proto.update = function update() {
    this.subMenuItems.forEach(function (item) {
      item.update && item.update();
    });
  };

  _proto.onChange = function onChange(_ref2) {
    var index = _ref2.index;
    this.select(index);
    this.update(index);
  };

  _proto.updateSelectedValue = function updateSelectedValue() {
    if (this.selected) {
      this.selectedValueEl.innerHTML = this.localize(this.selected.label);
    }
  };

  return SettingOptionItem;
}(SettingMenuItem);

videojs.registerComponent('SettingOptionItem', SettingOptionItem);

var logType = '';

try {
  logType = localStorage && localStorage.getItem('vjs-plus-log');
} catch (e) {}

var log = function () {
  if (logType === 'normal' || videojs.browser.IE_VERSION) {
    // log without style
    return console.info.bind(console, '[VJS Plus]:');
  } else if (logType) {
    // log with style
    return console.info.bind(console, '%c[VJS Plus]:', 'font-weight: bold; color:#2196F3;');
  }

  return function () {};
}();

var PlaybackRateSettingItem = /*#__PURE__*/function (_SettingOptionItem) {
  _inheritsLoose(PlaybackRateSettingItem, _SettingOptionItem);

  function PlaybackRateSettingItem(player, options) {
    var _this;

    _this = _SettingOptionItem.call(this, player, _extends({}, options, {
      label: 'Speed',
      icon: 'vjs-icon-slow-motion-video',
      entries: [0.25, 0.5, 0.75, {
        label: 'Normal',
        value: 1,
        "default": true
      }, 1.25, 1.5, 1.75, 2]
    })) || this;

    _this.addClass('vjs-setting-playback-rate'); // Since playback rate will be reset to noraml when video source changed
    // So we need to listen on `ratechange`


    player.on('ratechange', function () {
      var rate = player.playbackRate();

      var index = _this.entries.findIndex(function (_ref) {
        var value = _ref.value;
        return rate === value;
      });

      if (index > -1) {
        _this.select(index);

        _this.update(index);
      } else {
        log.warn('Incorrect playbackRate value, setting menu will not updated');
      }
    });
    return _this;
  }

  var _proto = PlaybackRateSettingItem.prototype;

  _proto.onChange = function onChange() {
    var _SettingOptionItem$pr;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    (_SettingOptionItem$pr = _SettingOptionItem.prototype.onChange).call.apply(_SettingOptionItem$pr, [this].concat(args));

    this.player_.playbackRate(this.selected.value);
  };

  return PlaybackRateSettingItem;
}(SettingOptionItem);

videojs.registerComponent('PlaybackRateSettingItem', PlaybackRateSettingItem);

var MenuButton = videojs.getComponent('MenuButton');

var SettingMenuButton = /*#__PURE__*/function (_MenuButton) {
  _inheritsLoose(SettingMenuButton, _MenuButton);

  function SettingMenuButton(player, options) {
    var _this;

    _this = _MenuButton.call(this, player, options) || this; // move menu to player

    player.addChild(_this.menu);
    player.SettingMenu = _this.menu; // remove videojs parent child relationship between button and menu

    _this.removeChild(_this.menu);

    return _this;
  }

  var _proto = SettingMenuButton.prototype;

  _proto.buildCSSClass = function buildCSSClass() {
    return "vjs-setting-button " + _MenuButton.prototype.buildCSSClass.call(this);
  };

  _proto.buildWrapperCSSClass = function buildWrapperCSSClass() {
    return "vjs-setting-button " + _MenuButton.prototype.buildWrapperCSSClass.call(this);
  };

  _proto.createMenu = function createMenu() {
    var menu = new SettingMenu(this.player_, {
      menuButton: this
    });
    var entries = this.options_.entries || [];
    entries.forEach(function (componentName) {
      var component = menu.addChild(componentName, {
        menu: menu
      });
      menu[componentName] = component;
    });
    return menu;
  };

  _proto.hideMenu = function hideMenu() {
    this.unpressButton();
    this.el_.blur();
  };

  _proto.pressButton = function pressButton() {
    _MenuButton.prototype.pressButton.call(this);

    this.menu.init();
  };

  _proto.unpressButton = function unpressButton() {
    _MenuButton.prototype.unpressButton.call(this);

    this.player_.removeClass('vjs-keep-control-showing');
    this.menu.restore();
  };

  _proto.handleClick = function handleClick() {
    var _this2 = this;

    this.player_.addClass('vjs-keep-control-showing');

    if (this.buttonPressed_) {
      this.unpressButton();
    } else {
      this.pressButton();
    }

    this.off(document.body, 'click', this.hideMenu); // this.off(document.body, 'touchend', this.hideMenu);

    setTimeout(function () {
      _this2.one(document.body, 'click', _this2.hideMenu); // _this.buttonPressed_ && _this.one(document.body, 'touchend', _this.hideMenu);

    }, 0);
  };

  return SettingMenuButton;
}(MenuButton);

SettingMenuButton.prototype.controlText_ = 'Settings';
SettingMenuButton.prototype.options_ = {
  entries: ['PlaybackRateSettingItem']
};
videojs.registerComponent('SettingMenuButton', SettingMenuButton);
//# sourceMappingURL=videojs-plus-plus.es.js.map
