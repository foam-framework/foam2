foam.CLASS({
  package: 'foam.build.output.replacer',
  name: 'PropertyClassStrip',
  extends: 'foam.build.output.replacer.ClassStrip',
  requires: [
    'foam.core.Model',
    'foam.core.Property',
  ],
  properties: [
    {
      name: 'where',
      factory: function() {
        var self = this;
        return [
          self.IS_TYPE(self.Property),
          self.FUNC(foam.Array.isInstance),
          self.AND(
            self.INSTANCE_OF(self.Model),
            self.FUNC(function(v) {
              return v.properties == self.chain[self.chain.length-2]
            })
          )
        ]
      },
    },
  ],
});
