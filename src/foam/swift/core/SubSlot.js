/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.core',
  name: 'SubSlot',
  extends: 'foam.swift.core.Slot',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.swift.core.Slot',
      required: true,
      swiftWeak: true,
      name: 'parentSlot',
    },
    {
      class: 'String',
      name: 'name',
    },
    {
      name: 'value',
    },
    {
      swiftType: 'Subscription?',
      name: 'prevSub',
    },
  ],

  methods: [
    {
      name: 'init',
      swiftCode: function() {/*
onDetach(parentSlot.swiftSub(parentChange_listener))
parentChange()
      */},
    },

    {
      name: 'swiftGet',
      swiftCode: function() {/*
if let o = parentSlot.swiftGet() as? foam_core_FObject { return o.get(key: name) }
return nil
      */},
    },

    {
      name: 'swiftSet',
      swiftCode: function() {/*
if let o = parentSlot.swiftGet() as? foam_core_FObject { o.set(key: name, value: value) }
      */},
    },

    {
      name: 'swiftSub',
      swiftCode: function() {/*
return sub(topics: ["propertyChange", "value"], listener: listener)
      */},
    },

  ],

  listeners: [
    {
      name: 'parentChange',
      swiftCode: function() {/*
prevSub?.detach()
prevSub = nil
if let o = parentSlot.swiftGet() as? foam_core_FObject {
  prevSub = o.getSlot(key: name)?.swiftSub(valueChange_listener)
  onDetach(prevSub!)
}
valueChange()
      */},
    },

    {
      name: 'valueChange',
      swiftCode: function() {/*
if let parentValue = parentSlot.swiftGet() as? foam_core_FObject {
  value = parentValue.get(key: name)
} else {
  value = nil
}
      */},
    },
  ]
});
