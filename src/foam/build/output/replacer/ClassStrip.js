foam.CLASS({
  package: 'foam.build.output.replacer',
  name: 'ClassStrip',
  extends: 'foam.build.output.Replacer',
  methods: [
    function adapt(v) {
      var ret = {};
      v.cls_.getAxiomsByClass(foam.core.Property).forEach(function(a) {
        if ( v.hasDefaultValue(a.name) ) return;
        if ( a.transient ) return;
        ret[a.name] = v[a.name];
      });
      return ret;
    },
  ],
});
