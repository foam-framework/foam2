/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.SCRIPT({
  package: 'foam.nanos.auth',
  name: 'ServiceProviderFixer',
  code: function () {
    foam.lookup('foam.nanos.crunch.Capability');
  }
});

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ServiceProvider',
  extends: 'foam.nanos.crunch.Capability',

  documentation: 'Service Provider Capability',

  properties: [
    {
      class: 'String',
      name: 'id',
      documentation: 'Service provider name',
      validationPredicates: [
        {
          args: ['id'],
          predicateFactory: function(e) {
            return e.REG_EXP(foam.nanos.auth.ServiceProvider.ID, /^[a-z0-9]+$/);
          },
          errorString: 'Invalid character(s) in id.'
        }
      ]
    },
    {
      class: 'String',
      name: 'name',
      javaFactory: `
        return "*".equals(getId()) ? "Global Service Provider Capability" : 
          getId().substring(0, 1).toUpperCase() + getId().substring(1) + " Service Provider Capability";
      `
    }
  ]
});
