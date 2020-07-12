/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'TableCellFormatter',
  extends: 'FObjectProperty',

  requires: [
    'foam.core.FObjectProperty',
    'foam.u2.view.FnFormatter',
  ],

  properties: [
    {
      name: 'of',
      value: 'foam.u2.view.Formatter'
    },
    {
      name: 'adapt',
      value: function(o, f, prop) {
        if ( foam.Function.isInstance(f) ) {
          return prop.FnFormatter.create({f: f});
        }
        return prop.FObjectProperty.ADAPT.value.call(this, o, f, prop);
      }
    },
    {
      name: 'value',
      adapt: function(_, v) {
        return this.adapt.call(this, _, v, this);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'TableCellPropertyRefinement',

  refines: 'foam.core.Property',

  properties: [
    {
      name: 'tableHeaderFormatter',
      value: function(axiom) {
        this.add(axiom.label || foam.String.labelize(axiom.name));
      }
    },
    {
      class: 'foam.u2.view.TableCellFormatter',
      name: 'tableCellFormatter',
      factory: function() {
        return foam.u2.view.FnFormatter.create({
          class: 'foam.u2.view.FnFormatter',
          f: function(value, obj, axiom) {
            this.add(value);
          }
        })
      }
    },
    {
      class: 'Int',
      name: 'tableWidth'
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.view',
  name: 'ActionTableCellFormatterRefinement',
  refines: 'foam.core.Action',

  properties: [
    {
      class: 'foam.u2.view.TableCellFormatter',
      name: 'tableCellFormatter',
      value: function(_, obj, axiom) {
        this.
          startContext({ data: obj }).
          tag(axiom, {
            size: 'SMALL',
            buttonStyle: 'SECONDARY'
          }).
          endContext();
      }
    },
    {
      name: 'tableHeaderFormatter',
      value: function(axiom) {
        this.add(axiom.label);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.view',
  name: 'EnumTableCellFormatterRefinement',
  refines: 'foam.core.Enum',

  properties: [
    {
      class: 'foam.u2.view.TableCellFormatter',
      name: 'tableCellFormatter',
      value: function(value) {
        if ( value ) {
          this.start().
            addClasses(value.classes()).
            style(value.toStyle()).
            add(value.label).
          end();
        }
        else {
          this.start().
            add('-').
          end();
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.view',
  name: 'FObjectPropertyTableCellFormatterRefinement',
  refines: 'foam.core.FObjectProperty',

  properties: [
    {
      class: 'foam.u2.view.TableCellFormatter',
      name: 'tableCellFormatter',
      value: function(obj) {
        this.callIf(obj, function() {
          this.start()
            .add(obj.toSummary())
          .end();
        })
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.view',
  name: 'UnitValueTableCellFormatterRefinement',
  refines: 'foam.core.UnitValue',

  properties: [
    {
      class: 'foam.u2.view.TableCellFormatter',
      name: 'tableCellFormatter',
      value: function(value, obj, axiom) {
        var unitProp = obj.cls_.getAxiomByName(axiom.unitPropName);
        if ( ! unitProp ) {
          console.warn(obj.cls_.name, ' does not have the property: ', axiom.unitPropName);
          this.add(value);
          return;
        }
        var self = this;
        this.add(foam.core.ExpressionSlot.create({
          args: [obj.slot(unitProp.name), obj.slot(axiom.name)],
          code: (unitId, propValue) => {
            // TODO: Replace currencyDAO with unitDAO
            return foam.core.PromiseSlot.create({
              promise: obj.__context__.currencyDAO.find(unitId).then((unit) => {
                var formatted = unit ? unit.format(propValue) : propValue;
                self.tooltip = formatted;
                return formatted;
              })
            });
          }
        }));
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'StringArrayTableCellFormatterRefinement',
  refines: 'foam.core.StringArray',
  properties: [
    {
      class: 'foam.u2.view.TableCellFormatter',
      name: 'tableCellFormatter',
      value: function(value) {
        this.add(value.join(', '));
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'FObjectArrayTableCellFormatterRefinement',
  refines: 'foam.core.FObjectArray',
  properties: [
    {
      class: 'foam.u2.view.TableCellFormatter',
      name: 'tableCellFormatter',
      value: function(value) {
        this.callIf(value, function() {
          this.add(value.map(o => o.toSummary()).join(', '));
        });
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'DateTableCellFormatterRefinement',
  refines: 'foam.core.Date',

  properties: [
    {
      class: 'foam.u2.view.TableCellFormatter',
      name: 'tableCellFormatter',
      value: function(date) {
        // allow the browser to deal with this since we are technically using the user's preference
        if ( date ) {
          var formattedDate = date.toLocaleDateString();
          this.add(formattedDate);
          this.tooltip = formattedDate;
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.view',
  name: 'DateTimeTableCellFormatterRefinement',
  refines: 'foam.core.DateTime',

  properties: [
    {
      class: 'foam.u2.view.TableCellFormatter',
      name: 'tableCellFormatter',
      value: function(date) {
        // allow the browser to deal with this since we are technically using the user's preference
        if ( date ) {
          // toLocaleString includes date and time
          var formattedDate = date.toLocaleString();
          this.add(formattedDate);
          this.tooltip = formattedDate;
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.view',
  name: 'DurationTableCellFormatterRefinement',
  refines: 'foam.core.Duration',

  properties: [
    {
      class: 'foam.u2.view.TableCellFormatter',
      name: 'tableCellFormatter',
      value: function(value) {
        let formatted = foam.core.Duration.duration(value);
        this.add(formatted || '0ms');
      }
    }
  ]
});
