foam.CLASS({
  package: 'foam.build.output.replacer',
  name: 'ClassStripAndPropertyOrderer',
  extends: 'foam.build.output.Replacer',
  requires: [
    'foam.core.Model',
  ],
  properties: [
    {
      name: 'order',
      value: [],
    },
    {
      name: 'classStripPredicate',
    },
    {
      name: 'output',
      value: function(x, v) {
        var out = x.out;
        var outputter = out.getOutputter();

        outputter.obj();

        if ( ! this.classStripPredicate.f(v) ) {
          outputter.key('class');
          out.output(x, v.cls_);
        }

        var order = this.order;
        order.forEach(function(a) {
          if ( v.hasDefaultValue(a) ) return;
          if ( v.cls_.getAxiomByName(a).transient ) return;
          outputter.key(a);
          out.output(x, v[a]);
        });

        v.cls_.getAxiomsByClass(foam.core.Property).forEach(function(a) {
          if ( order.indexOf(a.name) != -1 ) return;
          if ( v.hasDefaultValue(a.name) ) return;
          if ( a.transient ) return;
          outputter.key(a.name);
          out.output(x, v[a.name]);
        });

        outputter.end();
      },
    },
  ],
});
