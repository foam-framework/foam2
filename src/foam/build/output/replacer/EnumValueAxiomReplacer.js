foam.CLASS({
  package: 'foam.build.output.replacer',
  name: 'EnumValueAxiomReplacer',
  extends: 'foam.build.output.Replacer',
  requires: [
    'foam.core.EnumModel',
    'foam.core.internal.EnumValueAxiom',
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
          self.IS_TYPE(self.EnumValueAxiom),
          self.FUNC(foam.Array.isInstance),
          self.AND(
            self.INSTANCE_OF(self.EnumModel),
            self.FUNC(function(v) {
              return v.values == self.chain[self.chain.length-2]
            })
          )
        ]
      },
    },
    {
      name: 'output',
      value: function(x, v) { this.out.output(x, v.definition) },
    },
  ],
});
