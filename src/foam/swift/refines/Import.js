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
      class: 'String',
      name: 'swiftType',
      expression: function(of) {
        of = foam.String.isInstance(of) ? foam.lookup(of, true) : of;
        return  of ? of.model_.swiftName : 'Any?';
      }
    },
    {
      class: 'String',
      name: 'swiftCast',
      expression: function(swiftType) {
        return swiftType == 'Any?' ? '' : ' as! ' + swiftType;
      },
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
        type: this.swiftType,
        getter: this.valueGetter(),
        setter: this.valueSetter(),
        visibility: 'public',
      }));
      cls.fields.push(this.Field.create({
        name: this.name + '$',
        type: foam.swift.core.Slot.model_.swiftName + '?',
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
return __context__["<%=this.key%>$"] as? <%=foam.swift.core.Slot.model_.swiftName%> ?? nil
      */},
    },
    {
      name: 'valueGetter',
      args: [],
      template: function() {/*
return __context__["<%=this.key%>"]<%= this.swiftCast %>
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
