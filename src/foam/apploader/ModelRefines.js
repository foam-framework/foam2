/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.apploader',
  name: 'ModelRefines',
  refines: 'foam.core.Model',
  methods: [
    {
      name: 'getClassDeps',
      code: function() {
        var deps = this.requires ?
            this.requires.map(function(r) { return r.path }) :
            [];

        deps = deps.concat(this.implements ?
                           this.implements.map(function(i) { return i.path }) :
                           []);

        if ( this.extends ) deps.push(this.extends);

        if ( this.refines ) deps.push(this.refines);

        return deps.map(function(d) {
          if ( d.indexOf('.') == -1 ) return 'foam.core.' + d;
          return d;
        });
        return deps;
      }
    },
  ],
});
