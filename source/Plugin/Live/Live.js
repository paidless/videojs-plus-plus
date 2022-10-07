import videojs from 'video.js';
import LiveNotice from './LiveNotice';
import './Live.scss';

const Plugin = videojs.getPlugin('plugin');

const defaults = {
  dvr: true
}

class Live extends Plugin {
  constructor(player, options = {}) {
    super(player, options);

    this.options = videojs.mergeOptions(defaults, options);

    this.createLiveNotive(player);

    this.start(player);
  }

  createLiveNotive(player) {
    const { parent, index } = player.findChild('DurationDisplay')[0];
    const noticeEl = new LiveNotice(player);

    parent.addChild(noticeEl, {}, index);

    this.on('dispose', () => {
      parent.removeChild(noticeEl);
    });
  }

  start(player) {
    const onTimeupdate = this.onTimeUpdate.bind(this);

    player.addClass('vjs-live-streaming');
    if (this.options.dvr) {
      player.addClass('vjs-live-dvr');
    }
    player.on('timeupdate', onTimeupdate);

    this.on('dispose', () => {
      player.off('timeupdate', onTimeupdate);
      player.removeClass('vjs-live-streaming');
      player.removeClass('vjs-live-dvr');
      player.removeClass('vjs-live');
    });
  }

  onTimeUpdate() {
    const player = this.player;
    const duration = player.duration();

    if (duration === Infinity || player.currentTime() >= duration) {
      player.addClass('vjs-live');
    } else {
      player.removeClass('vjs-live');
    }
  }
}

videojs.registerPlugin('live', Live);
