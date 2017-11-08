/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.Import',
  requires: [
    'foam.swift.Field',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftName',
      expression: function(name) { return name; },
    },
    {
      class: 'Boolean',
      name: 'swiftSupport',
      value: true,
    },
    {
      class: 'String',
      name: 'swiftPrivateAxiomName',
      expression: function(swiftName) { return '_' + foam.String.constantize(swiftName) + '_'; },
    },
  ],
  methods: [
    function writeToSwiftClass(cls) {
      cls.fields.push(this.Field.create({
        name: this.name,
        type: 'Any?',
        getter: this.valueGetter(),
        setter: this.valueSetter(),
        visibility: 'public',
      }));
      cls.fields.push(this.Field.create({
        name: this.name + '$',
        type: 'Slot?',
        getter: this.slotGetter(),
        visibility: 'public',
      }));
      cls.fields.push(this.Field.create({
        visibility: 'private',
        static: true,
        final: true,
        name: this.swiftPrivateAxiomName,
        type: 'Axiom',
        initializer: this.swiftPropertyInfoInit(),
      }));
    },
  ],
  templates: [
    {
      name: 'slotGetter',
      args: [],
      template: function() {/*
return __context__["<%=this.key%>$"] as? Slot ?? nil
      */},
    },
    {
      name: 'valueGetter',
      args: [],
      template: function() {/*
return __context__["<%=this.key%>"]
      */},
    },
    {
      name: 'valueSetter',
      args: [],
      template: function() {/*
self.<%=this.name%>$?.swiftSet(value)
      */},
    },
    {
      name: 'swiftPropertyInfoInit',
      template: function() {/*
class PInfo: Axiom {
  let name = "<%=this.swiftName%>"
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      */},
    }
  ],
});
