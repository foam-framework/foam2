/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.AbstractInterface',
  flags: ['swift'],
  axioms: [
    {
      installInClass: function(cls) {
        cls.toSwiftClass =  function() {
          var m = this.model_;
          // If the interface implements any other interfaces, ommit the 'class'
          // to remove a "Redundant constraint 'Self' : 'AnyObject'" warning.
          var impls = ( (m.implements || []).length ? [] : ['class'] ).concat(m.swiftAllImplements)
          var cls = foam.lookup('foam.swift.Protocol').create({
            name: m.swiftName,
            implements: impls,
          });

          var axioms = this.getAxioms();

          for ( var i = 0 ; i < axioms.length ; i++ ) {
            axioms[i].writeToSwiftClass && axioms[i].writeToSwiftClass(cls, this);
          }

          return cls;
        };
      }
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Implements',
  flags: ['swift'],
  methods: [
    function writeToSwiftClass(cls, parentCls) {
      if ( ! parentCls.hasOwnAxiom(this.name) ) return;
      // Fill in any missing methods with a method that just calls fatalError().
      // We need to do this in swift because abstract classes aren't a thing so
      // we need to implement all methods.
      if ( ! foam.swift.SwiftClass.isInstance(cls) ) return;
      var of = foam.lookup(this.path);
      var interfaceMethods = of.getOwnAxiomsByClass(foam.core.Method).filter(function(m) {
        return m.swiftSupport;
      });
      var implementedMethods = parentCls.getOwnAxiomsByClass(foam.core.Method);
      var missingMethods = interfaceMethods.filter(function(m) {
        return !implementedMethods.find(function(m2) {
          return m.name == m2.name;
        });
      });

      missingMethods.forEach(function(m) {
        if (m.getSwiftOverride(parentCls)) return;
        var method = foam.core.Method.create(m);
        method.swiftCode = 'fatalError()';
        method.writeToSwiftClass_(cls, parentCls);
      });
    }
  ],
});
