foam.CLASS({
  package: 'foam.apploader',
  name: 'ModelRefines',
  refines: 'foam.core.Model',
  methods: [
    {
      name: 'getClassDeps',
      code: function(opt_flags) {
        var filter = foam.util.flagFilter(opt_flags);

        var deps = this.requires ?
            this.requires.filter(filter).map(function(r) { return r.path }) :
            [];

        deps = deps.concat(this.implements ?
                           this.implements.filter(filter).map(function(i) { return i.path }) :
                           []);

        if ( this.extends ) deps.push(this.extends);
        return deps;
      }
    },
  ],
});
