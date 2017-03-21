foam.CLASS({
  refines: 'foam.core.AbstractInterface',
  axioms: [
    {
      installInClass: function(cls) {
        cls.toSwiftClass =  function() {
          var cls = foam.lookup('foam.swift.Protocol').create({
            name: this.model_.swiftName,
          });

          var axioms = this.getAxioms();

          for ( var i = 0 ; i < axioms.length ; i++ ) {
            axioms[i].writeToSwiftClass && axioms[i].writeToSwiftClass(cls);
          }

          return cls;
        };
      }
    }
  ]
});
