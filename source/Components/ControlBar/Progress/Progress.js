import videojs from 'video.js';

import './TimeTooltip';
import './ProgressBarPadding';

import './Progress.scss';
import clamp from '../../../Utils/Clamp';

const Dom = videojs.dom;
const SeekBar = videojs.getComponent('SeekBar');

/**
 * Update time display position
 * 
 * Call this function with:
 *   updateTimeDisplay.apply(this, arguments);
 */
const updateTimeDisplay = function(event) {
  // https://github.com/videojs/video.js/blob/4238f5c1d88890547153e7e1de7bd0d1d8e0b236/src/js/control-bar/progress-control/progress-control.js#L51-L91

  const mouseTimeDisplay = this.getChild('mouseTimeDisplay');

  const seekBarEl = this.el();
  const seekBarRect = Dom.getBoundingClientRect(seekBarEl);
  let seekBarPoint = Dom.getPointerPosition(seekBarEl, event).x;

  // The default skin has a gap on either side of the `SeekBar` (this). This means
  // that it's possible to trigger this behavior outside the boundaries of
  // the `SeekBar` (this). This ensures we stay within it at all times.
  seekBarPoint = clamp(seekBarPoint, 0, 1);

  if (mouseTimeDisplay) {
    // https://github.com/videojs/video.js/blob/4238f5c1d88890547153e7e1de7bd0d1d8e0b236/src/js/control-bar/progress-control/mouse-time-display.js#L45-L63
    mouseTimeDisplay.update(seekBarRect, seekBarPoint);
  }
}

// Always added MouseTimeDisplay tooltips to a player
// Ref: https://github.com/videojs/video.js/blob/df927de320998e161272d52235df85982ae86c6f/src/js/control-bar/progress-control/seek-bar.js#L509-L512
if (!SeekBar.prototype.options_.children.includes('mouseTimeDisplay')) {
  SeekBar.prototype.options_.children.splice(1, 0, 'mouseTimeDisplay');
}

// getPercent and handleMouseMove patches from:
//   https://github.com/videojs/video.js/issues/4460#issuecomment-312861657

SeekBar.prototype.getPercent = function getPercent() {
  const time = this.player_.currentTime();
  const percent = time / this.player_.getDuration().value();

  return percent >= 1 ? 1 : percent;
};

SeekBar.prototype.handleMouseMove = function handleMouseMove(event) {
  const player = this.player_;

  updateTimeDisplay.apply(this, arguments);

  // if (!videojs.dom.isSingleLeftClick(event) || isAdPlaying(player)) {
  if (!videojs.dom.isSingleLeftClick(event)) {
    return;
  }

  let newTime = this.calculateDistance(event) * player.getDuration().value();

  if (newTime === player.getDuration().value()) {
    newTime = newTime - 0.1;
  }

  player.currentTime(newTime);

  this.update();
};
