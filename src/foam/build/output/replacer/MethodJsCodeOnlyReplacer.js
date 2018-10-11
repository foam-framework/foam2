foam.CLASS({
  package: 'foam.build.output.replacer',
  name: 'MethodJsCodeOnlyReplacer',
  extends: 'foam.build.output.Replacer',
  requires: [
    'foam.core.Method',
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
          self.AND(
            self.IS_TYPE(self.Method),
            self.HAS_ONLY_PROPERTIES(['name', 'code']),
            self.FUNC(function(v) {
              return v.code && v.name == v.code.name
            })
          ),
          self.FUNC(foam.Array.isInstance),
          self.AND(
            self.INSTANCE_OF(self.Model),
            self.FUNC(function(v) {
              return v.methods == self.chain[self.chain.length-2]
            })
          )
        ];
      },
    },
    {
      name: 'output',
      value: function(x, v) { this.out.output(x, v.code) },
    },
  ],
});
