/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'ClientCrunchService',

  implements: [
    'foam.mlang.Expressions',
    'foam.nanos.crunch.CrunchService'
  ],

  requires: [
    'foam.nanos.crunch.CapabilityJunctionStatus'
  ],

  imports: [
    'crunchService',
    'subject',
    'userCapabilityJunctionDAO'
  ],


  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.crunch.CrunchService',
      name: 'delegate'
    }
  ],

  methods: [
    {
      name: 'updateJunction',
      code: async function(x, capabilityId, data, status) {
        let ucj = await this.crunchService.getJunction(x, capabilityId);

        if ( ucj.status == this.CapabilityJunctionStatus.AVAILABLE && status == null ) {
          ucj.status = this.CapabilityJunctionStatus.ACTION_REQUIRED;
        }

        if ( data != null ) {
          ucj.data = data;
        }
        if ( status != null ) {
          ucj.status = status;
        }
        
        ucj.lastUpdatedRealUser = this.subject.realUser.id;
        return await this.userCapabilityJunctionDAO.put(ucj);
      }
    }
  ]
});

