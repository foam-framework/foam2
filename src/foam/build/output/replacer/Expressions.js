foam.CLASS({
  package: 'foam.build.output.replacer',
  name: 'Expressions',
  requires: [
    'foam.mlang.predicate.Func',
  ],
  documentation: 'Convenience mix-in for common mlangs used in replacers.',
  methods: [
    function HAS_ONLY_PROPERTIES(keys) {
      var keyMap = {};
      keys.forEach(function(k) { keyMap[k] = true });
      return this.Func.create({
        fn: function(v) {
          var axioms = v.cls_.getAxiomsByClass(foam.core.Property);
          for ( var i = 0 ; i < axioms.length ; i++ ) {
            if ( v.hasOwnProperty(axioms[i].name) &&
                 ! keyMap[axioms[i].name] )
              return false;
          }
          return true;
        }
      })
    },
    function IS_TYPE(cls) {
      return this.Func.create({
        fn: function(v) {
          return v && v.cls_ && v.cls_.id == cls.id
        }
      })
    },
  ]
});
