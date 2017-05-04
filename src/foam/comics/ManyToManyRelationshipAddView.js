foam.CLASS({
  package: 'foam.comics',
  name: 'ManyToManyRelationshipAddView',
  extends: 'foam.u2.View',
  imports: [
    'stack'
  ],
  properties: [
    {
      name: 'data'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'targetDAO',
      expression: function(data) { return data.targetDAO; },
      view: { class: 'foam.u2.view.DAOControllerView' }
    }
  ],
  methods: [
    function initE() {
      this.setNodeName('div').
        startContext({
          data: this,
          editRecord: this.editRecord
        }).
        add(this.DAO).
        endContext();
    }
  ],
  listeners: [
    {
      name: 'editRecord',
      code: function(r) {
        this.data.add(r);
      }
    }
  ]
});
