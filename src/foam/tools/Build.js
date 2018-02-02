foam.CLASS({
  package: 'foam.tools',
  name: 'Build',

  requires: [
    'foam.json2.Serializer',
  ],

  imports: [
    'modelDAO',
  ],

  properties: [
    {
      name: 'modelId',
      value: 'foam.tools.Build',
    },
    {
      class: 'String',
      name: 'output',
      view: { class: 'foam.u2.tag.TextArea', rows: 16 },
    },
    {
      class: 'StringArray',
      name: 'flags',
      value: ['web'],
    },
    {
      hidden: true,
      name: 'outputter',
      factory: function() {
        var flags = this.flags;
        return this.Serializer.create({
          axiomPredicate: function(a) {
            if ( a.flags ) {
              for ( var i = 0; i < flags.length; i++ ) {
                if ( p.flags[flags[i]] ) return true;
              }
              return false;
            }
            return true;
          }
        });
      },
    },
  ],

  actions: [
    function execute() {
      var self = this;
      self.modelDAO.find(self.modelId).then(function(m) {
        self.output = self.outputter.stringify(self.__subContext__, m);
      });
    }
  ]
});
