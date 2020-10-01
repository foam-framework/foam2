foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'MaybeDAOPutAgent',

  implements: [
    'foam.core.ContextAgent'
  ],

  imports: [
    'intercept',
    'capable',
  ],

  methods: [
    function execute() {
      var p = Promise.resolve();
      if ( this.intercept.daoKey && this.submitted ) {
        p = p.then(() =>
          this.__subContext__[this.intercept.daoKey].put(this.capable));
      }
      return p;
    }
  ]
});