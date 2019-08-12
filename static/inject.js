/* eslint-disable */
const { ipcRenderer } = require('electron')
const { getRelPath } = require('./helper/utils');
const { addRect, startInspect, stopInspect } = require('./helper/highlight');
console.log('init....', +new Date);
ipcRenderer.on('current-conf', (e, confStr) => {
  const conf = JSON.parse(confStr);
  const domRoot = {};
  Object.keys(conf.rules).forEach((key) => {
    const objs = conf.rules[key];
    const markItems = (items, basePath) => {
      items.forEach(item => {
        if(basePath) {
          item.xpath = item.xpath.replace(/^\./, basePath);
        }
        if(item.type === 'url') {
          item.xpath = item.xpath.replace(/\/@href$/, '');
        }
        addRect(item);
        if(item.type === 'dom') {
          if(item.key && conf.rules[item.key]) {
            markItems(conf.rules[item.key], item.xpath);
          }
        }
      });
    }
    if(key === 'root') {
      markItems(objs);
    }
  })
  
  // items.forEach()
  // ipcRenderer.sendToHost('pong')
});
ipcRenderer.on('get-rel-path', (e, confStr) => {
  const conf = JSON.parse(confStr);
  getRelPath(conf, (xpath) => {
    ipcRenderer.sendToHost('inspect-result', xpath, true)
  });
});
ipcRenderer.on('start-inspect', (e, confStr) => {
  startInspect((xpath) => {
    ipcRenderer.sendToHost('inspect-result', xpath)
  });
  setTimeout(() => {
    ipcRenderer.sendToHost('inspect-started')
  }, 2000);
});
ipcRenderer.on('stop-inspect', (e, confStr) => {
  stopInspect();
});

