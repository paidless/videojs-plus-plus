import videojs from 'video.js';

import SettingMenuItem from './SettingMenuItem.js';

class SettingSubOptionTitle extends SettingMenuItem {
  constructor(player, options) {
    super(player, options);

    this.el_.insertAdjacentElement('afterbegin', videojs.dom.createEl('div'));
    this.addClass('vjs-settings-sub-menu-item');
    this.addClass('vjs-settings-sub-menu-title');
  }

  handleClick() {
    this.options_.menu.animate(() => {
      this.options_.menu.restore();
    }, 'out');
  }
}

videojs.registerComponent('SettingSubOptionTitle', SettingSubOptionTitle);

export default SettingSubOptionTitle;
