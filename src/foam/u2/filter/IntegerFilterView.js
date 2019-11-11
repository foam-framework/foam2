/**
* @license
* Copyright 2019 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.filter',
  name: 'IntegerFilterView',
  extends: 'foam.u2.Controller',

  documentation: 'Filter view for integers.',

  imports: [
    'foam.mlang.Expressions',
  ],

  css: `
    ^ {
      padding: 24px 16px;
      box-sizing: border-box;
      min-width: 214px;
    }

    ^ .foam-u2-tag-Select {
      width: 100%;
      height: 36px;

      border-radius: 3px;
      border: solid 1px #cbcfd4;
      background-color: #ffffff;
    }

    ^ .foam-u2-FloatView {
      width: 100%;
      height: 36px;

      margin-top: 16px;

      border-radius: 3px;
      border: solid 1px #cbcfd4;
      background-color: #ffffff;
    }
  `,

  properties: [
    {
      name: 'property',
      documentation: `The property that this view is filtering by. Should be of
      type Int, Short, Long, or Byte.`,
      required: true
    },
    {
      class: 'String',
      name: 'qualifier',
      documentation: `Lets the user choose an MLang predicate to filter by.`,
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          ['True', 'All'],
          ['Eq', 'Equal'],
          ['Neq', 'Not equal'],
          ['Gt', 'Greater than'],
          ['Lt', 'Less than'],
          ['Gte', 'Greater than or equal'],
          ['Lte', 'Less than or equal'],
          ['Bt', 'Between (exclusive)'],
          ['Bte', 'Between (inclusive)']
        ],
        defaultValue: 'True'
      }
    },
    {
      class: 'Float',
      name: 'amount1',
      documentation: `The number to filter by.`,
      view: {
        class: 'foam.u2.FloatView',
        onKey: true,
        step: 1
      }
    },
    {
      class: 'Float',
      name: 'amount2',
      documentation: `The number to filter by.`,
      view: {
        class: 'foam.u2.FloatView',
        onKey: true,
        step: 1
      }
    },
    {
      name: 'predicate',
      documentation: `All SearchViews must have a predicate as required by the
      SearchManager. The SearchManager will read this predicate and use it
      to filter the dao being displayed in the view.`,
      expression: function(qualifier, amount1, amount2) {
        if ( ! qualifier ) return this.TRUE;

        if ( qualifier !== 'Bt' && qualifier !== 'Bte' ) {
          return foam.mlang.predicate[qualifier].create({
            arg1: this.property,
            arg2: amount1
          });
        }

        var pred1 = 'Gt';
        var pred2 = 'Lt';
        if ( qualifier === 'Bte' ) {
          pred1 = 'Gte';
          pred2 = 'Lte';
        }

        return this.AND(
            foam.mlang.predicate[pred1].create({
              arg1: this.property,
              arg2: amount1
            }),
            foam.mlang.predicate[pred2].create({
              arg1: this.property,
              arg2: amount2
            })
        );
      }
    },
    {
      name: 'name',
      documentation: `Required by SearchManager.`,
      value: 'Integer filter view'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .start(this.QUALIFIER)
        .start('div').addClass(this.myClass('carrot')).end()
        .end()
        .add(this.slot(function(qualifier) {
          if ( ! qualifier || qualifier === 'True') return this.E();
          return qualifier === 'Bt' || qualifier === 'Bte' ?
            this.E().add(self.AMOUNT1).add(self.AMOUNT2) :
            this.E().add(self.AMOUNT1);
        }));
    },

    /**
    * Clears the fields to their default values.
    * Required on all SearchViews. Called by ReciprocalSearch.
    */
    function clear() {
      this.qualifier = 'True';
      this.value = 0;
    }
  ]
});
