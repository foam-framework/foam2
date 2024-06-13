/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// This example demonstrate how to bind data in FOAM
// document reference https://docs.angularjs.org/guide/concepts

foam.CLASS({
  package: 'com.foamdev.demos.dataBinding',
  name: 'Controller',
  extends: 'foam.u2.Controller',// it will automatically exports: ['as data']
  //extends: 'foam.u2.Element',

  //exports: [ 'as data' ],

  css: `
    h2 { color: #aaa; }
    body, input[text] { color: #888; font-family: Cambria, Georgia; }
  `,

  properties: [
    {
      class: 'Float',
      name: 'cost',
      min: 0,
      value: 2,
      view: {
        class: 'foam.u2.TextField',
        onKey: true
      }
    },
    {
      class: 'Int',
      name: 'qty',
      value: 1,
      min: 0,
    },
    {
      class: 'Currency', // the currency. Like -> {{qty * cost | currency}}
      name: 'tot',
      min: 0,
      /*value: 2,
      view: {
        class: 'foam.u2.TextField',
        onKey: true
      },*/
      expression: function(qty, cost) {
        return qty * cost
      }
    },
  ],

  methods: [
    function initE() {

      /*
      <div ng-app ng-init="qty=1;cost=2">
        <div>
            Quantity: <input type="number" min="0" ng-model="qty">
        </div>
        <div>
            Costs: <input type="number" min="0" ng-model="cost">
        </div>
        <div>
            <b>Total:</b> {{qty * cost | currency}}
        </div>
      </div>
      */

      //this.tot = this.cost$.prop.value*this.qty$.prop.value;
      this.start('div').add('Invoice:').end().
      start('div').add('Quantity: ').
        start(this.QTY).attrs({
          onKey: true
        }).end().
      end(). //or start('div').add('Quantity: ').add(this.QTY).end().
      start('div').add('Costs: ').add(this.COST).end().     
      start('div').add('Total: ').add(this.TOT).end().
      start('div').add('Total :',
        this.slot(function(cost, qty) {
          return cost * qty;
        })
        //another alternate approach is to use the expression
        /*foam.core.ExpressionSlot.create({
            args: [ this.cost$,this.qty$ ],
            code: function(f, l) { return f * l; }
          })*/
      ).end();
      //start('div').add('Total1: ').add(this.cost * this.qty).end(); // wrong result
      //start('div').add('Total2: ').add(this.cost$.prop.value * this.qty$.prop.value).end().// wrong result
    }
  ]
});
