foam.CLASS({
  package: 'foam.build.output.replacer',
  name: 'ExportsNameOnlyReplacer',
  extends: 'foam.build.output.Replacer',
  requires: [
    'foam.core.Export',
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
            self.IS_TYPE(self.Export),
            self.FUNC(function(v) {
              return ( v.exportName == v.key ) &&
                     ( v.name == 'export_' + v.exportName );
            })
          ),
          self.FUNC(foam.Array.isInstance),
          self.AND(
            self.INSTANCE_OF(self.Model),
            self.FUNC(function(v) {
              return v.exports == self.chain[self.chain.length-2]
            })
          )
        ];
      },
    },
    {
      name: 'output',
      value: function(x, v) { this.out.output(x, v.key) },
    },
  ],
});
