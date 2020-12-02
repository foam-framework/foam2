  
/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'IsUserCapabilityJunctionStatusUpdate',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: `Returns true if the status of the usercapabilityjunction has been updated`,

  javaImports: [
    'foam.core.X'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'includeRenewalStatus',
      value: true
    }
  ],

  methods: [
    {
      name: 'f', 
      javaCode: `
        X x = (X) obj;
        UserCapabilityJunction old = (UserCapabilityJunction) x.get("OLD");
        UserCapabilityJunction ucj = (UserCapabilityJunction) x.get("NEW");

        if ( old == null ) return true;
        if ( getIncludeRenewalStatus() ) {
          if ( ucj.getRenewalStatusChanged(old) ) return true;
          else return false;
        }
        if ( old.getStatus() != ucj.getStatus() ) return true;

        return false;
      `
    }
  ]
});