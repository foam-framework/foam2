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
  constants: [
    {
      name: 'DEFAULT_TYPES',
      factory: function() {
        return [
          foam.u2.view.AnyView.Choice.create({
            label: 'String',
            type: foam.String,
            view: foam.u2.view.TextField,
            toType: function(o) {
              return o + '';
            }
          }),
          foam.u2.view.AnyView.Choice.create({
            label: 'Boolean',
            type: foam.Boolean,
            view: foam.u2.CheckBox,
            toType: function(o) {
              return !!o;
            }
          }),
          foam.u2.view.AnyView.Choice.create({
            label: 'Number',
            type: foam.Number,
            view: foam.u2.FloatView,
            toType: function(o) {
              return parseFloat(o) || 0;
            }
          }),
          foam.u2.view.AnyView.Choice.create({
            label: 'Map',
            type: foam.Object,
            view: foam.u2.view.JSONView,
            toType: function(o) {
              return foam.Object.isInstance(o) ? o : {};
            }
          }),
          foam.u2.view.AnyView.Choice.create({
            label: 'Date',
            type: foam.Date,
            view: foam.u2.DateTimeView,
            toType: function(o) {
              if ( foam.Date.isInstance(o ) ) return o;
              return new Date(Date.parse(o) || Date.now());
            }
          })
        ];
      }
    }
  ],
  classes: [
    {
      name: 'Choice',
      properties: [
        {
          name: 'label'
        },
        {
          name: 'type'
        },
        {
          name: 'view'
        },
        {
          name: 'toType'
        }
      ]
    }
  ],
  properties: [
    {
      name: 'types',
      factory: function() {
        return this.DEFAULT_TYPES;
      }
    },
    {
      name: 'selected',
      expression: function(data, types) {
        var type = foam.typeOf(data);
        var choice = types.find(t => type == t.type);
        return choice || types[0];
      }
    },
    {
      name: 'view',
      postSet: function(o, n) {
        if ( o ) o.detach();
        n.onDetach(n.data$.linkFrom(this.data$));
      }
    }
  ],
  methods: [
    function initE() {
      var self = this;
      this
        .add(this.slot(function(selected) {
          self.data = selected.toType(self.data);
          return self.E()
            .startContext({data: null})
              .start(selected.view, null, this.view$).end()
            .endContext();
        }))
        .start(this.ChoiceView, {
          choices$: this.types$.map(types => types.map(t => [t, t.label])),
          data$: this.selected$
        })
        .end();
    }
  ]
});