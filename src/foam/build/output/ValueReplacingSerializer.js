/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.build.output',
  name: 'ValueReplacingSerializer',
  extends: 'foam.build.output.ProxySerializer',
  implements: [
    'foam.mlang.Expressions'
  ],
  requires: [
    'foam.core.Argument',
    'foam.core.EnumModel',
    'foam.core.Export',
    'foam.core.Implements',
    'foam.core.Import',
    'foam.core.InnerClass',
    'foam.core.InnerEnum',
    'foam.core.InterfaceModel',
    'foam.core.Method',
    'foam.core.Model',
    'foam.core.Property',
    'foam.core.Requires',
    'foam.core.internal.EnumValueAxiom',
    'foam.core.internal.InterfaceMethod',
    'foam.dao.Relationship',
  ],
  classes: [
    {
      name: 'Replacer',
      properties: [
        {
          class: 'String',
          name: 'description',
        },
        {
          class: 'FObjectArray',
          of: 'foam.mlang.predicate.Predicate',
          name: 'where',
        },
        {
          class: 'Function',
          name: 'adapt',
        },
      ],
      methods: [
        function f(chain) {
          var v = chain[chain.length - 1];
          if ( chain.length < this.where.length ) return false;

          for ( var i = 0 ; i < this.where.length ; i++ ) {
            if ( ! this.where[i].f(chain[chain.length - 1 - i]) ) return false;
          }

          return true;
        },
      ],
    },
  ],
  properties: [
    {
      class: 'Array',
      name: 'chain',
    },
    {
      name: 'rules',
      factory: function() {
        var self = this;
        var stripClass = function(v) {
          var ret = {};
          v.cls_.getAxiomsByClass(foam.core.Property).forEach(function(a) {
            if ( v.hasDefaultValue(a.name) ) return;
            if ( a.transient ) return;
            ret[a.name] = v[a.name];
          });
          return ret;
        }
        return [
          this.Replacer.create({
            description: 'Collapse properties with just a name into just a string',
            where: [
              self.AND(
                self.IS_TYPE(self.Property),
                self.HAS_ONLY_PROPERTIES(['name'])
              ),
              self.FUNC(foam.Array.isInstance),
              self.AND(
                self.INSTANCE_OF(self.Model),
                self.FUNC(function(v) {
                  return v.properties == self.chain[self.chain.length-2]
                })
              )
            ],
            adapt: function(v) { return v.name },
          }),
          this.Replacer.create({
            description: 'Collapse implements with just path to just a string',
            where: [
              self.AND(
                self.IS_TYPE(self.Implements),
                self.HAS_ONLY_PROPERTIES(['path'])
              ),
              self.FUNC(foam.Array.isInstance),
              self.AND(
                self.INSTANCE_OF(self.Model),
                self.FUNC(function(v) {
                  return v.implements == self.chain[self.chain.length-2]
                })
              )
            ],
            adapt: function(v) { return v.path },
          }),
          this.Replacer.create({
            description: 'Collapse requires with just path to just a string',
            where: [
              self.AND(
                self.IS_TYPE(self.Requires),
                self.HAS_ONLY_PROPERTIES(['path', 'name']),
                self.FUNC(function(v) {
                  return v.name == v.path.split('.').pop();
                })
              ),
              self.FUNC(foam.Array.isInstance),
              self.AND(
                self.INSTANCE_OF(self.Model),
                self.FUNC(function(v) {
                  return v.requires == self.chain[self.chain.length-2]
                })
              )
            ],
            adapt: function(v) { return v.path },
          }),
          this.Replacer.create({
            description: 'Collapse imports with just path to just a string',
            where: [
              self.AND(
                self.IS_TYPE(self.Import),
                self.FUNC(function(v) {
                  return v.name == v.key && v.slotName_ == foam.String.toSlotName(v.name)
                })
              ),
              self.FUNC(foam.Array.isInstance),
              self.AND(
                self.INSTANCE_OF(self.Model),
                self.FUNC(function(v) {
                  return v.imports == self.chain[self.chain.length-2]
                })
              )
            ],
            adapt: function(v) { return v.key + (v.required ? '' : '?') },
          }),
          this.Replacer.create({
            description: 'Collapse methods with just js into only the function',
            where: [
              self.AND(
                self.IS_TYPE(self.Method),
                self.HAS_ONLY_PROPERTIES(['name', 'code']),
                self.FUNC(function(v) {
                  return v.code && v.name == v.code.name
                })
              ),
              self.FUNC(foam.Array.isInstance),
              self.AND(
                self.INSTANCE_OF(self.Model),
                self.FUNC(function(v) {
                  return v.methods == self.chain[self.chain.length-2]
                })
              )
            ],
            adapt: function(v) {
              return v.code
            },
          }),
          this.Replacer.create({
            description: 'Remove class from EnumValueAxioms',
            where: [
              self.IS_TYPE(self.EnumValueAxiom),
              self.FUNC(foam.Array.isInstance),
              self.AND(
                self.INSTANCE_OF(self.EnumModel),
                self.FUNC(function(v) {
                  return v.values == self.chain[self.chain.length-2]
                })
              )
            ],
            adapt: stripClass,
          }),
          this.Replacer.create({
            description: 'Remove class from interface methods',
            where: [
              self.IS_TYPE(self.InterfaceMethod),
              self.FUNC(foam.Array.isInstance),
              self.AND(
                self.INSTANCE_OF(self.InterfaceModel),
                self.FUNC(function(v) {
                  return v.methods == self.chain[self.chain.length-2]
                })
              )
            ],
            adapt: stripClass,
          }),
          this.Replacer.create({
            description: 'Remove class from methods',
            where: [
              self.IS_TYPE(self.Method),
              self.FUNC(foam.Array.isInstance),
              self.AND(
                self.INSTANCE_OF(self.Model),
                self.FUNC(function(v) {
                  return v.methods == self.chain[self.chain.length-2]
                })
              )
            ],
            adapt: stripClass,
          }),
          this.Replacer.create({
            description: 'Remove class from properties',
            where: [
              self.IS_TYPE(self.Property),
              self.FUNC(foam.Array.isInstance),
              self.AND(
                self.INSTANCE_OF(self.Model),
                self.FUNC(function(v) {
                  return v.properties == self.chain[self.chain.length-2]
                })
              )
            ],
            adapt: stripClass,
          }),
          this.Replacer.create({
            description: 'Remove class from arguments',
            where: [
              self.IS_TYPE(self.Argument),
              self.FUNC(foam.Array.isInstance),
              self.AND(
                self.INSTANCE_OF(self.Method),
                self.FUNC(function(v) {
                  return v.args == self.chain[self.chain.length-2]
                })
              )
            ],
            adapt: stripClass,
          }),
          this.Replacer.create({
            description: 'Remove class from top level models',
            where: [
              self.AND(
                self.IS_TYPE(self.Model),
                self.FUNC(function(v) {
                  return self.chain.length == 1
                })
              )
            ],
            adapt: stripClass,
          }),
          this.Replacer.create({
            description: 'Remove class from top level relationships',
            where: [
              self.AND(
                self.IS_TYPE(self.Relationship),
                self.FUNC(function(v) {
                  return self.chain.length == 1
                })
              )
            ],
            adapt: stripClass,
          }),
          this.Replacer.create({
            description: 'Remove class from top level interfaces',
            where: [
              self.AND(
                self.IS_TYPE(self.InterfaceModel),
                self.FUNC(function(v) {
                  return self.chain.length == 1
                })
              )
            ],
            adapt: stripClass,
          }),
          this.Replacer.create({
            description: 'Remove class from top level enums',
            where: [
              self.AND(
                self.IS_TYPE(self.EnumModel),
                self.FUNC(function(v) {
                  return self.chain.length == 1
                })
              )
            ],
            adapt: stripClass,
          }),
        ];
      },
    },
  ],
  methods: [
    function HAS_ONLY_PROPERTIES(keys) {
      var keyMap = {};
      keys.forEach(function(k) { keyMap[k] = true });
      return this.FUNC(function(v) {
        var axioms = v.cls_.getAxiomsByClass(foam.core.Property);
        for ( var i = 0 ; i < axioms.length ; i++ ) {
          if ( v.hasOwnProperty(axioms[i].name) &&
               ! keyMap[axioms[i].name] )
            return false;
        }
        return true;
      })
    },
    function IS_TYPE(cls) {
      return this.FUNC(function(v) {
        return v && v.cls_ && v.cls_.id == cls.id
      })
    },
    function output(x, v) {
      this.chain.push(v)

      var c = this.chain;
      var r = this.rules.find(function(r) {
        return r.f(c);
      })
      if ( r ) v = r.adapt(v);

      this.delegate.output(x, v);
      this.chain.pop()
    },
  ],
});
