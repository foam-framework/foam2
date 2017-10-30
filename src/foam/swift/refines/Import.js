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
  ],
});
