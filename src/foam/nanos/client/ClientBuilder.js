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
    'foam.box.SessionClientBox',
    'foam.dao.EasyDAO',
    'foam.dao.RequestResponseClientDAO',
    'foam.nanos.app.ClientAppConfigService',
    'foam.nanos.boot.NSpec',
    'foam.nanos.crunch.box.CrunchClientBox'
  ],

  imports: [ 'error' ],

  properties: [
    {
      name: 'nSpecDAO',
      factory: function() {
        // The client completely fails if nSpecDAO fails to load, so infinitely retry
        // requests to nSpecDAO.
        return this.RequestResponseClientDAO.create({
          of: this.NSpec,
          delegate: this.SessionClientBox.create({
            delegate: this.CrunchClientBox.create({
              delegate: this.RetryBox.create({
                maxAttempts: -1,
                delegate: this.HTTPBox.create({
                  method: 'POST',
                  url: 'service/nSpecDAO'
                })
              })
            })
          })
        });
      }
    },
    {
      name: 'promise',
      factory: function() {
        /* ignoreWarning */
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
            properties: []
          };

          var references = [];

          // Force hard reload when app version updates
          var appConfigPromise = self.nSpecDAO.find('appConfigService').then(function(a) {
            a = foam.json.parseString(a.client, self.__context__);
            return a.getAppConfig();
          }).then(function(appConfig) {
            client.exports.push('appConfig');
            references = references.concat(foam.json.references(self.__context__, appConfig));
            client.properties.push({
              name: 'appConfig',
              factory: function() {
                return appConfig.clone(this.__subContext__);
              }
            });

            var version = appConfig.version;
            if ( 'CLIENT_VERSION' in localStorage ) {
              var oldVersion = localStorage.CLIENT_VERSION;
              if ( version != oldVersion ) {
                localStorage.CLIENT_VERSION = version;
                location.reload(true);
              }
            } else {
              localStorage.CLIENT_VERSION = version;
            }
          });

          self.nSpecDAO.where(self.EQ(self.NSpec.SERVE, true)).select(
            foam.mlang.Expressions.create().PROJECTION(foam.nanos.boot.NSpec.NAME, foam.nanos.boot.NSpec.CLIENT))
            .then(p => {
              foam.dao.ArrayDAO.create({array: p.array})
              .select({
                put: function(spec) {
                  if ( spec.client ) {
                    client.exports.push(spec.name);

                    var json = JSON.parse(spec.client);

                    references = references.concat(foam.json.references(self.__context__, json));

                    client.properties.push({
                      name: spec.name,
                      factory: function() {
                        if ( ! json.class ) json.class = 'foam.dao.EasyDAO';
                        var cls = foam.lookup(json.class);
                        if ( cls == null ) {
                          self.error('Uknown Client class:', json.class, 'for service:', spec.name);
                          return null;
                        }
                        var defaults = {
                          serviceName: 'service/' + spec.name,
                          retryBoxMaxAttempts: 0
                        };
                        if ( cls == foam.dao.EasyDAO ) {
                          defaults.cache              = true;
                          defaults.ttlSelectPurgeTime = 15000;    // for select()
                          defaults.ttlPurgeTime       = 15000;    // for find()
                          defaults.daoType            = 'CLIENT';
                        }
                        for ( var k in defaults ) {
                          if ( cls.getAxiomByName(k) && json[k] == undefined )
                            json[k] = defaults[k];
                        }
                        return foam.json.parse(json, null, this.__subContext__);
                      }
                    });
                  }
                },
                eof: function() {
                  Promise.all(references.concat(appConfigPromise)).then(function() {
                    resolve(foam.core.Model.create(client).buildClass());
                  });
                }
              });
            })
        });
      }
    }
  ]
});
