/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.InnerClass',
  flags: ['swift'],
  requires: [
    'foam.swift.Method',
    'foam.swift.Argument',
  ],
  methods: [
    function writeToSwiftClass(cls, parentCls) {
      if ( ! parentCls.hasOwnAxiom(this.name) ) return;
      if ( !this.model.generateSwift ) return;
      var innerClass = this.model.buildClass();
      var innerSwiftClass = innerClass.toSwiftClass();
      innerSwiftClass.imports = [];
      cls.classes.push(innerSwiftClass);

      cls.methods.push(this.Method.create({
        name: this.model.swiftName + '_create',
        returnType: this.model.swiftName,
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
    }
  ],
  templates: [
    {
      name: 'swiftInitializer',
      args: [],
      template: function() {/*
return <%=this.model.swiftName%>(args, __subContext__)
      */},
    },
  ],
});
