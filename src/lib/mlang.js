foam.CLASS({
  package: 'foam.mlang',
  implements: ['foam.dao.Sink'],
  name: 'CountExpr',
  properties: [
    {
      name: 'value',
      defaultValue: 0
    }
  ],
  methods: [
    function put() {
      this.value++;
    }
  ]
});
