<template>
<div class="crawlerui-frame-page">
  <div class="side-wrapper">
    <editor-view @load-page="loadPage" @inspect="focusBrowser" ref="editor" @create="createConf" :browserUrl="browserUrl"/>
  </div>
  <div class="main-wrapper">
    <browser-view ref="browser"/>
  </div>
</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import BrowserView from '../components/BrowserView';
import EditorView from '../components/EditorView';
// import AutoRun from '../../../test/scripts/autorun';
import '../assets/icons/style.css';
export default {
  name: 'landing-page',
  components: {
    BrowserView,
    EditorView,
  },
  data() {
    return {};
  },
  async mounted() {
    if (process.env.NODE_ENV === 'development') {
      // 开发环境启动自动执行的脚本
      // AutoRun.open218Schema(this);
      // AutoRun.openLabel(this);
      // AutoRun.openEditor(this);
    }
  },
  computed: {
    ...mapState('Crawler', {
      confData: (state) => {
        const pages = JSON.parse(JSON.stringify(state.confData));
        pages.forEach((res) => {
          Object.keys(res.rules || {}).forEach((key) => {
            const items = res.rules[key];
            items.forEach((item) => {
            // eslint-disable-next-line prefer-destructuring
              const re = item.re;
              if (re) {
                item.re = re.join('\n');
              }
            });
          });
        });
        return pages;
      },
      currentInspectItem: state => state.currentInspectItem || {
        pageIndex: -1,
        itemIndex: -1,
        key: '',
      },
    }),
  },
  methods: {
    ...mapActions('Crawler', ['createFromUrl']),
    loadPage(url) {
      this.$refs.browser.loadPage(url);
    },
    focusBrowser(url) {
      this.$refs.browser.loadPage(url);
      this.$refs.browser.startInspect();
      const handleInpectResult = (e) => {
        const {
          channel,
          args: [xpath, isRel],
        } = e;
        if (channel === 'inspect-result') {
          console.log(xpath, isRel);
          const { pageIndex, key } = this.currentInspectItem;
          if (key !== 'root' && !isRel) {
            this.confData[pageIndex].rules.root.forEach((item) => {
              if (item.key === key) {
                this.$refs.browser.webview.send('get-rel-path', JSON.stringify({
                  root: item.xpath,
                  xpath,
                }));
              }
            });
            return;
          }
          this.$refs.browser.inspectStarted = false;
          this.$refs.editor.setInspectResult(xpath);
          this.$refs.browser.webview.removeEventListener('ipc-message', handleInpectResult);
        }
      };
      this.$refs.browser.webview.addEventListener('ipc-message', handleInpectResult);
    },
    createConf() {
      // eslint-disable-next-line prefer-destructuring
      const url = this.$refs.browser.url;
      if (!url) {
        return;
      }
      this.createFromUrl(url);
    },
  },
  watch: {},
};
</script>

<style lang="less">
@import '../assets/styles/vars.less';
@import '../assets/styles/mixins.less';
* {
  outline-width: 0;
}
html,
body {
  width: 100%;
  height: 100%;
  position: relative;
  margin: 0;
  padding: 0;
  font-weight: 400;
  font-family: PingFang SC,Lantinghei SC,Helvetica Neue,Helvetica,Arial,Microsoft YaHei,"\5FAE\8F6F\96C5\9ED1",STHeitiSC-Light,simsun,"\5B8B\4F53",WenQuanYi Zen Hei,WenQuanYi Micro Hei,"sans-serif";
}

.crawlerui-frame-page {
  position: absolute;
  top: @titleHeight;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  background: @gray-dark;
  .side-wrapper {
    flex: 0 0 400px;
    background: lighten(@gray-dark, 2);
    -webkit-app-region: no-drag;
    position: relative;
  }

  .main-wrapper {
    width: 100%;
    position: relative;
    -webkit-app-region: no-drag;
  }
}
</style>
