/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.core',
  name: 'Slot',
  methods: [
    {
      name: 'swiftGet',
      swiftReturns: 'Any?',
      swiftCode: 'fatalError()',
    },
    {
      name: 'swiftSet',
      args: [
        {
          swiftType: 'Any?',
          name: 'value',
        },
      ],
      swiftCode: 'fatalError()',
    },
    {
      name: 'swiftSub',
      args: [
        {
          swiftAnnotations: ['@escaping'],
          swiftType: 'Listener',
          name: 'listener',
        },
      ],
      swiftReturns: 'Subscription',
      swiftCode: 'fatalError()',
    },
    {
      name: 'linkFrom',
      args: [
        {
          of: 'foam.swift.core.Slot',
          name: 's2',
        },
      ],
      swiftReturns: 'Subscription',
      swiftCode: function() {/*
let s1 = self
var feedback1 = false
var feedback2 = false

let l1 = { () -> Void in
  if feedback1 { return }

  if !FOAM_utils.equals(s1.swiftGet(), s2.swiftGet()) {
    feedback1 = true
    s2.swiftSet(s1.swiftGet())
    if !FOAM_utils.equals(s1.swiftGet(), s2.swiftGet()) { s1.swiftSet(s2.swiftGet()) }
    feedback1 = false
  }
}

let l2 = { () -> Void in
  if feedback2 { return }

  if !FOAM_utils.equals(s1.swiftGet(), s2.swiftGet()) {
    feedback2 = true
    s1.swiftSet(s2.swiftGet())
    if !FOAM_utils.equals(s1.swiftGet(), s2.swiftGet()) { s2.swiftSet(s1.swiftGet()) }
    feedback2 = false
  }
}

var sub1: Subscription? = s1.swiftSub { (_, _) in l1() }
var sub2: Subscription? = s2.swiftSub { (_, _) in l2() }

l2()

return Subscription {
  sub1?.detach()
  sub2?.detach()
  sub1 = nil
  sub2 = nil
}
      */},
    },
    {
      name: 'linkTo',
      args: [
        {
          of: 'foam.swift.core.Slot',
          name: 'other',
        },
      ],
      swiftReturns: 'Subscription',
      swiftCode: function() {/*
return other.linkFrom(self)
      */},
    },
    {
      name: 'follow',
      args: [
        {
          of: 'foam.swift.core.Slot',
          name: 'other',
        },
      ],
      swiftReturns: 'Subscription',
      swiftCode: function() {/*
let l = { () -> Void in
  if !FOAM_utils.equals(self.swiftGet(), other.swiftGet()) {
    self.swiftSet(other.swiftGet())
  }
}
l()
return other.swiftSub { (_, _) in l() }
      */},
    },
    {
      name: 'mapFrom',
      args: [
        {
          of: 'foam.swift.core.Slot',
          name: 'other',
        },
        {
          swiftAnnotations: ['@escaping'],
          swiftType: '(Any?) -> Any?',
          name: 'f',
        },
      ],
      swiftReturns: 'Subscription',
      swiftCode: function() {/*
let l = { () -> Void in
  self.swiftSet(f(other.swiftGet()))
}
l()
return other.swiftSub { (_, _) in l() }
      */},
    },
    {
      name: 'mapTo',
      args: [
        {
          of: 'foam.swift.core.Slot',
          name: 'other',
        },
        {
          swiftAnnotations: ['@escaping'],
          swiftType: '(Any?) -> Any?',
          name: 'f',
        },
      ],
      swiftReturns: 'Subscription',
      swiftCode: function() {/*
return other.mapFrom(self, f)
      */},
    },
    {
      name: 'map',
      args: [
        {
          swiftAnnotations: ['@escaping'],
          swiftType: '(Any?) -> Any?',
          name: 'f',
        },
      ],
      returns: 'foam.swift.core.ExpressionSlot',
      swiftCode: function() {/*
return foam_swift_core_ExpressionSlot([
  "code": { (args: [Any?]) -> Any? in f(args[0]) },
  "args": [self]
])
      */},
    },
    {
      name: 'dot',
      args: [
        {
          swiftType: 'String',
          name: 'name',
        },
      ],
      returns: 'foam.swift.core.SubSlot',
      swiftCode: function() {/*
let s = foam_swift_core_SubSlot([
  "parentSlot": self,
  "name": name,
])
onDetach(Subscription(detach: {
  s.detach()
}))
return s
      */},
    },
  ]
});
