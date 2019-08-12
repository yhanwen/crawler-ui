/* eslint-disable no-underscore-dangle */
const LANGUAGE_DEFAULT = 'en';

let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;
let _isNative = false;
let _isWeb = false;
let _locale;
let _language = LANGUAGE_DEFAULT;

const isElectronRenderer = (typeof process !== 'undefined' && typeof process.versions !== 'undefined' && typeof process.versions.electron !== 'undefined' && process.type === 'renderer');

// OS detection
if (typeof navigator === 'object' && !isElectronRenderer) {
  // eslint-disable-next-line prefer-destructuring
  const userAgent = navigator.userAgent;
  _isWindows = userAgent.indexOf('Windows') >= 0;
  _isMacintosh = userAgent.indexOf('Macintosh') >= 0;
  _isLinux = userAgent.indexOf('Linux') >= 0;
  _isWeb = true;
  _locale = navigator.language;
  _language = _locale;
} else if (typeof process === 'object') {
  _isWindows = (process.platform === 'win32');
  _isMacintosh = (process.platform === 'darwin');
  _isLinux = (process.platform === 'linux');
  _locale = LANGUAGE_DEFAULT;
  _language = LANGUAGE_DEFAULT;
  _isNative = true;
}

export default {
  isWindows: _isWindows,
  isMacintosh: _isMacintosh,
  isLinux: _isLinux,
  isNative: _isNative,
  isWeb: _isWeb,
  locale: _locale,
  language: _language,
};
