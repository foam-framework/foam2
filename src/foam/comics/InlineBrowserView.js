foam.CLASS({
  package: 'foam.comics',
  name: 'InlineBrowserView',
  extends: 'foam.comics.InlineDAOControllerView',
  imports: [
    'data as dao',
  ],
  properties: [
    {
      name: 'data',
      factory: function() {
        return this.DAOController.create({ data: this.dao });
      }
    }
  ]
});
