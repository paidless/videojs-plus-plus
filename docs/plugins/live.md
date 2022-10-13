## Live Streaming UI <!-- {docsify-ignore-all} -->

Implement DVR ([Live UI](https://blog.videojs.com/video-js-7-4/#Live-UI)).

### Usage

```html inject keep
<link rel="stylesheet" href="../dist/plugins/live/style.css" />
<script src="../dist/plugins/live/index.js"></script>
```

<br />

```html inject
<video
  id="example-video"
  class="vjs-fluid"
  poster="https://vjs.zencdn.net/v/oceans.png"
>
  <source src="https://storage.googleapis.com/shaka-live-assets/player-source.mpd" type="application/dash+xml" />
</video>
```

```js run
const player = videojs('example-video', {
  muted: true
});

player.live();
```

#### Disable Progress Bar

Disable the user to use the progress bar to seek the video.

```js
player.live({
  dvr: false
});
```

### API

```js
// initialize
player.live();

// exit live mode
player.live().dispose();
```
