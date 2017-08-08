foam.CLASS({
  package: 'foam.dao',
  name: 'ManyToManyGridRecord',

  properties: [
    {
      name: 'id',
      getter: function() { return this.target.id; }
    },
    {
      class: 'FObjectProperty',
      name: 'target',
      required: true
    },
    {
      class: 'Array',
      of: 'Boolean',
      name: 'data'
    }
  ]
});
