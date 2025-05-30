const path = require('path');
const { log } = require('../utils/log');
const generateEntries = require('../utils/generateEntries');
const renderStyles = require('../utils/renderStyles');

// extend log to proper say what file is running
module.exports = (config) => {
  return new Promise((resolve) => {
    if (config && config.general && config.general.watch) {
      try {
        log(__filename, 'Watcher Sass running...', '', 'info');

        const gaze = require('gaze');
        const sassPattern = path.join(config.general.sourcesPath, `**/*.${config.general.sourceKey}.scss`);

        gaze(sassPattern, function () {
          // simple debounce with timeout for only save the last if several events are triggered
          this.on('all', (event, file) => {
            // trigger a save
            const relativePath = path.relative(config.general.sourcesPath, path.dirname(file));
            const fileName = path.basename(file)
              .replace(config.general.sourceKey, config.general.bundleKey);
            const destFile = path.join(relativePath, fileName);

            // override to keep alive
            config.stylelint.failOnError = false;

            renderStyles(file, destFile, config);
          });
        });
      } catch (e) {
        log(__filename, 'Something is missing, you need install dev dependencies for this.', e.message, 'error');
      }
    } else {
      log(__filename, 'Sass running...', '', 'info');

      // checking all entries at this configuration
      const entries = generateEntries(config, 'scss');
      const promises = Object.keys(entries).map(file => renderStyles(entries[file], file, config));
      Promise.allSettled(promises).then((results) => {
        log(__filename, 'Styles done', '', 'info');
        resolve();
      });
    }
  });
};
