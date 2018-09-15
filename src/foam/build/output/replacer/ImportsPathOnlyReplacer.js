foam.CLASS({
  package: 'foam.build.output.replacer',
  name: 'ImportsPathOnlyReplacer',
  extends: 'foam.build.output.Replacer',
  requires: [
    'foam.core.Import',
    'foam.core.Model',
  ],
  properties: [
    {
      name: 'where',
      factory: function() {
        var self = this;
        return [
          self.AND(
            self.IS_TYPE(self.Import),
            self.FUNC(function(v) {
              return v.name == v.key && v.slotName_ == foam.String.toSlotName(v.name)
            })
          ),
          self.FUNC(foam.Array.isInstance),
          self.AND(
            self.INSTANCE_OF(self.Model),
            self.FUNC(function(v) {
              return v.imports == self.chain[self.chain.length-2]
            })
          )
        ];
      },
    },
  ],
  methods: [
    function adapt(v) {
      return v.key + (v.required ? '' : '?')
    }
  ],
});
