/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'SpidGroupURL',

  ids: [
    'spid',
    'group'
  ],

  implements: [
    'foam.nanos.auth.ServiceProviderAware'
  ],

  properties: [
    {
      name: 'spid',
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider'
    },
    {
      name: 'group',
      class: 'Reference',
      of: 'foam.nanos.auth.Group'
    },
    {
      name: 'protocol',
      class: 'String',
      value: 'https'
    },
    {
      name: 'host',
      class: 'String'
    },
    {
      name: 'port',
      class: 'Int',
      value: 443
    },
    {
      name: 'url',
      class: 'String',
      createVisibility: 'HIDDEN',
      updateVisibilty: 'RO',
      storageTransient: true,
      expression: function(protocol, host, port) {
        if ( port == 80 || port == 443 ) {
          return protocol+"//"+host+"/";
        }
        return protocol+":"+port+"//"+host+"/";
      },
      javaFactory: `
        if ( getPort() == 80 || getPort() == 443 ) {
          return getProtocol()+"//"+getHost()+"/";
        }
        return getProtocol()+":"+getPort()+"//"+getHost()+"/";
      `
    }
  ]
});
