/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.Requires',
  flags: ['swift'],
  requires: [
    'foam.swift.Argument',
    'foam.swift.Method',
  ],
  properties: [
    {
      name: 'swiftReturns',
      expression: function(path) {
        return this.lookup(path).model_.swiftName;
      },
    },
  ],
  methods: [
    function writeToSwiftClass(cls) {
      if (foam.core.InterfaceModel.isInstance(this.lookup(this.path).model_)) {
        return;
      }
      // TODO skip refines.
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
