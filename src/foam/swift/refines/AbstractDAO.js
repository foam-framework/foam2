foam.CLASS({
  refines: 'foam.dao.AbstractDAO',
  methods: [
    // Here to finish implementing the interface.
    { name: 'select_' },
    { name: 'put_' },
    { name: 'remove_' },
    { name: 'find_' },
    { name: 'removeAll_' },
  ],
})

foam.CLASS({
  refines: 'foam.dao.DAOProperty',
  properties: [
    {
      name: 'swiftType',
      value: 'DAO',
    },
  ],
});
