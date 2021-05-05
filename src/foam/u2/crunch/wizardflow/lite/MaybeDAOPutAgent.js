/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'MaybeDAOPutAgent',
  implements: [
    'foam.core.ContextAgent'
  ],
  documentation: `
    Perform a DAO put when Capable wizards are complete to complete the flow
    of a capability intercept.
  `,

  imports: [
    'intercept',
    'submitted',
    'capable',
  ],

  methods: [
    function execute() {
      var p = Promise.resolve();
      if ( this.intercept.daoKey && this.submitted ) {
        p = p.then(() =>
          this.__subContext__[this.intercept.daoKey].put(this.capable)
          .then(returnCapable => {
            this.intercept.returnCapable = returnCapable;
          })
        );
      }
      return p;
    }
  ]
});
