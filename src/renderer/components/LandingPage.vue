<template>
  <div class="crawlerui-home">
    <vis ref="vis" />
  </div>
</template>

<script>
  import { mapActions, mapState } from 'vuex';
  import Vis from './Vis';

  export default {
    name: 'landing-page',
    components: { Vis },
    data() {
      return {
      };
    },
    async mounted() {
      await this.getAllSchema();
    },
    computed: {
      ...mapState('Neo4j', {
        visData: state => state.allSchemas,
      }),
    },
    methods: {
      ...mapActions('Neo4j', ['getAllSchema']),
    },
    watch: {
      visData: {
        handler(newVal) {
          if (this.$refs.vis) {
            this.$refs.vis.setDataSet(newVal);
          }
        },
        immediate: true,
        deep: true,
      },
    },
  };
</script>

<style lang="less">
  @import '../assets/styles/vars.less';
  @import '../assets/styles/mixins.less';
  .crawlerui-home {
    position: absolute;
    top:0;
    left:0;
    right:0;
    bottom:0;
    background: @gray-dark;
  }
</style>
