/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'AnyView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.layout.Cols',
    'foam.u2.CheckBox',
    'foam.u2.DateTimeView',
    'foam.u2.TextField',
    'foam.u2.view.ArrayView',
    'foam.u2.view.ChoiceView',
    'foam.u2.view.MapView'
  ],
  constants: [
    {
      name: 'DEFAULT_TYPES',
      factory: function() {
        return [
          foam.u2.view.AnyView.Choice.create({
            label: 'String',
            type: foam.String,
            view: foam.u2.TextField,
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
            view: foam.u2.view.MapView,
            toType: function(o) {
              return foam.Object.isInstance(o) ? o : {};
            }
          }),
          foam.u2.view.AnyView.Choice.create({
            label: 'FObject',
            type: foam.core.FObject,
            view: foam.u2.view.FObjectView,
            toType: function(o) {
              return foam.core.FObject.isInstance(o) ? o : foam.core.FObject.create();
            }
          }),
          foam.u2.view.AnyView.Choice.create({
            label: 'Array',
            type: foam.Array,
            view: foam.u2.view.ArrayView,
            toType: function(o) {
              return foam.Array.isInstance(o) ? o : [];
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
          class: 'String',
          name: 'label'
        },
        {
          name: 'type'
        },
        {
          class: 'foam.u2.ViewSpec',
          name: 'view'
        },
        {
          class: 'Function',
          documentation: `
            A function that takes an argument and makes a best effort in
            converting that into the current type. See DEFAULT_TYPES for
            examples.
          `,
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
        if ( ! choice ) {
          console.warn("Unable to find view for type!");
          console.log(data);
        }
        return choice || types[0];
      }
    },
    {
      name: 'view',
      postSet: function(o, n) {
        if ( o ) o.detach();
        n.onDetach(n.data$.linkFrom(this.data$));
      }
    },
    {
      class: 'Boolean',
      name: 'enableChoice',
      value: true
    }
  ],
  methods: [
    function initE() {
      var self = this;
      this
        .start(self.Cols)
          .start()
            .style({flex: 1})
            .add(this.slot(function(selected) {
              self.data = selected.toType(self.data);
              return self.E()
                .startContext({data: null})
                  .start(selected.view, null, this.view$).end()
                .endContext();
            }))
          .end()
          .callIf(this.enableChoice, function() {
            this.start(self.ChoiceView, {
              choices$: self.types$.map(types => types.map(t => [t, t.label])),
              data$: self.selected$
              })
            .end()
          })
        .end();
    }
  ]
});
