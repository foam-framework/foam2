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
    },
    {
      class: 'String', // TODO remove.
      name: 'data_',
      label: 'Search',
      view: { class: 'foam.u2.TextField' },
      maxLength: 0
    }
  ],
  methods: [
    function initE() {
      this.SUPER();
      this.tag({
        class: 'foam.u2.detail.SectionedDetailPropertyView',
        data: this,
        prop: this.DATA_
      });
    }
  ]
});