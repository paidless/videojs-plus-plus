import videojs from 'video.js';

class getDuration extends videojs.getPlugin('plugin') {
  constructor(player, options) {
    super(player, options);
  }

  value() {
    const duration = this.player.duration();
    
    return duration === Infinity ? this.player.liveTracker.liveCurrentTime() : duration;
  }
}

videojs.registerPlugin('getDuration', getDuration);
