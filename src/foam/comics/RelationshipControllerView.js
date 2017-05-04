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
      name: 'data'
    }
  ],

  reactions: [
    [ 'data', 'action,create', 'onCreate' ],
    [ 'data', 'action,add', 'onAdd' ],
    [ 'data', 'action,edit', 'onEdit' ]
  ],

  listeners: [
    function onAdd() {
      this.stack.push({
        class: 'foam.comics.RelationshipDAOAddControllerView',
      }, this);
    }
  ]
});
