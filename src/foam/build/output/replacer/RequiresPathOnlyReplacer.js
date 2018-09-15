foam.CLASS({
  package: 'foam.build.output.replacer',
  name: 'RequiresPathOnlyReplacer',
  extends: 'foam.build.output.Replacer',
  requires: [
    'foam.core.Requires',
    'foam.core.Model',
  ],
  properties: [
    {
      name: 'where',
      factory: function() {
        var self = this;
        return [
          self.AND(
            self.IS_TYPE(self.Requires),
            self.HAS_ONLY_PROPERTIES(['path', 'name']),
            self.FUNC(function(v) {
              return v.name == v.path.split('.').pop();
            })
          ),
          self.FUNC(foam.Array.isInstance),
          self.AND(
            self.INSTANCE_OF(self.Model),
            self.FUNC(function(v) {
              return v.requires == self.chain[self.chain.length-2]
            })
          )
        ];
      },
    },
  ],
  methods: [
    function adapt(v) {
      return v.path;
    }
  ],
});
