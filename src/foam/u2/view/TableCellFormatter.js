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
        this.add(value.label)
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
        this.start()
          .add(obj.toSummary())
        .end();
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.view',
  name: 'CurrencyTableCellFormatterRefinement',
  refines: 'foam.core.Currency',

  properties: [
    {
      class: 'foam.u2.view.TableCellFormatter',
      name: 'tableCellFormatter',
      value: function(value) {
        this.start()
          .style({'text-align': 'left', 'padding-right': '20px'})
          .add('$' + (value/100).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'))
        .end();
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
        this.add(value.map(o => o.toSummary()).join(', '));
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
        if ( date ) this.add(date.toLocaleDateString());
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
        if ( date ) this.add(date.toLocaleString());
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
        var hours = Math.floor(value / 3600000);
        value -= hours * 3600000;
        var minutes = Math.floor(value / 60000);
        value -= minutes * 60000;
        var seconds = Math.floor(value / 1000);
        value -= seconds * 1000;
        var milliseconds = value % 1000;

        var formatted = [[hours, 'h'], [minutes, 'm'], [seconds, 's'], [milliseconds, 'ms']].reduce((acc, cur) => {
          return cur[0] > 0 ? acc.concat([cur[0] + cur[1]]) : acc;
        }, []).join(' ');

        this.add(formatted || '0ms');
      }
    }
  ]
});
