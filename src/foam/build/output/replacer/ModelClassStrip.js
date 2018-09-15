foam.CLASS({
  name: 'ModelClassStrip',
  package: 'foam.build.output.replacer',
  extends: 'foam.build.output.replacer.ClassStrip',
  requires: [
    'foam.core.Model',
  ],
  properties: [
    {
      name: 'where',
      factory: function() {
        var self = this;
        return [
          self.AND(
            self.IS_TYPE(self.Model),
            self.FUNC(function(v) {
              return self.chain.length == 1
            })
          )
        ]
      },
    },
  ],
});
