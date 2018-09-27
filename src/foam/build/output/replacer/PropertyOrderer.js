foam.CLASS({
  package: 'foam.build.output.replacer',
  name: 'PropertyOrderer',
  extends: 'foam.build.output.replacer.ClassStripAndPropertyOrderer',
  requires: [
    'foam.core.Model',
    'foam.core.Property',
  ],
  implements: [
    'foam.mlang.Expressions',
  ],
  properties: [
    {
      name: 'order',
      value: [
        'of',
        'documentation',
        'name',

        'factory',
        'expression',
        'value',

        'getter',
        'setter',

        'adapt',
        'preSet',
        'postSet',
      ],
    },
    {
      name: 'classStripPredicate',
      factory: function() {
        var self = this;
        return self.FUNC(function() {
          var clen = self.chain.length
          return clen >= 3 &&
            self.chain[clen-1].cls_.id == 'foam.core.Property' &&
            foam.Array.isInstance(self.chain[clen-2]) &&
            self.Model.isInstance(self.chain[clen-3]) &&
            self.chain[clen-3].properties == self.chain[clen-2]
        });
      },
    },
    {
      name: 'where',
      factory: function() {
        var self = this;
        return [
          self.INSTANCE_OF(self.Property),
        ]
      },
    },
  ],
});

