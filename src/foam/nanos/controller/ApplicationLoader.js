foam.CLASS({
  package: 'foam.nanos.controller',
  name: 'ApplicationLoader',
  extends: 'foam.u2.Element',
  requires: [
    'foam.nanos.client.ClientBuilder',
    'foam.nanos.controller.ApplicationController',
  ],
  implements: [
    'foam.nanos.controller.ApplicationConfig',
  ],
  properties: [
    {
      name: 'view',
      value: 'Loading...',
    },
  ],
  methods: [
    function initE() {
      this.buildClient();
      this.add(this.view$);
    },
    function buildClient() {
      var self = this;
      self.ClientBuilder.create().then(function() {
        var args = {};
        foam.nanos.controller.ApplicationConfig.getAxiomsByClass(foam.core.Property).forEach(function(p) {
          args[p.name] = self[p.name]
        })
        self.view = self.ApplicationController.create(args);
      });
    },
  ],
});
