foam.CLASS({
  package: 'foam.comics',
  name: 'ManyToManyRelationshipController',
  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'targetDAO'
    }
  ],
  actions: [
    {
      name: 'add',
      code: function() {
        this.stack.push({
          class: 'foam.comics.ManyToManyRelationshipAddControllerView',
          data: this.ManyToManyRelationshipAddController.create({

          })
        });
      }
    }
  ]
});
