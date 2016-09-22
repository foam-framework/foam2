foam.CLASS({
  name: 'Test',

  properties: [
    {
      class: 'Int',
      label: 'How wide would you like your text field?',
      name: 'width',
      value: 30
    },
    {
      class: 'String',
      name: 'stringValue',
      view: function(_, X) {
        return X.data.slot(function(width) {
          return foam.u2.TextField.create({displayWidth: width, data$: this.stringValue$});
        });
      }
    },
    {
      name: 'typeOfDays',
      view: {
        class: 'foam.u2.view.ChoiceView',
        value: 'All',
        choices: [
          'All',
          'Week Days',
          'Weekends'
        ]
      }
    },
    {
      name: 'daysOfWeek',
      view: function(_, X) {
        return X.data.slot(function(typeOfDays) {
          var map = {
            All: [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],
            'Week Days': [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday' ],
            Weekends: [ 'Sunday', 'Saturday' ],
          };
          return foam.u2.view.ChoiceView.create({choices: map[typeOfDays], data$: this.daysOfWeek$});
        });
      }
    }
  ]
});


var t = Test.create({stringValue: 'This is a test!'});
foam.u2.DetailView.create({data: t}).write();
