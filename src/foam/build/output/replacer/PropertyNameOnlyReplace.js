foam.CLASS({
  package: 'foam.build.output.replacer',
  name: 'PropertyNameOnlyReplace',
  extends: 'foam.build.output.Replacer',
  requires: [
    'foam.core.Property',
    'foam.core.Model',
  ],
  properties: [
    {
      name: 'where',
      factory: function() {
        var self = this;
        return [
          self.AND(
            self.IS_TYPE(self.Property),
            self.HAS_ONLY_PROPERTIES(['name'])
          ),
          self.FUNC(foam.Array.isInstance),
          self.AND(
            self.INSTANCE_OF(self.Model),
            self.FUNC(function(v) {
              return v.properties == self.chain[self.chain.length-2]
            })
          )
        ];
      },
    },
    {
      name: 'adapt',
      value: function(v) {
        return v.name;
      },
    },
  ],
});
