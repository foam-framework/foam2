foam.CLASS({
  name: 'MethodClassStrip',
  package: 'foam.build.output.replacer',
  extends: 'foam.build.output.replacer.ClassStrip',
  requires: [
    'foam.core.Method',
    'foam.core.Model',
  ],
  properties: [
    {
      name: 'where',
      factory: function() {
        var self = this;
        return [
          self.IS_TYPE(self.Method),
          self.FUNC(foam.Array.isInstance),
          self.AND(
            self.INSTANCE_OF(self.Model),
            self.FUNC(function(v) {
              return v.methods == self.chain[self.chain.length-2]
            })
          )
        ]
      },
    },
  ],
});
