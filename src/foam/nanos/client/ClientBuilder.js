/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.client',
  name: 'ClientBuilder',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.box.HTTPBox',
    'foam.box.RetryBox',
    'foam.dao.EasyDAO',
    'foam.dao.RequestResponseClientDAO',
    'foam.nanos.boot.NSpec',
  ],

  properties: [
    {
      name: 'nSpecDAO',
      factory: function() {
        // The client completely fails if nSpecDAO fails to load, so infinitely retry
        // requests to nSpecDAO.
        return this.RequestResponseClientDAO.create({
          of: this.NSpec,
          cache: true,
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
          // TODO: Instead of generating a model, generate and return a context.
          // We're not currently doing this because building a model with
          // properties that have factories allow those properties to get
          // instantiated lazily but there's no reason we can't give contexts
          // the ability to do this too.
          var client = {
            package: 'foam.nanos.client',
            name: 'Client',
            exports: [],
            properties: [],
          };

          var references = [];

          // Force hard reload when app version updates
          self.nSpecDAO.find("appConfig").then(function(spec) {
            var appConfig = spec.service;

            client.exports.push(spec.name);
            references = references.concat(foam.json.references(self.__context__, appConfig));
            client.properties.push({
              name: spec.name,
              factory: function() {
                return foam.json.parse(appConfig, null, this);
              }
            });

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
                  }
                });
              }
            },
            eof: function() {
              Promise.all(references).then(function() {
                resolve(foam.core.Model.create(client).buildClass());
              });
            }
          });
        })
      },
    },
  ],
});
