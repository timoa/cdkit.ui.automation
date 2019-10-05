const { expect } = require('chai');
const lib = require('../lib/utils');

// Lib > Utils
describe('Utils library', () => {
  describe('getDeviceOutputFolder()', () => {
    it('expect the "getDeviceOutputFolder()" to exists and be a function', done => {
      expect(typeof lib.getDeviceOutputFolder).to.be.equals('function');
      done();
    });
    it('expect the "getDeviceOutputFolder()" function to be equal to `iphone-xr-12.4`', done => {
      expect(lib.getDeviceOutputFolder('iPhone Xr', '12.4')).to.be.equals('iphone-xr-12.4');
      done();
    });
    it('expect the "getDeviceOutputFolder()" function to be equal to `ipad-pro-12.9-inch-2nd-generation-12.4`', done => {
      expect(lib.getDeviceOutputFolder('iPad Pro (12.9-inch) (2nd generation)', '12.4')).to.be.equals('ipad-pro-12.9-inch-2nd-generation-12.4');
      done();
    });
  });
});
