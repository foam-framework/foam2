foam.CLASS({
  package: 'foam.flow',
  name: 'Method',
  extends: 'Method',
  properties: [
    {
      class: 'String',
      name: 'markup'
    },
    {
      name: 'code',
      factory: function() {
        return foam.flow.Parser.create().parseString(this.markup)
      }
    }
  ]
});
