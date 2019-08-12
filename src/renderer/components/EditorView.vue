<template>
<div class="editor-view-wrapper">
  <div class="tools">
    <el-button type="primary" @click="createConfig">从当前页面创建</el-button>
    <el-upload
      class="upload-btn"
      accept=".json"
      action=""
      :show-file-list="false"
      :auto-upload="false"
      :on-change="importConfig">
      <el-button type="default">导入配置文件</el-button>
    </el-upload>
    
    <el-button type="default" @click="exportConfig">导出配置文件</el-button>
  </div>
  <div class="page-item" v-for="(page, pageIndex) in confData" :key="page.pattern">
    <el-form ref="form" label-width="80px" size="mini">
      <el-form-item label="URL">
        <el-input :value="page.example_url" @input="handleBaseChange('example_url', pageIndex, $event)">
          <el-button slot="append" icon="el-icon-right" @click="syncBrowserPage(page.example_url)"></el-button>
        </el-input>
      </el-form-item>
      <el-form-item label="名称">
        <el-input :value="page.name" @input="handleBaseChange('name', pageIndex, $event)"></el-input>
      </el-form-item>
      <el-form-item label="默认字段">
        <el-radio-group :value="page.default_fields" @input="handleBaseChange('default_fields', pageIndex, $event)">
          <el-radio :label="true"></el-radio>
          <el-radio :label="false"></el-radio>
        </el-radio-group>
      </el-form-item>
      <div class="item-group" v-for="{items, key} in page.rules" :key="key">
        <el-form-item label="Section">
          <el-input :value="key"></el-input>
        </el-form-item>
        <div class="items">
          <div class="item" v-for="(item, itemIndex) in items" :key="item.itemIndex">
            <div class="item-ops">
              <el-button type="text" icon="el-icon-delete" @click="handleDel(pageIndex, key, itemIndex)">删除</el-button>
            </div>
            <el-form-item label="Type">
              <el-select :value="item.type" @input="handleItemChange('type', pageIndex, key, itemIndex, $event)">
                <el-option
                  v-for="op in typeOptions.filter((o)=>{return !(o==='dom'&&key!=='root')})"
                  :key="op"
                  :label="op"
                  :value="op">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Key">
              <el-input :value="item.key" @input="handleItemChange('key', pageIndex, key, itemIndex, $event)"></el-input>
            </el-form-item>
            <el-form-item label="XPath">
              <el-input :value="item.xpath" type="textarea" @input="handleItemChange('xpath', pageIndex, key, itemIndex, $event)"></el-input>
            </el-form-item>
            <div class="inspect">
              <el-button type="text" 
                :class="{active: currentInspectItem.pageIndex===pageIndex && currentInspectItem.key===key && currentInspectItem.itemIndex===itemIndex}" 
                icon="el-icon-thumb" @click="handleStartInspect(pageIndex, key, itemIndex)">选择元素</el-button>
              <el-button type="text" icon="el-icon-top" @click="handleItemChange('xpath', pageIndex, key, itemIndex, item.xpath.replace(/\/\/?([^\/]+)$/,''))">向上一层</el-button>
            </div>
            <el-form-item label="Regex" v-if="item.type && item.type.match(/(html|text)/)">
              <el-input :value="item.re" type="textarea" @input="handleItemChange('re', pageIndex, key, itemIndex, $event)"></el-input>
            </el-form-item>
          </div>
          <div class="actions">
            <el-button type="text" icon="el-icon-plus" @click="addItem([pageIndex, key])">添加元素</el-button>
          </div>
        </div>

      </div>
    </el-form>
  </div>
</div>
</template>

