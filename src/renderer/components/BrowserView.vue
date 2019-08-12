<template>
  <div class="browser-view-wrapper" v-loading="loading" ref="wrapper" @keydown="handleSubmit">
    <div class="url-bar">
      <div class="input-wrapper">
        <el-input v-model="url" placeholder="请输入URL"></el-input>
      </div>
      <div class="actions"></div>
    </div>
    <webview frameborder="0" name="test" ref="frame" :preload="scriptPath"></webview>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

const isDev = process.env.NODE_ENV === 'development';
// eslint-disable-next-line import/no-extraneous-dependencies
export default {
  data() {
    return {
      url: '',
      loading: false,
    };
  },
  mounted() {
    this.initWebView();
    if (this.confData[0].example_url) {
      this.loadPage(this.confData[0].example_url);
    }
  },
  computed: {
    ...mapState('Crawler', {
      confData: state => state.confData,
      currentInspectItem: state => state.currentInspectItem,
    }),
    scriptPath() {
      // eslint-disable-next-line no-restricted-globals
      const winURL = isDev
        ? `file://${process.cwd()}/static/inject.js`
        : `file://${__dirname}/static/inject.js`;
      return winURL;
    },
  },
  methods: {
    ...mapActions('Crawler', []),
    getPageConf(url) {
      const res = this.confData.filter(c => c.example_url === url);
      console.log('pageConf', res, url);
      return res.length ? res[0] : null;
    },
    startInspect() {
      const start = () => {
        this.inspectStarted = true;
        this.webview.send('start-inspect');
        this.webview.focus();
      };
      const handleInpectStarted = (e) => {
        const {
          channel,
        } = e;
        if (channel === 'inspect-started') {
          this.webview.removeEventListener('dom-ready', start);
          this.webview.removeEventListener('ipc-message', handleInpectStarted);
        }
      };
      this.webview.addEventListener('ipc-message', handleInpectStarted);
      this.webview.addEventListener('dom-ready', start);
    },
    endInspect() {
      // this.webview.focus();
      this.webview.send('end-inspect');
    },
    initWebView() {
      this.webview = this.$refs.frame;
      const loadstart = () => {
        this.loading = true;
      };

      const loadstop = () => {
        this.loading = false;
      };
      // const mousemove = (e) => {
      //   const { offsetX: x, offsetY: y } = e;
      //   const res = this.webview.inspectElement(x, y);
      //   console.log(res);
      // };
      // console.log(this.webview);
      this.webview.addEventListener('dom-ready', () => {
        this.loading = false;
        if (isDev) {
          this.webview.openDevTools();
        }
        if (this.conf && !this.inspectStarted) {
          this.webview.send('current-conf', JSON.stringify(this.conf));
        }
      });
      this.webview.addEventListener('did-start-loading', loadstart);
      this.webview.addEventListener('did-stop-loading', loadstop);
      // setTimeout(() => {
      //   this.webview.loadURL('https://36kr.com');
      // }, 2000);
      this.webview.addEventListener('new-window', (e) => {
        this.url = e.url;
        this.loadPage();
      });
      this.webview.addEventListener('will-navigate', (e) => {
        this.url = e.url;
        // this.loadPage();
      });
      this.webview.addEventListener('ipc-message', (event) => {
        console.log(event);
      // Prints "pong"
      });
    // this.webview.addEventListener('mousemove', mousemove);
    },
    handleSubmit(e) {
      if (e.code === 'Enter') {
        this.loadPage();
      }
    },
    loadPage(url) {
      if (url) {
        this.url = url;
      }
      if (!this.url) {
        return;
      }
      if (!this.url.match(/^https?:\/\/.+/)) {
        this.url = `http://${this.url}`;
      }

      this.webview.src = this.url;
      // this.webview.focus();

      this.conf = this.getPageConf(this.url);
    },
  },
};
</script>

<style lang="less">
@import "../assets/styles/vars.less";
@import "../assets/styles/mixins.less";

.browser-view-wrapper {
  position: absolute;
  top:0;
  left:0;
  right: 0;
  bottom: 0;
  background: @white;
  display: flex;
  flex-direction: column;
  webview {
    width: 100%;
    height: 100%;
  }
}
</style>
