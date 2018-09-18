foam.CLASS({
  package: 'foam.build.output.replacer',
  name: 'ImportsPathOnlyReplacer',
  extends: 'foam.build.output.Replacer',
  requires: [
    'foam.core.Import',
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
    {
      name: 'output',
      value: function(x, v) {
        this.out.output(x, v.key + (v.required ? '' : '?') )
      },
    },
  ],
});
