foam.CLASS({
  package: 'foam.build.output.replacer',
  name: 'ImplementsPathOnlyReplacer',
  extends: 'foam.build.output.Replacer',
  requires: [
    'foam.core.Implements',
    'foam.core.Model',
  ],
  properties: [
    {
      name: 'where',
      factory: function() {
        var self = this;
        return [
          self.AND(
            self.IS_TYPE(self.Implements),
            self.HAS_ONLY_PROPERTIES(['path'])
          ),
          self.FUNC(foam.Array.isInstance),
          self.AND(
            self.INSTANCE_OF(self.Model),
            self.FUNC(function(v) {
              return v.implements == self.chain[self.chain.length-2]
            })
          )
        ];
      },
    },
    {
      name: 'adapt',
      value: function(v) {
        return v.path;
      },
    },
  ],
});
