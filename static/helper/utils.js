function getElementByXpath(path) {
  const res = [];
  const a = document.evaluate(path, document);
  let item;
  // eslint-disable-next-line no-cond-assign
  while (item = a.iterateNext()) {
    res.push(item);
  }
  if (!res.length) {
    return null;
  }
  return res.length === 1 ? res[0] : res;
}
const MAXTIME = 20000;
function waitForElement(path, cb, timeDur) {
  timeDur = timeDur || +new Date();
  const now = +new Date();
  const res = getElementByXpath(path);
  if (now - timeDur > MAXTIME) {
    cb(res);
    return;
  }
  if (!res) {
    setTimeout(() => {
      waitForElement(path, cb, timeDur);
    }, 500);
  } else {
    setTimeout(() => {
      cb(getElementByXpath(path));
    }, 1000);
  }
}

function getRelPath({ root, xpath }, cb) {
  const res = getElementByXpath(root);
  const rootEls = res.forEach ? res : [res];
  const tryRun = (curPath) => {
    const res = getElementByXpath(curPath);
    const tryEl = res.forEach ? res[0] : res;
    if (tryEl === rootEls || rootEls.indexOf(tryEl) > -1) {
      return curPath;
    }
    const nextPath = curPath.replace(/\/[^\/]*$/, '');
    if (nextPath === curPath) {
      return xpath;
    }
    return tryRun(nextPath);
  };
  const rootPath = tryRun(xpath);
  cb(xpath.replace(rootPath, './').replace(/\/$/, ''));
}
module.exports = {
  getElementByXpath,
  waitForElement,
  getRelPath,
};

