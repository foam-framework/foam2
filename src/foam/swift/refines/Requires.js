/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.Requires',
  requires: [
    'foam.swift.Argument',
    'foam.swift.Method',
  ],
  properties: [
    {
      name: 'swiftPath',
      expression: function(path) {
        return path;
      },
    },
    {
      name: 'swiftReturns',
      expression: function(swiftPath) {
        return this.lookup(swiftPath).model_.swiftName;
      },
    },
  ],
  methods: [
    function writeToSwiftClass(cls) {
      if (!this.swiftPath) return;
      if (foam.core.InterfaceModel.isInstance(this.lookup(this.swiftPath).model_)) {
        return;
      }
      cls.methods.push(this.Method.create({
        name: this.name + '_create',
        returnType: this.swiftReturns,
        visibility: 'public',
	body: this.swiftInitializer(),
        args: [
          this.Argument.create({
            localName: 'args',
            defaultValue: '[:]',
            type: '[String:Any?]',
          }),
        ],
      }));
    },
  ],
  templates: [
    {
      name: 'swiftInitializer',
      args: [],
      template: function() {/*
return __subContext__.create(<%=this.swiftReturns%>.self, args: args)!
      */},
    },
  ],
});

foam.CLASS({
  package: 'foam.classloader',
  name: 'RequiresARequireExtension',
  refines: 'foam.core.Requires',

  methods: [
    function arequire(opt_deps) {
      return this.__context__.arequire(this.swiftPath, opt_deps);
    }
  ]
});
