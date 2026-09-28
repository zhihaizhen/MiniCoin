const FILE_MAP = {
  "index.css": "index.css",
};

const BASE_PATH = {
  CSS: "/static/common/base/css/",
  JS: "/static/common/base/js/",
};

const STATUS = { PENDING: "PENDING", DONE: "DONE" };

const loader = {
  fileStatus: {},
  callbacks: {},

  subscribe(fileName, cb) {
    if (this.fileStatus[fileName] === STATUS.DONE) {
      cb?.();
      return;
    }
    (this.callbacks[fileName] ||= []).push(cb);
  },

  markDone(fileName) {
    this.fileStatus[fileName] = STATUS.DONE;
    const queue = this.callbacks[fileName] || [];
    while (queue.length) queue.shift()();
  },
};

function injectScript(fileName, url) {
  const el = document.createElement("script");
  el.type = "text/javascript";
  // IE readyState fallback
  if (el.readyState) {
    el.onreadystatechange = () => {
      if (el.readyState === "loaded" || el.readyState === "complete") {
        el.onreadystatechange = null;
        loader.markDone(fileName);
      }
    };
  } else {
    el.onload = () => loader.markDone(fileName);
  }
  el.src = url;
  document.head.appendChild(el);
}

function injectStylesheet(url) {
  const el = document.createElement("link");
  el.rel = "stylesheet";
  el.type = "text/css";
  el.media = "screen";
  el.href = url;
  document.head.appendChild(el);
}

// Poll for a known CSS variable to detect when index.css has applied
function waitForCssReady(fileName) {
  const check = () => {
    const body = document.body;
    const loaded = body
      ? getComputedStyle(body).getPropertyValue("--re-rui-brand-main").trim()
      : "";
    loaded ? loader.markDone(fileName) : setTimeout(check, 50);
  };
  setTimeout(check, 50);
}

function loadFile(fileName, cb) {
  const mapped = FILE_MAP[fileName];
  if (!mapped) return;

  if (cb) loader.subscribe(fileName, cb);
  if (loader.fileStatus[fileName]) return; // already loading or done

  loader.fileStatus[fileName] = STATUS.PENDING;

  if (mapped.endsWith(".js")) {
    injectScript(fileName, BASE_PATH.JS + mapped);
  } else {
    if (fileName === "index.css") waitForCssReady(fileName);
    injectStylesheet(BASE_PATH.CSS + mapped);
  }
}

/**
 * Load base assets. Called automatically on script load.
 *
 * @param {Array<{fileName: string, callback: Function}>} [files]
 *   Pass a specific list to load selectively with callbacks,
 *   or omit to load all files in FILE_MAP.
 *
 * @example
 *   // Load everything (auto-called)
 *   Base()
 *
 *   // Load with callback
 *   Base([{ fileName: 'index.css', callback: () => console.log('ready') }])
 */
window.Base = function (files) {
  if (Array.isArray(files)) {
    files.forEach(
      ({ fileName, callback }) => fileName && loadFile(fileName, callback),
    );
  } else {
    Object.keys(FILE_MAP).forEach((fileName) => loadFile(fileName));
  }
};

Base();
