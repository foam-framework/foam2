foam.CLASS({
  name: 'RelationshipClassStrip',
  package: 'foam.build.output.replacer',
  extends: 'foam.build.output.replacer.ClassStrip',
  requires: [
    'foam.dao.Relationship',
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
