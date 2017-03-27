foam.CLASS({
  package: 'foam.swift.core',
  name: 'ExpressionSlot',
  extends: 'foam.swift.core.Slot',

  properties: [
    {
      swiftType: '[Slot]',
      name: 'args',
      swiftPostSet: 'subToArgs_(newValue)',
    },
    {
      swiftType: '(([Any?]) -> Any?)',
      swiftRequiresEscaping: true,
      name: 'code',
    },
    {
      name: 'value',
      swiftFactory: function() {/*
return code(args.map { (slot) -> Any? in return slot.swiftGet() })
      */}
    },
    {
      name: 'cleanup_', // detachable to cleanup old subs when obj changes
      swiftType: 'Subscription?',
    },
  ],

  methods: [
    {
      name: 'swiftGet',
      swiftCode: 'return value',
    },
    {
      name: 'swiftSet',
      swiftCode: '// NOP',
    },
    {
      name: 'swiftSub',
      swiftCode: function() {/*
return sub(topics: ["propertyChange", "value"], listener: listener)
      */},
    },
    {
      name: 'subToArgs_',
      args: [
        {
          name: 'slots',
          swiftType: '[Slot]',
        },
      ],
      swiftCode: function() {/*
cleanup();
let subs = slots.map { (slot) -> Subscription in
  return slot.swiftSub(invalidate_listener)
}
cleanup_ = Subscription(detach: { for sub in subs { sub.detach() } })
      */},
    }
  ],

  listeners: [
    {
      name: 'cleanup',
      swiftCode: 'cleanup_?.detach()',
    },
    {
      name: 'invalidate',
      swiftCode: 'clearProperty("value")',
    },
  ]
});
