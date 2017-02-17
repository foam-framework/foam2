foam.CLASS({
  refines: 'foam.core.Slot',
  methods: [
    {
      name: 'valueSub',
      swiftArgs: [
        {
          localName: 'args',
          type: '[Any]',
        },
      ],
      swiftCode: function() {/*
    var self = this;
    var args = Array.from(arguments);
    var s;
    var l = function() {
      var v = self.get();
      if ( s ) s.detach();
      if ( v ) s = v.sub.apply(v, args);
    };
    l();
    this.sub(l);
      */},
    },
    {
      name: 'get',
      swiftReturnType: 'Any?',
      swiftCode: 'fatalError("Unexpected call to foam.core.Slot get()")',
    },
  ]
});
