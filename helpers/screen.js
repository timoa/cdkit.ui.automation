const fs = require('fs');

const logger = require('../lib/logger');

exports.getScreenSize = (driver, platform, callback) => {
  if (platform === 'android') {
    return driver
      .elementsByClassName('android.widget.FrameLayout')
      .first()
      .getSize()
      .then(callback);
  }

  return driver
    .elementsByClassName('XCUIElementTypeWindow')
    .first()
    .getSize()
    .then(callback);
};

exports.takeScreenshot = (driver, path, screen, sleep = 2000) => {
  const filename = `${path}/${screen}.png`;

  return (
    driver
      .sleep(sleep)
      // base64 screeshot
      .takeScreenshot()
      .should.eventually.exist// save screenshot to local file
      .then(() => {
        try {
          fs.unlinkSync(filename);
        } catch (error) {
          if(error) {
            logger.error(error);
          }
        }
        return fs.existsSync(filename).should.not.be.ok;
      })
      .saveScreenshot(filename)
      .then(() => {
        return fs.existsSync(filename).should.be.ok;
      })
  );
};
