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
    'foam.dao.RequestResponseClientDAO',
    'foam.dao.ClientDAO',
    'foam.nanos.boot.NSpec'
  ],

  properties: [
    {
      name: 'nSpecDAO',
      factory: function() {
        return this.RequestResponseClientDAO.create({
          of: this.NSpec,
          delegate: this.HTTPBox.create({
            method: 'POST',
            url: 'http://localhost:8080/nSpecDAO'
          })});
        }
    }
  ],

  methods: [
    function then(resolve) {
      var self = this;

      var client = {
        package: 'foam.nanos.client',
        name: 'Client',

        implements: [ 'foam.box.Context' ],

        requires: [
          'foam.box.HTTPBox',
          'foam.dao.RequestResponseClientDAO',
          'foam.dao.ClientDAO',
          'foam.dao.EasyDAO'
        ],

        exports: [
        ],

        properties: [
        ],

        methods: [
          function createDAO(config) {
            config.daoType = 'MDAO'; // 'IDB';
            config.cache   = true;

            return this.EasyDAO.create(config);
          }
        ]
      };

      self.nSpecDAO.where(self.EQ(self.NSpec.SERVE, true)).select({
        put: function(spec) {
          if ( spec.client ) {
            var stub =
            console.log('*************', spec.stringify());

            client.exports.push(spec.name);

            client.properties.push({
              name: spec.name,
              factory: function() {
                console.log('********************* creating stub', spec.client);
                var json = JSON.parse(spec.client);
                if ( ! json.serviceName ) json.serviceName = spec.name;
                if ( ! json.class       ) json.class       = 'foam.dao.EasyDAO'
                if ( ! json.daoType     ) json.daoType     = 'CLIENT';
                return foam.json.parse(json, null, this);
                //return foam.json.parseString(spec.client, this.__context__);
              }
            });
          }
        },
        eof: function() {
          foam.CLASS(client);
          resolve(foam.nanos.client.Client);
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
