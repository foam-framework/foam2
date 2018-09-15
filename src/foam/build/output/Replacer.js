foam.CLASS({
  package: 'foam.build.output',
  name: 'Replacer',
  implements: [
    'foam.mlang.Expressions',
  ],
  documentation: `
    A class that's used to replace values that are being outputted. It tracks
    the chain of values that have been outputted and will pass the elements of
    the chain to each predicate in the 'where' property. If all of these
    predicates are true, the value should be adapted.
  `,
  imports: [
    'chain',
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
      name: 'adapt',
      required: true,
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
    function HAS_ONLY_PROPERTIES(keys) {
      var keyMap = {};
      keys.forEach(function(k) { keyMap[k] = true });
      return this.FUNC(function(v) {
        var axioms = v.cls_.getAxiomsByClass(foam.core.Property);
        for ( var i = 0 ; i < axioms.length ; i++ ) {
          if ( v.hasOwnProperty(axioms[i].name) &&
               ! keyMap[axioms[i].name] )
            return false;
        }
        return true;
      })
    },
    function IS_TYPE(cls) {
      return this.FUNC(function(v) {
        return v && v.cls_ && v.cls_.id == cls.id
      })
    },
  ],
});
