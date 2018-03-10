/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.client',
  name: 'ClientBuilder',

  implements: [
    'foam.box.Context',
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.box.HTTPBox',
    'foam.box.RetryBox',
    'foam.dao.ClientDAO',
    'foam.dao.RequestResponseClientDAO',
    'foam.nanos.boot.NSpec'
  ],

  properties: [
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
    }
  ],

  methods: [
    function then(resolve) {
      var self = this;

      var client = {
        refines: 'foam.nanos.client.Client',
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
            resolve(foam.core.Model.create(client));
          });
//          resolve(foam.core.Model.create(client));
//          foam.CLASS(client);
//          resolve(foam.nanos.client.Client);
        }
      });
    }
  ]
});

/*
{
  class: 'foam.dao.EasyDAO',
  of: 'foam.nanos.pm.PMInfo',
  type: 'CLIENT'
}
*/
