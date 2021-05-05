/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'LoadCapabilitiesAgent',
  implements: [ 'foam.core.ContextAgent' ],

  documentation: `
    Calls crunchService to fetch the necessary prerequisie capabilities.
  `,

  imports: [
    'crunchService',
    'rootCapability'
  ],
  exports: [
    'capabilities',
    'getWAO'
  ],

  requires: [
    'foam.nanos.crunch.ui.UserCapabilityJunctionWAO',
    'foam.nanos.crunch.ui.CapableWAO',
  ],

  enums: [
    {
      name: 'WAOSetting',
      values: ['UCJ','CAPABLE']
    }
  ],

  properties: [
    {
      name: 'capabilities',
      class: 'Array'
    },
    {
      name: 'waoSetting',
      factory: function () {
        return this.WAOSetting.UCJ;
      }
    },
    {
      name: 'subject',
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Subject',
      documentation: `
        The requested subject associated to the ucj. Should only be set
        when used by a permissioned back-office user.
      `
    }
  ],

  methods: [
    // If Property expressions ever unwrap promises this method can be blank.
    function execute() {
      if ( this.subject ) {
        return this.crunchService.getCapabilityPathFor(null, this.rootCapability.id, false, this.subject.user, this.subject.realUser)
          .then(capabilities => { this.capabilities = capabilities });
      }
      return this.crunchService.getCapabilityPath(null, this.rootCapability.id, false)
        .then(capabilities => { this.capabilities = capabilities });
    },
    function getWAO() {
      switch ( this.waoSetting ) {
        case this.WAOSetting.UCJ:
          return this.UserCapabilityJunctionWAO.create({ subject: this.subject }, this.__context__);
        case this.WAOSetting.CAPABLE:
          return this.CapableWAO.create({}, this.__context__);
        default:
          throw new Error('WAOSetting is unrecognized: ' + this.waoSetting);
      }
    }
  ]
});
