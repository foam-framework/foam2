foam.CLASS({
  name: 'RelationshipClassStrip',
  package: 'foam.build.output.replacer',
  extends: 'foam.build.output.replacer.ClassStrip',
  requires: [
    'foam.dao.Relationship',
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
            self.IS_TYPE(self.Relationship),
            self.FUNC(function(v) {
              return self.chain.length == 1
            })
          )
        ]
      },
    },
  ],
});
