foam.CLASS({
  package: 'foam.u2.search',
  name: 'Toolbar',
  extends: 'foam.u2.View',
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'data',
      factory: function() {
        return foam.mlang.predicate.True.create();
      }
    }
  ],
  methods: [
    function initE() {
      this.SUPER();
      this.add('TODO MAKE TOOLBAR');
    }
  ]
});