/* eslint-disable no-use-before-define */

const utils = require('./utils');
const RECTCLS = '---rect-wrapper';
const INSPECTRECTCLS = '---inspectwrapper';
let inspectCallback;
// function getId(field) {
//   return `$$$$$${field}`;
// }
let inspectStyleSheet = null;
function addInspectStyleSheet() {
  inspectStyleSheet = document.createElement('style');
  inspectStyleSheet.innerHTML = `
    * {
      cursor: pointer !important;
    }
    .${INSPECTRECTCLS} {
      position: absolute;
      background: rgba(100, 50, 0, 0.1);
      border: solid 1px rgba(100, 50, 0, 0.4);
      color: rgba(100, 50, 0, 1);
      pointer-events: none;
      z-index: 10000; 
      top: 0;
      left: 0;
    }
    .${RECTCLS} {
      display: none;
    }
  `;
  document.body.appendChild(inspectStyleSheet);
}

let inspectRect = null;
function addInspectRect(sourceEl) {
  sourceEl.removeEventListener('click', handleInspectEndEvent);
  sourceEl.addEventListener('click', handleInspectEndEvent);
  const $ = require('./jquery');
  const targetEl = $(sourceEl);
  const offsetWidth = targetEl.outerWidth();
  const offsetHeight = targetEl.outerHeight();
  const { top: offsetTop, left: offsetLeft } = targetEl.offset();
  if (!inspectRect) {
    inspectRect = document.createElement('DIV');
    inspectRect.className = INSPECTRECTCLS;
    document.body.appendChild(inspectRect);
  }
  const el = inspectRect;
  el.style = `width: ${offsetWidth}px; height: ${offsetHeight}px; top: ${offsetTop}px; left: ${offsetLeft}px;`;
}

function removeInspectStyleSheet() {
  document.body.removeChild(inspectStyleSheet);
  document.body.removeChild(inspectRect);
  inspectRect = null;
}


function handleInspectEvent(e) {
  const sourceEl = e.target;
  addInspectRect(sourceEl);
}
function handleInspectEndEvent(e) {
  e.preventDefault();
  e.stopPropagation();
  const getXPath = require('./getXPath');
  const sourceEl = e.target;
  e.currentTarget.removeEventListener('click', handleInspectEndEvent);
  inspectCallback(getXPath(sourceEl));
  // eslint-disable-next-line no-use-before-define
  stopInspect();
}

function parseFromHTML(html, re) {
  const fields = (re.match(/\?P<.+?>/g) || []).map(str => str.replace('?P<', '').replace('>', ''));
  const result = {};
  const reg = new RegExp(re.replace(/\?P<.+?>/g, ''));
  const matchResult = html.match(reg) || [];
  if (!fields.length) {
    return matchResult[1] || matchResult[0];
  }
  fields.forEach((f, i) => {
    const text = matchResult[i + 1] || '';
    result[f] = text;
  });
  return result;
}


function addRect(item) {
  const $ = require('./jquery');
  const {
    xpath, key, re,
  } = item;
  if (!xpath) {
    return;
  }
  utils.waitForElement(xpath, (elems) => {
    const targetEls = $(elems);
    // eslint-disable-next-line func-names
    targetEls.each(function () {
      const targetEl = $(this);
      const offsetWidth = targetEl.outerWidth();
      const offsetHeight = targetEl.outerHeight();
      const { top: offsetTop, left: offsetLeft } = targetEl.offset();
      const el = document.createElement('DIV');
      el.className = RECTCLS;
      // el.id = getId(key);
      el.innerHTML = `<span style="background:#000;color:#fff; position: absolute; top:0; left:0; font-size:12px; padding:0 10px;">${key}</span>`;
      el.style = `z-index: 10000; width: ${offsetWidth}px; height: ${offsetHeight}px; top: ${offsetTop}px; left: ${offsetLeft}px; position: absolute; background: rgba(100, 0, 0, 0.1); border: solid 1px rgba(100, 0, 0, 0.4); color: rgba(100, 0, 0, 1); `;
      // console.log(el, targetEl.parentNode);
      // window.test = targetEl.parentNode;
      // window.testa = el;
      el.title = '';
      document.body.appendChild(el);
      if (re && re.length) {
        re.forEach((reStr) => {
          const res = parseFromHTML(targetEl.html(), reStr);
          el.title += `${JSON.stringify(res, null, 2)}\n`;
        });
      }
    });
  });
}
function clearRect() {
  const $ = require('./jquery');
  $(`.${RECTCLS}`).remove();
}

function startInspect(cb) {
  inspectCallback = cb;
  addInspectStyleSheet();
  clearRect();
  document.addEventListener('mousemove', handleInspectEvent);
  document.addEventListener('click', handleInspectEndEvent);
}

function stopInspect() {
  removeInspectStyleSheet();
  document.removeEventListener('mousemove', handleInspectEvent);
  document.removeEventListener('click', handleInspectEndEvent);
}

module.exports = {
  addRect,
  clearRect,
  startInspect,
  stopInspect,
};

