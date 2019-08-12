import Vue from 'vue';
const state = {
  currentInspectItem: null,
  cache: {},
  confData: [{
    name: 'article',
    example_url: 'http://www.newsmth.net/nForum/article/AI/65703',
    default_fields: true,
    rules: {
      root: [
        {
          type: 'url',
          key: 'article',
          xpath: "//div[@class='t-pre']//li/a/@href",
        },
        {
          type: 'dom',
          key: 'posts',
          xpath: "//table[contains(concat(' ', @class, ' '), ' article ')]",
        },
      ],
      posts: [
        {
          type: 'text',
          key: 'text',
          xpath: ".//td[contains(concat(' ', @class, ' '), ' a-content ')]",
        },
        {
          type: 'html',
          key: 'meta',
          xpath: ".//td[contains(concat(' ', @class, ' '), ' a-content ')]",
          re: [
            '发信人:(?P<author>.+?)\\((?P<nick>.*?)\\).*?信区:(?P<board>.+?)<br/>',
            '标  题:(?P<title>.+?)<br/>',
            '发信站:(?P<site>.+?)\\((?P<time>.+?)\\)',
            '\\[FROM: (?P<ip>[\\d\\.\\*]+?)\\]',
          ],
        },
        {
          type: 'text',
          key: 'floor',
          xpath: ".//span[contains(@class, 'a-pos')]",
          re: ['(\\d+|楼主)'],
          js: "function process(s){if(s=='楼主') return '0'; return s;}",
        },
      ],
    },
    js: '',
  }],
};

const mutations = {
  SETITEMFIELD(state, [field, pageIndex, key, itemIndex, val]) {
    const item = state.confData[pageIndex].rules[key][itemIndex];
    if (item.type === 'dom' && field === 'key') {
      const domItems = state.confData[pageIndex].rules[item.key] || [];
      delete state.confData[pageIndex].rules[item.key];
      Vue.set(state.confData[pageIndex].rules, val, domItems);
    }
    const cacheKey = [pageIndex, key, item.key].join('_');
    if (field === 'type' && val === 'dom' && item.key) {
      const domItems = state.confData[pageIndex].rules[item.key] || state.cache[cacheKey] || [];
      Vue.set(state.confData[pageIndex].rules, item.key, domItems);
    }
    if (field === 'type' && val !== 'dom' && item.key && state.confData[pageIndex].rules[item.key]) {
      state.cache[cacheKey] = state.confData[pageIndex].rules[item.key];
      delete state.confData[pageIndex].rules[item.key];
    }
    item[field] = val;
  },
  SETBASEFIELD(state, [field, pageIndex, val]) {
    state.confData[pageIndex][field] = val;
  },
  ADDITEM(state, [pageIndex, key]) {
    const arr = state.confData[pageIndex].rules[key] || [];
    arr.push({
      type: 'text',
      key: '',
      xpath: '',
      re: ['(.+)'],
      js: '',
    });
    Vue.set(state.confData[pageIndex].rules, key, arr);
  },
  STARTINSPECT(state, [pageIndex, key, itemIndex]) {
    if (pageIndex === -1) {
      state.currentInspectItem = null;
      return;
    }
    state.currentInspectItem = {
      pageIndex,
      key,
      itemIndex,
    };
  },
  SETINSPECTITEMRESULT(state, xpath) {
    const { pageIndex, itemIndex, key } = state.currentInspectItem;
    state.currentInspectItem = null;
    const isURL = state.confData[pageIndex].rules[key][itemIndex].type === 'url';
    state.confData[pageIndex].rules[key][itemIndex].xpath = xpath + (isURL ? '/@href' : '');
  },
  SETIMPORTEDCONF(state, conf) {
    Vue.set(state.confData, '0', conf);
  },
  DELETEITEM(state, [pageIndex, key, itemIndex]) {
    const item = state.confData[pageIndex].rules[key][itemIndex];
    if (item.type === 'dom') {
      delete state.confData[pageIndex].rules[item.key];
    }
    state.confData[pageIndex].rules[key].splice(itemIndex, 1);
  },
};

const actions = {
  setImportedConf({ commit }, data) {
    commit('SETIMPORTEDCONF', data);
  },
  createFromUrl({ commit }, url) {
    commit('SETIMPORTEDCONF', {
      name: 'article',
      example_url: url,
      default_fields: true,
      rules: {
        root: [
        ],
      },
      js: '',
    });
  },
  handleFieldChange({ commit }, [field, pageIndex, key, itemIndex, val]) {
    if (field === 're') {
      val = val.split('\n');
    }
    commit('SETITEMFIELD', [field, pageIndex, key, itemIndex, val]);
  },
  handleBaseFieldsChange({ commit }, [field, pageIndex, val]) {
    if (field === 're') {
      val = val.split('\n');
    }
    commit('SETBASEFIELD', [field, pageIndex, val]);
  },
  handleDelItem({ commit }, [pageIndex, key, itemIndex]) {
    commit('DELETEITEM', [pageIndex, key, itemIndex]);
  },
  addItem({ commit }, [pageIndex, key]) {
    commit('ADDITEM', [pageIndex, key]);
  },
  startInspectMode({ commit }, [pageIndex, key, itemIndex]) {
    commit('STARTINSPECT', [pageIndex, key, itemIndex]);
  },
  setInspectItemResult({ commit }, xpath) {
    commit('SETINSPECTITEMRESULT', xpath);
  },
  someAsyncTask({ commit }) {
    // do something async
    commit('INCREMENT_MAIN_COUNTER');
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