<script>
import {
  mapActions,
  mapState,
} from 'vuex';
export default {
  data() {
    return {
      typeOptions: [
        'text', 'html', 'dom', 'url',
      ],
    };
  },
  mounted() {
    this.clearInspect();
  },
  computed: {
    ...mapState('Crawler', {
      originConf: state => state.confData[0],
      confData: (state) => {
        const pages = JSON.parse(JSON.stringify(state.confData));
        pages.forEach((res) => {
          res.rules = Object.keys(res.rules || {}).map((key) => {
            const items = res.rules[key];
            items.forEach((item) => {
            // eslint-disable-next-line prefer-destructuring
              const re = item.re;
              if (re) {
                item.re = re.join('\n');
              }
            });
            return {
              key,
              items,
            };
          }).sort((a, b) => {
            if (a.key === 'root') {
              return -1;
            }
            if (b.key === 'root') {
              return 1;
            }
            if (a.key > b.key) {
              return -1;
            }
            return 1;
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
    ...mapActions('Crawler', ['handleFieldChange', 'addItem', 'startInspectMode', 'setInspectItemResult', 'handleDelItem', 'setImportedConf', 'handleBaseFieldsChange']),
    handleStartInspect(...args) {
      this.startInspectMode(args);
      const [pageIndex] = args;
      this.syncBrowserPage(this.confData[pageIndex].example_url);
      this.$emit('inspect', this.confData[pageIndex].example_url);
    },
    handleDel(...args) {
      this.handleDelItem(args);
    },
    handleBaseChange(...args) {
      this.handleBaseFieldsChange(args);
      // eslint-disable-next-line no-unused-vars
      const [field, pageIndex, val] = args;
      if (this.changeTimeout) {
        clearTimeout(this.changeTimeout);
      }
      this.changeTimeout = setTimeout(() => {
        if (field === 'example_url' && val) {
          this.syncBrowserPage(val);
        }
        this.changeTimeout = null;
      }, 1000);
    },
    handleItemChange(...args) {
      this.handleFieldChange(args);
      if (this.changeTimeout) {
        clearTimeout(this.changeTimeout);
      }
      this.changeTimeout = setTimeout(() => {
        if (this.originConf.example_url) {
          this.syncBrowserPage(this.originConf.example_url);
        }
        this.changeTimeout = null;
      }, 3000);
    },
    clearInspect() {
      this.startInspectMode([-1, -1, -1]);
    },
    setInspectResult(xpath) {
      this.setInspectItemResult(xpath);
      this.syncBrowserPage();
    },
    syncBrowserPage(url) {
      if (url) {
        this.currentPageUrl = url;
      }
      this.$emit('load-page', this.currentPageUrl);
    },
    createConfig() {
      this.$emit('create');
    },
    importConfig(file) {
      if (this.currentFile === file.raw) {
        return;
      }
      this.currentFile = file.raw;
      if (!this.currentFile) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        this.setImportedConf(JSON.parse(data));
        if (this.originConf.example_url) {
          this.syncBrowserPage(this.originConf.example_url);
        }
      };
      reader.readAsText(this.currentFile);
    },
    exportConfig() {
      const filename = `conf_file_${this.originConf.name}`;
      const blob = new Blob([JSON.stringify(this.originConf, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.setAttribute('download', `${filename}.json`);
      document.body.appendChild(link);
      link.click();
    },
  },

};
</script>

<style lang="less">
@import '../assets/styles/vars.less';
@import '../assets/styles/mixins.less';

.editor-view-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  .tools {
    display: flex;
    justify-content: space-around;
    background: @gray-dark;
    border-bottom: solid 1px @gray;
    > * {
      flex: 1 1 33.3333%;
    }
    .el-upload {
      width: 100%;
    }
    button {
      width: 100%;
    }
  }
  .page-item {
    padding: 25px;

    .el-input-group__append,
    .el-input-group__prepend {
      background: @gray-dark;
      color: @white;

      &:hover {
        background: @gray-darker;
      }
    }

    .item-group {
      margin: 0px -10px 10px;
      padding: 10px;
      border: solid 1px @gray;
    }

    .items {
      margin: 20px 0 0;

      .item {
        padding: 20px;
        border: solid 1px @gray-dark;
        background: @gray-dark;
        margin-bottom: 10px;
        .item-ops {
          text-align: right;
          margin-top: -20px;
        }

        .inspect {
          margin-left: 80px;
          position: relative;
          top: -20px;

          .active {
            color: @red;
          }
        }
      }
    }
  }
}
</style>
