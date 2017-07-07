foam.CLASS({
  package: 'foam.dao',
  name: 'ReadOnlyDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: 'DAO decorator that throws errors on put and remove.',
  methods: [
    {
      name: 'put_',
      javaReturns: 'foam.core.FObject',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ],
      javaCode: `throw new UnsupportedOperationException("Cannot put into ReadOnlyDAO");`
    },
    {
      name: 'remove_',
      javaReturns: 'foam.core.FObject',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ],
      javaCode: `throw new UnsupportedOperationException("Cannot remove from ReadOnlyDAO");`
    },
    {
      name: 'removeAll_',
      javaReturns: 'void',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'skip',
          javaType: 'long'
        },
        {
          name: 'limit',
          javaType: 'long'
        },
        {
          name: 'order',
          javaType: 'foam.mlang.order.Comparator'
        },
        {
          name: 'predicate',
          javaType: 'foam.mlang.predicate.Predicate'
        }
      ],
      javaCode: `throw new UnsupportedOperationException("Cannot removeAll from ReadOnlyDAO");`
    }
  ]
});
