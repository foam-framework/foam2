/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.predicate',
  name: 'CapabilityGranted',
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
      name: 'capabilityId',
      class: 'String'
    },
    {
      name: 'subjectFromUCJ',
      class: 'Boolean',
      value: true,
      documentation: `
        When this property is true, CapabilityGranted expects a UCJ object in
        the context which it will use to determine the corresponding subject.
        Otherwise, the context is assumed to contain the appropriate subject.
      `
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        if ( ! ( obj instanceof X ) ) return false;
        var x = (X) obj;

        if ( getSubjectFromUCJ() ) {
          var newUCJ = (UserCapabilityJunction) x.get("NEW");
          if ( newUCJ != null ) {
            x = x.put("subject", newUCJ.getSubject(x));
          }
        }

        // Context requirements
        var crunchService = (CrunchService) x.get("crunchService");
        var capabilityDAO = (DAO) x.get("capabilityDAO");

        // Verify that the capability exists
        Object cap = capabilityDAO.inX(x).find(getCapabilityId());
        if ( cap == null ) return false;

        var ucj = crunchService.getJunction(x, getCapabilityId());
        if ( ucj == null ) return false;
        return ucj.getStatus() == GRANTED;
      `
    }
  ],
});