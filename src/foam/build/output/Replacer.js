foam.CLASS({
  package: 'foam.build.output',
  name: 'Replacer',
  documentation: `
    A class that's used to replace values that are being outputted. It tracks
    the chain of values that have been outputted and will pass the elements of
    the chain to each predicate in the 'where' property. If all of these
    predicates are true, the value should be adapted.
  `,
  imports: [
    'chain',
    'out',
  ],
  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.mlang.predicate.Predicate',
      name: 'where',
      required: true,
    },
    {
      class: 'Function',
      name: 'output',
      required: true,
      value: function(x, v) { this.out.output(x, v) },
    },
  ],
  methods: [
    function f() {
      var chain = this.chain;
      var v = chain[chain.length - 1];
      if ( chain.length < this.where.length ) return false;

      for ( var i = 0 ; i < this.where.length ; i++ ) {
        if ( ! this.where[i].f(chain[chain.length - 1 - i]) ) return false;
      }

      return true;
    },
  ],
});
