foam.CLASS({
  name: 'InterfaceMethodClassStrip',
  package: 'foam.build.output.replacer',
  extends: 'foam.build.output.replacer.ClassStrip',
  requires: [
    'foam.core.InterfaceModel',
    'foam.core.Model',
    'foam.core.internal.InterfaceMethod',
  ],
  implements: [
    'foam.build.output.replacer.Expressions',
    'foam.mlang.Expressions',
  ],
  properties: [
    {
      name: 'where',
      factory: function() {
        var self = this;
        return [
          self.IS_TYPE(self.InterfaceMethod),
          self.FUNC(foam.Array.isInstance),
          self.AND(
            self.INSTANCE_OF(self.InterfaceModel),
            self.FUNC(function(v) {
              return v.methods == self.chain[self.chain.length-2]
            })
          )
        ]
      },
    },
  ],
});
