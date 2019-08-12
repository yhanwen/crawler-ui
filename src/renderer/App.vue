<template>
<div id="app">
  <div class="window-title" :class="{'show-btn': !isMacintosh}">
    {{this.title}}
  </div>
  <router-view></router-view>
</div>
</template>

<script>
import { mapState } from 'vuex';
import platform from '../utils/platform';
export default {
  name: 'CrawlerUI',
  data() {
    return {
      isMacintosh: platform.isMacintosh,
    };
  },
  computed: {
    ...mapState('Tabs', {
      title: (state) => {
        const group = state.groups[state.activeGroup];
        let title = 'CrawlerUI';
        if (!group) {
          return title;
        }
        group.tabs.forEach((tab) => {
          if (tab.name === group.active) {
            title = `${tab.title}-${title}`;
          }
        });
        return title;
      },
    }),
  },
};
</script>


<style lang="less">
@import './assets/styles/vars.less';
@import './assets/styles/mixins.less';
body {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}
/* CSS */
.window-title {
  height: @titleHeight;
  background: @gray-darker;
  position: absolute;
  top:0;
  left:0;
  right: 0;
  color: @white;
  text-align: center;
  z-index: 200;
  font-size: 12px;
  color: @gray-light;
  line-height: @titleHeight;
}

.tag-ghost {
  font-size: 12px;
  margin: 0px 4px 4px 0;
  display: inline-block !important;
  padding: 0px 5px;
  border-radius: 3px;
  border: solid 1px fadeout(@white, 40);
  background: fadeout(@white, 94);
  color: fadeout(@white, 20);
  cursor: pointer;
  opacity: 0.6;
}
</style>
