foam.CLASS({
  package: 'foam.comics',
  name: 'RelationshipController',

  requires: [
    'foam.comics.RelationshipController',
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.dao.RelationshipPropertyValue',
      name: 'data',
    },
  ],
  actions: [
    {
      name: 'toto',
      code: function() {
        debugger;
      },
    },

  ],
});
