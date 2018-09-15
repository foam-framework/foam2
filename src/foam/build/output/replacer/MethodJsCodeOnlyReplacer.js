foam.CLASS({
  package: 'foam.build.output.replacer',
  name: 'MethodJsCodeOnlyReplacer',
  extends: 'foam.build.output.Replacer',
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
      name: 'adapt',
      value: function(v) {
        return v.code;
      },
    },
  ],
});
