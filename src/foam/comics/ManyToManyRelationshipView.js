foam.CLASS({
  package: 'foam.comics',
  name: 'ManyToManyRelationshipControllerView',
  extends: 'foam.u2.View',
  properties: [
  ],
  methods: [
    function initE() {
      this.setNodeName('div').
        add(this.data.TARGET_DAO).
        startContext({ data: this }).
        add(this.data.ADD).
        endContext();
    }
  ]
});
