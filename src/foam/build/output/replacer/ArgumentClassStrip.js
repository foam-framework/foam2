foam.CLASS({
  name: 'ArgumentClassStrip',
  package: 'foam.build.output.replacer',
  extends: 'foam.build.output.replacer.ClassStrip',
  requires: [
    'foam.core.AbstractMethod',
    'foam.core.Argument',
    'foam.core.Model',
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
          self.IS_TYPE(self.Argument),
          self.FUNC(foam.Array.isInstance),
          self.AND(
            self.INSTANCE_OF(self.AbstractMethod),
            self.FUNC(function(v) {
              return v.args == self.chain[self.chain.length-2]
            })
          )
        ]
      },
    },
  ],
});
