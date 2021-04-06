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
        return [
          foam.u2.view.AnyView.Choice.create({
            label: '--',
            type: foam.Undefined,
            view: foam.u2.View,
            toType: function(o) {
              return undefined;
            }
          }),
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
            label: 'Enum',
            type: foam.core.AbstractEnum,
            view: foam.u2.view.EnumView,
            toType: function(o) {
              return foam.core.AbstractEnum.isInstance(o) ? o : foam.core.AbstractEnum.create();
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
    },
    {
      name: 'selected',
      expression: function(data, types) {
        var type = foam.typeOf(data);
        // Hack for Enum values.
        if ( type == foam.core.FObject ) {
          if ( foam.core.AbstractEnum.isInstance(data) ) {
            type = foam.core.AbstractEnum;
          }
        }
        var choice = types.find(t => type == t.type);
        if ( ! choice ) {
          console.warn("Unable to find view for type!");
          console.log(data);
        }
        return choice || types[0];
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
          .callIf(this.enableChoice, function() {
            this.start(self.ChoiceView, {
              choices$: self.types$.map(types => types.map(t => [t, t.label])),
              data$: self.selected$
            })
            .style({'margin-right': '8px'})
            .end()
          })
          .start()
            .style({flex: 1})
            .add(this.slot(function(selected) {
              return self.E()
              .tag(selected.view, {data$: self.data$});
            }))
          .end()
        .end();
    }
  ]
});
