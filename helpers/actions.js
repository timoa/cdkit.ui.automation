/* eslint-disable func-names */
const wd = require('wd');
const Q = require('q');

exports.swipe = function(opts) {
  const action = new wd.TouchAction();

  action
    .press({ x: opts.startX, y: opts.startY })
    .wait(opts.duration)
    .moveTo({ x: opts.endX, y: opts.endY })
    .release();

  return this.performTouchAction(action);
};

exports.pinch = function(el) {
  return Q.all([el.getSize(), el.getLocation()]).then(
    function(res) {
      const size = res[0];
      const loc = res[1];
      const center = {
        x: loc.x + size.width / 2,
        y: loc.y + size.height / 2,
      };
      const a1 = new wd.TouchAction(this);
      a1.press({ el, x: center.x, y: center.y - 100 })
        .moveTo({ el })
        .release();
      const a2 = new wd.TouchAction(this);
      a2.press({ el, x: center.x, y: center.y + 100 })
        .moveTo({ el })
        .release();
      const m = new wd.MultiAction(this);
      m.add(a1, a2);
      return m.perform();
    }.bind(this),
  );
};

exports.zoom = function(el) {
  return Q.all([this.getWindowSize(), this.getLocation(el)]).then(
    function(res) {
      const size = res[0];
      const loc = res[1];
      const center = {
        x: loc.x + size.width / 2,
        y: loc.y + size.height / 2,
      };
      const a1 = new wd.TouchAction(this);
      a1.press({ el })
        .moveTo({ el, x: center.x, y: center.y - 100 })
        .release();
      const a2 = new wd.TouchAction(this);
      a2.press({ el })
        .moveTo({ el, x: center.x, y: center.y + 100 })
        .release();
      const m = new wd.MultiAction(this);
      m.add(a1, a2);
      return m.perform();
    }.bind(this),
  );
};
