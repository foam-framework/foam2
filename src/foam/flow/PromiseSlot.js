foam.CLASS({
  package: 'foam.flow',
  name: 'PromiseSlot',
  implements: [ 'foam.core.Slot' ],
  documentation: `
    A slot that takes a promise and sets its value to its value when it
    resolves.
  `,
  properties: [
    {
      name: 'promise',
      postSet: function(_, n) {
        n.then(function(v) {
          if ( n === this.promise ) this.value = v;
        }.bind(this));
      },
    },
    {
      name: 'value',
    },
  ],
  methods: [
    function get() { return this.value; },
    function set() {
      throw new Error('PromiseSlot does not support setting.');
    },
    function sub(l) {
      return arguments.length === 1 ?
        this.SUPER('propertyChange', 'value', l) :
        this.SUPER.apply(this,arguments);
    },
  ]
});
