foam.CLASS({
  package: 'foam.build.output',
  name: 'Replacer',
  implements: [
    'foam.mlang.Expressions',
  ],
  imports: [
    'chain',
  ],
  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.mlang.predicate.Predicate',
      name: 'where',
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
    function adapt(v) {
      console.log('Replacer adapt should be overwritten.');
      return v;
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
