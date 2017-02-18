foam.CLASS({
  refines: 'foam.core.Action',
  requires: [
    'foam.swift.Method',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftCode',
    },
    {
      name: 'code',
      value: function() {},
    },
  ],
  methods: [
    function writeToSwiftClass(cls) {
      if ( !this.swiftCode ) return;
      cls.methods.push(this.Method.create({
        name: this.name,
        body: this.swiftCode,
        visibility: 'public',
      }));
    },
  ]
});
