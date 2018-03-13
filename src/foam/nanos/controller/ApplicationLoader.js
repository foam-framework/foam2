foam.CLASS({
  package: 'foam.nanos.controller',
  name: 'ApplicationLoader',
  extends: 'foam.u2.Element',
  implements: [
    'foam.nanos.controller.ApplicationConfig',
    'foam.box.Context',
    'foam.mlang.Expressions',
  ],
  requires: [
    'foam.nanos.controller.ApplicationController',
    'foam.box.HTTPBox',
    'foam.box.RetryBox',
    'foam.dao.RequestResponseClientDAO',
    'foam.nanos.boot.NSpec',
    'foam.dao.EasyDAO',
  ],
  properties: [
    {
      name: 'view',
      value: 'Loading...',
    },
    {
      name: 'nSpecDAO',
      factory: function() {
        // The client completely fails if nSpecDAO fails to load, so infinitely retry
        // requests to nSpecDAO.
        return this.RequestResponseClientDAO.create({
          of: this.NSpec,
          delegate: this.RetryBox.create({
            maxAttempts: -1,
            delegate: this.HTTPBox.create({
              method: 'POST',
              url: 'service/nSpecDAO'
            })
          })
        });
      }
    },
    {
      name: 'promise',
      factory: function() {
        var self = this;
        return new Promise(function(resolve) {

          var client = {
            refines: 'foam.nanos.controller.ApplicationController',
            requires: [
              'foam.dao.EasyDAO',
            ],
            exports: [],
            properties: [],
            methods: [
              function createDAO(config) {
                config.daoType = 'MDAO'; // 'IDB';
                config.cache   = true;

                return this.EasyDAO.create(config);
              }
            ]
          };

          var references = [];

          // Force hard reload when app version updates
          self.nSpecDAO.find("appConfig").then(function(spec) {
            var appConfig = spec.service;
            var version   = appConfig.version;

            if ( "CLIENT_VERSION" in localStorage ) {
              var oldVersion = localStorage.CLIENT_VERSION;
              if ( version != oldVersion ) {
                localStorage.CLIENT_VERSION = version;
                location.reload(true);
              }
            } else {
              localStorage.CLIENT_VERSION = version;
            }
          });

          self.nSpecDAO.where(self.EQ(self.NSpec.SERVE, true)).select({
            put: function(spec) {
              if ( spec.client ) {
                client.exports.push(spec.name);

                var json = JSON.parse(spec.client);

                references = references.concat(foam.json.references(self.__context__, json));

                client.properties.push({
                  name: spec.name,
                  factory: function() {
                    if ( ! json.serviceName ) json.serviceName = 'service/' + spec.name;
                    if ( ! json.class       ) json.class       = 'foam.dao.EasyDAO'
                    if ( ! json.daoType     ) json.daoType     = 'CLIENT';
                    return foam.json.parse(json, null, this);
                    //return foam.json.parseString(spec.client, this.__context__);
                  }
                });
              }
            },
            eof: function() {
              Promise.all(references).then(function() {
                foam.core.Model.create(client).buildClass();

                var args = {};
                foam.nanos.controller.ApplicationConfig.getAxiomsByClass(foam.core.Property).forEach(function(p) {
                  args[p.name] = self[p.name]
                })
                resolve(self.ApplicationController.create(args));
              });
            }
          });
        })
      },
    },
  ],
  methods: [
    function initE() {
      var self = this;
      self.add(self.view$);
      self.promise.then(function(v) { self.view = v });
    },
  ],
});
