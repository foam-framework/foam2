foam.CLASS({
  package: 'foam.comics',
  name: 'RelationshipControllerView',
  extends: 'foam.u2.InlineDAOControllerView',
  imports: [
    'stack'
  ],
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.comics.RelationshipDAOController',
      name: 'data',
      listeners: [
      listeners: [
        {
          topic: ['action', 'create'],
          listener: 'onCreate'
        },
        {
          topic: ['action', 'add']
          listener: 'onAdd'
        },
        {
          topic: ['action', 'edit'],
          listener: 'onEdit'
        }
      ]
    }
  ],
  listeners: [
    function onAdd() {
      this.stack.push({
        class: 'foam.comics.RelationshipDAOAddControllerView',
      }, this);
    }
  ]
});
