foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'MaybeDAOPutAgent',

  implements: [
    'foam.core.ContextAgent'
  ],

  imports: [
    'capable',
    'submitted as submittedOld'
  ],

  exports: [
    'submitted'
  ],

  properties: [
    {
      // TODO: should be in context, right now it gets passed
      //       LOOTS of places
      name: 'daoKey',
      class: 'String'
    },
    {
      name: 'submitted',
      class: 'Boolean'
    }
  ],

  methods: [
    function execute() {
      var p = Promise.resolve();
      this.submitted = this.submittedOld;
      if ( this.daoKey ) {
        p = p.then(() =>
          this.__subContext__[this.daoKey].put(this.capable));
        this.submitted = false;
      }
      return p;
    }
  ]
});