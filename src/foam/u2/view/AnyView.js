foam.CLASS({
  package: 'foam.u2.view',
  name: 'AnyView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.view.ChoiceView',
    'foam.u2.CheckBox',
    'foam.u2.TextField',
    'foam.u2.DateTimeView'
  ],
  properties: [
    {
      name: 'types',
      factory: function() {
        return [
         [[foam.String, this.TextField], 'String'],
         [[foam.Boolean, this.CheckBox], 'Boolean'],
         [[foam.Data, this.DateTimeView], 'Date']
        ]
      }
    },
    {
      name: 'selected',
      expression: function(data, types) {
        var type = foam.typeOf(data);
        var choice = types.find(t => type == t[0][0]);
        return choice ? choice[0] : types[0][0];
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .start(this.ChoiceView, {
          choices$: this.types$,
          data$: this.selected$
        })
        .end()
        .add(this.slot(function(selected) {
          return self.E().start(selected[1], { data$: self.data$ }).end();
        }))
    }
  ]
});