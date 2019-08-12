export default {
  async openLabel(inst) {
    await inst.$store.dispatch('Connections/connectConnection', inst.$store.state.Connections.connections[0]);
    await inst.$store.dispatch('Tabs/openNewTab', {
      title: 'label#Item',
      component: 'query',
      props: {
        cypher: 'MATCH (n)-[r]-(m) RETURN n, r, m LIMIT 100',
      },
    });
  },
  async openEditor(inst) {
    await inst.$store.dispatch('Connections/connectConnection', inst.$store.state.Connections.connections[0]);
    await inst.$store.dispatch('Tabs/openNewTab', {
      title: 'label#Item',
      component: 'query',
      props: {
        cypher: '',
      },
    });
  },
  async open218Schema(inst) {
    await inst.$store.dispatch('Connections/connectConnection', inst.$store.state.Connections.connections[2]);
  },
};

