foam.CLASS({
  package: 'foam.nanos.doc',
  name: 'DocumentationView',
  extends: 'foam.u2.View',
  imports: [
    'documentDAO'
  ],
  properties: [
    {
      class: 'String',
      name: 'id',
      documentation: 'ID of the document to render.'
    },
    {
      name: 'data'
    },
    'error'
  ],
  methods: [
    function initE() {
      this.add(this.slot(function(data, error) {
        if ( ! data && ! error) {
          this.documentDAO.find(this.id).then(function(doc) {
            if ( doc ) this.data = doc;
            else this.error = 'Not found.';
          }.bind(this), function(e) {
            this.error = e.message ? e.message : '' + e;
          }.bind(this));
          return this.E('span').add('Lodaing...');
        }
        if ( ! data ) {
          return this.E('span').add(this.error);
        }
        return data.toE(this.__subSubContext__);
      }));
    }
  ]
});
