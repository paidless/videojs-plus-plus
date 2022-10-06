const ghpages = require('gh-pages');

ghpages.publish(
  './',
  {
    src: ['docs/**/*', 'dist/**/*', 'examples/**/*', '.nojekyll'],
    dotfiles: true
  },
  function (err) {
    // eslint-disable-next-line
    console.log(err);
  }
);
