/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'PutFinalPayloadsAgent',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'capabilities',
    'crunchService',
    'subject',
    'wizardlets',
    'userCapabilityJunctionDAO'
  ],

  requires: [
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.UserCapabilityJunction'
  ],

  methods: [
    function execute() {
      // TODO: replace with CrunchService methods when possible.
      //   At the time of writing this comment, CrunchService does
      //   not have a method to create the correct empty UCJ when
      //   none already exists.
      // Save no-data capabilities (i.e. not displayed in wizard)
      return Promise.all(this.wizardlets.filter(wizardlet => {
        return wizardlet.isAvailable && ( ! wizardlet.capability.of ); 
      }).map(
        filteredWizard => {
          return filteredWizard.save()
            .then((data) => {
              return Promise.resolve();
            })
        }
      ));
    }
  ]
});
