foam.CLASS({
  refines: 'foam.core.ProxiedMethod',
  properties: [
    {
      name: 'swiftCode',
      expression: function(swiftName, property, swiftReturns, swiftArgs) {
        var args = swiftArgs.map(function(arg) {
          return arg.localName;
        });
        return (swiftReturns ? 'return ' : '') +
          (this.swiftThrows ? 'try ' : '') + 
          property + '.' + swiftName + '(' + args.join(', ') + ')';
      }
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Proxy',
  properties: [
    {
      name: 'swiftType',
      expression: function(of) {
        return foam.lookup(of).model_.swiftName;
      }
    }
  ]
});
