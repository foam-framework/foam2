foam.CLASS({
  refines: 'foam.core.AbstractMethod',

  methods: [
    function createChildMethod_(child) {
      var result = child.clone();
      var props = child.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < props.length ; i++ ) {
        var prop = props[i];

        // TODO Find way to remove this flag check. Removing breaks java gen.
        if ( (global.FOAM_FLAGS.java || this.hasOwnProperty(prop.name)) && ! child.hasOwnProperty(prop.name) ) {
          prop.set(result, prop.get(this));
        }
      }

      // Special merging behaviour for args.
      var i = 0;
      for ( ; i < this.args.length ; i++ ) result.args[i] = this.args[i].clone().copyFrom(child.args[i]);
      for ( ; i < child.args.length ; i++ ) result.args[i] = child.args[i];

      return result;
    },
  ]
});
