foam.CLASS({
  package: 'foam.swift.core',
  name: 'Slot',
  methods: [
    {
      name: 'swiftGet',
      swiftReturnType: 'Any?',
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
          swiftType: '@escaping Listener',
          name: 'listener',
        },
      ],
      swiftReturnType: 'Subscription',
      swiftCode: 'fatalError()',
    },
    {
      name: 'linkFrom',
      args: [
        {
          swiftType: 'Slot',
          name: 's2',
        },
      ],
      swiftReturnType: 'Subscription',
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
          swiftType: 'Slot',
          name: 'other',
        },
      ],
      swiftReturnType: 'Subscription',
      swiftCode: function() {/*
return other.linkFrom(self)
      */},
    },
    {
      name: 'follow',
      args: [
        {
          swiftType: 'Slot',
          name: 'other',
        },
      ],
      swiftReturnType: 'Subscription',
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
          swiftType: 'Slot',
          name: 'other',
        },
        {
          swiftType: '@escaping (Any?) -> Any?',
          name: 'f',
        },
      ],
      swiftReturnType: 'Subscription',
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
          swiftType: 'Slot',
          name: 'other',
        },
        {
          swiftType: '@escaping (Any?) -> Any?',
          name: 'f',
        },
      ],
      swiftReturnType: 'Subscription',
      swiftCode: function() {/*
return other.mapFrom(self, f)
      */},
    },
    {
      name: 'map',
      args: [
        {
          swiftType: '@escaping (Any?) -> Any?',
          name: 'f',
        },
      ],
      swiftReturnType: 'ExpressionSlot',
      swiftCode: function() {/*
return ExpressionSlot([
  "code": { (args: [Any?]) -> Any? in f(args[0]) },
  "args": [self]
])
      */},
    },
  ]
});
