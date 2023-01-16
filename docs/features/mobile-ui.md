## Mobile UI <!-- {docsify-ignore-all} -->

Mobile UI is controlled by class `vjs-mobile-view`.
This class will be added if the player initializes at screen smaller or equal 480px.

<div style="margin: auto">
  <img style="float: left; max-width: 300px; width: 49%" src="./assets/screenshot/mobileui.control.png">
  <img style="float: left; max-width: 300px; width: 49%; margin-left: 2%" src="./assets/screenshot/mobileui.setting.png" width="300px">
</div>

### Disable mobile view

```html inject
<video
  id="example-video"
  class="vjs-fluid"
  poster="https://vjs.zencdn.net/v/oceans.png"
>
  <source src="https://vjs.zencdn.net/v/oceans.mp4" />
</video>
```

```js run
const player = window.player = videojs('example-video', {
  // ...
  mobileView: false, // highlight-line
})
```
