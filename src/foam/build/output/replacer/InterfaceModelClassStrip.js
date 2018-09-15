foam.CLASS({
  name: 'InterfaceModelClassStrip',
  package: 'foam.build.output.replacer',
  extends: 'foam.build.output.replacer.ClassStrip',
  requires: [
    'foam.core.InterfaceModel',
  ],
  properties: [
    {
      name: 'where',
      factory: function() {
        var self = this;
        return [
          self.AND(
            self.IS_TYPE(self.InterfaceModel),
            self.FUNC(function(v) {
              return self.chain.length == 1
            })
          )
        ]
      },
    },
  ],
});
