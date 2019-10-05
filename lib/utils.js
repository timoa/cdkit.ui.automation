const Utils = {};


Utils.getDeviceOutputFolder = (device, osVersion) => {
  let name = `${device.toLowerCase()}-${osVersion}`;
  name = name.replace(/[()]/g, '');
  name = name.replace(/[\s]/g, '-');

  return name;
};

module.exports = Utils;
