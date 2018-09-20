foam.CLASS({
  package: 'foam.build.output.replacer',
  name: 'ModelOrderer',
  extends: 'foam.build.output.replacer.ClassStripAndPropertyOrderer',
  requires: [
    'foam.core.Model',
  ],
  implements: [
    'foam.build.output.replacer.Expressions',
    'foam.mlang.Expressions',
  ],
  properties: [
    {
      name: 'order',
      value: [
        'documentation',
        'package',
        'name',
        'extends',
        'refines',
        'requires',
        'implements',
        'imports',
        'exports',
        'constants',
        'messages',
        'properties',
        'axioms',
        'methods',
        'actions',
        'listeners',
      ],
    },
    {
      name: 'classStripPredicate',
      factory: function() {
        var self = this;
        return self.FUNC(function(v) {
          return self.chain.length == 1
        });
      },
    },
    {
      name: 'where',
      factory: function() {
        var self = this;
        return [
          self.INSTANCE_OF(self.Model),
        ];
      },
    },
  ],
});
