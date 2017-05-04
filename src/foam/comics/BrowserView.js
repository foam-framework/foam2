foam.CLASS({
  package: 'foam.comics',
  name: 'BrowserView',
  extends: 'foam.comics.DAOControllerView',
  requires: [
    'foam.comics.DAOController'
  ],
  properties: [
    {
      name: 'data',
      adapt: function(_, obj) {
        if ( ! this.DAOController.isInstance(obj) ) {
          return this.DAOController.create({ data: obj });
        }
        return obj;
      }
    }
  ]
});
