// Inject node globals into React Native global scope.
global.Buffer = require('buffer').Buffer;
global.process = require('process');

if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = class TextEncoder {
    encode(value = "") {
      return Buffer.from(String(value), "utf-8");
    }
  };
}

if (typeof btoa === 'undefined') {
  global.btoa = function (str) {
    return new Buffer.from(str, 'binary').toString('base64');
  };
}

if (typeof atob === 'undefined') {
  global.atob = function (b64Encoded) {
    return new Buffer.from(b64Encoded, 'base64').toString('binary');
  };
}
