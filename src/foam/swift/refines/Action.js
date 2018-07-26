/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.Action',
  flags: ['swift'],
  requires: [
    'foam.swift.Field',
    'foam.swift.Method',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftName',
      expression: function(name) { return name; },
    },
    {
      class: 'String',
      name: 'swiftCode',
    },
    {
      class: 'String',
      name: 'swiftAxiomName',
      expression: function(name) {
        return foam.String.constantize(name);
      },
    },
    {
      class: 'String',
      name: 'swiftPrivateAxiomName',
      expression: function(swiftName) { return '_' + foam.String.constantize(swiftName) + '_'; },
    },
    {
      class: 'String',
      name: 'swiftSlotName',
      expression: function(swiftName) { return swiftName + '$'; },
    },
    {
      name: 'code',
      value: function() {},
    },
    {
      name: 'swiftSupport',
      expression: function(swiftCode) { return !!swiftCode },
    },
  ],
  methods: [
    function writeToSwiftClass(cls, parentCls) {
      if ( ! parentCls.hasOwnAxiom(this.name) ) return;
      if ( ! this.swiftCode ) return;
      cls.fields.push(this.Field.create({
        lazy: true,
        name: this.swiftSlotName,
        initializer: this.slotInit(),
        type: 'foam_swift_core_Slot',
      }));
      cls.methods.push(this.Method.create({
        name: this.swiftName,
        body: this.swiftCode,
        visibility: 'public',
      }));
      cls.fields.push(this.Field.create({
        visibility: 'public',
        static: true,
        final: true,
        name: this.swiftPrivateAxiomName,
        type: 'ActionInfo',
        initializer: this.swiftAxiomInit(parentCls),
      }));
      cls.methods.push(this.Method.create({
        visibility: 'public',
        class: true,
        name: this.swiftAxiomName,
        returnType: 'MethodInfo',
        body: 'return ' + this.swiftPrivateAxiomName,
      }));
    },
  ],
  templates: [
    {
      name: 'swiftAxiomInit',
      args: ['parentCls'],
      template: function() {/*
class ActionInfo_: ActionInfo {
  let args: [MethodArg] = []
  let label = "<%=this.label%>" // TODO localize
  let name = "<%=this.swiftName%>"
  public func getSlot(_ obj: foam_core_FObject) -> foam_swift_core_Slot {
    let obj = obj as! <%=parentCls.model_.swiftName%>
    return obj.<%=this.swiftSlotName%>
  }
}
return ActionInfo_()
      */},
    },
    {
      name: 'slotInit',
      args: [],
      template: function() {/*
return foam_swift_core_ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }
    return self!.`<%=this.swiftName%>`()
  }
])
      */},
    },
  ],
});
