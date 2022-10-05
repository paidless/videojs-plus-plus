import videojs from 'video.js';

import './ContextMenu.scss';
import './Item/ContextMenuToggleLoop.js';
import './Item/AboutThisPlayer.js';

import CloseContextMenu from './CloseContextMenu';

const Menu = videojs.getComponent('Menu');

class ContextMenu extends Menu {
  constructor(player, options) {
    super(player, options);

    this.addClass('vjs-context-menu');

    this.hide();

    this.player_.on('contextmenu', this.onContextmenu.bind(this));
  }

  createEl(...args) {
    const el = super.createEl(...args);

    const layer = new CloseContextMenu(this.player_, {
      menu: this
    });

    el.insertBefore(layer.el_, el.firstElementChild);

    return el;
  }

  show(x, y) {
    super.show();

    this.el_.append.style.width = '';
    this.el_.append.style.height = '';
    this.el_.style.width = '';
    this.el_.style.height = '';

    const rect = this.player_.el().getBoundingClientRect();
    const { width, height } = this.el_.getBoundingClientRect();

    const posX = rect.width - width;
    const posY = rect.height - height;

    let calcX = 0;
    let calcY = 0;

    if (x > posX) {
      calcX = (x - posX) * -1;
    }

    if (y > posY) {
      calcY = (y - posY) * -1;
    }

    const marginTop = calcY;
    const marginLeft = calcX;

    this.el_.style.top = y + 'px';
    this.el_.style.left = x + 'px';
    this.el_.style.marginTop = marginTop + 'px';
    this.el_.style.marginLeft = marginLeft + 'px';

    this.el_.append.style.width = width + 'px';
    this.el_.append.style.height = height + 'px';
    this.el_.style.width = width + 'px';
    this.el_.style.height = height + 'px';
  }

  onContextmenu(event) {
    event.preventDefault();

    const rect = this.player_.el().getBoundingClientRect();
    const { clientX, clientY } = event;

    if (
      clientY > rect.y &&
      clientY - rect.height < rect.y &&
      clientX > rect.x &&
      clientX - rect.width < rect.x
    ) {
      const x = clientX - rect.x;
      const y = clientY - rect.y;

      this.show(x, y);
    } else {
      this.hide();
    }
  }

  handleClick(evt) {
    if (evt.button || evt.button === 0) {
      if (evt.button !== 2) {
        this.hide();
      }
    }
  }
}

ContextMenu.prototype.options_ = {
  children: ['ContextMenuToggleLoop', 'AboutThisPlayer']
};

videojs.registerComponent('ContextMenu', ContextMenu);

videojs.getComponent('Player').prototype.options_.children.push('ContextMenu');
