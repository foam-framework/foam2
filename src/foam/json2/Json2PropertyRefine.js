foam.CLASS({
  package: 'foam.json2',
  name: 'Json2PropertyRefine',
  refines: 'foam.core.Property',
  methods: [
    function outputPropertyJSON2(x, obj, outputter, out) {
      if ( obj.hasDefaultValue(this.name) ) return;

      if ( this.transient ) return;

      out.key(this.name);

      outputter.output(x, this.f(obj), out);
    }
  ]
});
