foam.CLASS({
  package: 'foam.apploader',
  name: 'WebModelFileFetcher',
  requires: [
    'foam.net.HTTPRequest'
  ],
  properties: [
    'root',
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
  ]
});
