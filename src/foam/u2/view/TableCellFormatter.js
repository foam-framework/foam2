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
        this.add(axiom.label);
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
  refines: 'foam.core.Action',

  properties: [
    {
      class: 'foam.u2.view.TableCellFormatter',
      name: 'tableCellFormatter',
      value: function(_, obj, axiom) {
        this.
          startContext({ data: obj }).
          add(axiom).
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
  refines: 'foam.core.FObjectProperty',

  properties: [ [ 'tableCellFormatter', null ] ]
});


foam.CLASS({
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
  refines: 'foam.core.Date',

  properties: [
    {
      class: 'foam.u2.view.TableCellFormatter',
      name: 'tableCellFormatter',
      value: function(date) {
        if ( date ) this.add(date.toLocaleDateString())
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.DateTime',

  properties: [
    {
      class: 'foam.u2.view.TableCellFormatter',
      name: 'tableCellFormatter',
      value: function(date) {
        if ( date ) this.add(date.toLocaleString());
      }
    }
  ]
});

