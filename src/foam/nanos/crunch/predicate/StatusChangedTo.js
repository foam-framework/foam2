/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.predicate',
  name: 'StatusChangedTo',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'static foam.nanos.crunch.CapabilityJunctionStatus.*',
  ],

  properties: [
    {
      name: 'status',
      class: 'Enum',
      of: 'foam.nanos.crunch.CapabilityJunctionStatus'
    },
    {
      name: 'checkInequality',
      class: 'Boolean',
      value: true
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        if ( ! ( obj instanceof X ) ) return false;
        var x = (X) obj;

        UserCapabilityJunction oldUCJ = (UserCapabilityJunction) x.get("OLD");
        UserCapabilityJunction newUCJ = (UserCapabilityJunction) x.get("NEW");

        if ( getCheckInequality() ) {
          if ( oldUCJ.getStatus() == newUCJ.getStatus() ) return false;
        }

        return newUCJ.getStatus() == getStatus();
      `
    }
  ],
});
