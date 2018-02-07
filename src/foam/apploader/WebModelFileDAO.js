foam.CLASS({
  package: 'foam.apploader',
  name: 'WebModelFileDAO',
  extends: 'foam.apploader.AbstractModelFileDAO',
  imports: [
    'window',
  ],
  requires: [
    'foam.net.HTTPRequest'
  ],
  properties: [
    {
      class: 'String',
      name: 'root',
      factory: function() {
        return this.window.location.protocol + '//' + this.window.location.host + '/src/';
      }
    },
  ],
  methods: [
    function getFile(id) {
      return this.HTTPRequest.create({
        method: 'GET',
        url: this.root + '/' + id.replace(/\./g, '/') + '.js'
      }).send().then(function(payload) {
        return payload.resp.text();
      })
    },
    function onError(resp) {
      if ( resp.status == 404 ) return null;
      throw resp;
    },
  ]
});
