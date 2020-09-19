/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PreventMultipleSpidDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO decorator that prevents assigning the user more than one spid',

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.predicate.AbstractPredicate',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
        Capability targetCapability = (Capability) ucj.findTargetId(x);

        if ( targetCapability == null || ! ( targetCapability instanceof ServiceProvider ) ) return super.put_(x, obj);

        AbstractPredicate serviceProviderTargetPredicate = new AbstractPredicate(x) {
          @Override
          public boolean f(Object obj) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            Capability c = (Capability) ucj.findTargetId(x);
            return c instanceof ServiceProvider;
          }
        };
        UserCapabilityJunction userSpidJunction = (UserCapabilityJunction) super
          .find(AND(EQ(UserCapabilityJunction.SOURCE_ID, ucj.getSourceId()), serviceProviderTargetPredicate));

        if ( userSpidJunction != null ) throw new RuntimeException("User cannot be granted multiple Service Provider Capabilities"); 

        
        return super.put_(x, obj);
      `,
    }
  ],
});
