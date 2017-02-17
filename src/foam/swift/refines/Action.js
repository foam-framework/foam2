foam.CLASS({
  refines: 'foam.core.Action',
  requires: [
    'foam.swift.Method',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftCode',
    }
  ],
  methods: [
    function writeToSwiftClass(cls) {
      if ( !this.swiftCode ) return;
      cls.methods.push(this.Method.create({
        name: this.name,
        body: this.swiftCode
      }));
    },
  ]
});
