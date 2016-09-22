foam.CLASS({
  name: 'Test',

  properties: [
    {
      class: 'Int',
      label: 'How wide would you like your text field?',
      name: 'width'
    },
    {
      class: 'String',
      name: 'string',
      view: function(_, X) {
        return X.data.slot(function(width) {
          return foam.u2.TextField.create({displayWidth: width, data$: this.string$});
        });
      }
    }
  ]
});


var t = Test.create();
foam.u2.DetailView.create({data: t}).write();
