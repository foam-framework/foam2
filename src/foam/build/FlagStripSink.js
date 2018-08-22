/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.build',
  name: 'FlagStripSink',
  extends: 'foam.dao.ProxySink',

  requires: [
    'foam.core.Model',
  ],

  properties: [
    {
      name: 'flags',
    },
    {
      name: 'filter',
      expression: function(flags) {
        return foam.util.flagFilter(flags);
      },
    },
  ],

  methods: [
    {
      name: 'put',
      code: function(o, sub) {
        this.delegate.put(this.filterAxiomsByFlags(o, this.flags), sub);
      },
    },
    {
      name: 'filterAxiomsByFlags',
      code: function(o) {
        var self = this;
        var type = foam.typeOf(o);
        if ( type == foam.Array ) {
          return o.filter(self.filter).map(function(obj) {
            return self.filterAxiomsByFlags(obj);
          });
        } else if ( type == foam.Object ) {
          if ( foam.core.FObject.isSubClass(o) ) { // Is an actual class
            return o;
          }
          var fo = {};
          Object.keys(o).forEach(function(k) {
            fo[k] = self.filterAxiomsByFlags(o[k]);
          });
          return fo;
        } else if ( type == foam.core.FObject ) {
          var fo = {};
          o.cls_.getAxiomsByClass(foam.core.Property)
            .filter(self.filter)
            .filter(function(axiom) {
              return o.hasOwnProperty(axiom.name);
            })
            .forEach(function(axiom) {
              fo[axiom.name] = self.filterAxiomsByFlags(o[axiom.name]);
            });
          return o.cls_.create(fo);
        }
        return o;
      },
    },
  ]
});
