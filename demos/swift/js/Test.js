foam.CLASS({
  name: 'Test',
  requires: [
    'foam.swift.SwiftClass',
    'foam.swift.Field',
  ],
  properties: [
    {
      class: 'String',
      name: 'name',
      value: 'Mike',
    },
    {
      class: 'String',
      name: 'factoryProp',
      swiftFactory: function() {/*
    let a = "YOO"
    return a
      */},
    },
  ],
  methods: [
    function execute() {
      var cls = this.model_.toSwiftClass();
      console.log(cls.toSwiftSource());
    }
  ]
});
