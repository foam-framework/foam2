/**
* @license
* Copyright 2019 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.filter.properties',
  name: 'BooleanFilterView',
  extends: 'foam.u2.Controller',

  documentation: `
    A Boolean Search View filter that allows the user to pick between true or
    false.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.tag.TernarySwitch'
  ],

  css: `
    ^container {
      display: flex;
      align-items: center;
      padding: 4px 16px;
    }

    ^container:hover {
      cursor: pointer;
      background-color: #f5f7fa;
    }

    ^container:first-child {
      margin-top: 20px;
    }

    ^container:last-child {
      margin-bottom: 20px;
    }

    ^container .foam-u2-tag-TernarySwitch {
      flex-grow: 1;
      text-align: center;
    }
  `,

  messages: [
    { name: 'help', message: 'Click the switch to modify the filter.' }
  ],

  properties: [
    {
      name: 'property',
      documentation: `
        The property that this view is filtering by. Should be of type Boolean.
      `,
      required: true
    },
    {
      class: 'Int',
      name: 'ternaryState',
      value: 2 // 2 is neutral
    },
    {
      name: 'predicate',
      documentation: `
        All Search Views must have a predicate as required by the
        Filter Controller. When this property changes, the Filter Controller will
        generate a new main predicate and also reciprocate the changes to the
        other Search Views.
      `,
      expression: function(ternaryState) {
        if ( ternaryState === 2 ) return this.TRUE;

        return this.EQ(this.property, ternaryState === 1);
      }
    },
    {
      name: 'name',
      documentation: 'Required by Filter Controller.',
      expression: function(property) {
        return property.name;
      }
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start().addClass(this.myClass('container'))
          .tag(this.TernarySwitch, {
            ternaryState$: this.ternaryState$
          })
        .end()
    },

    /**
    * Clears the fields to their default values.
    * Required on all SearchViews. Called by ReciprocalSearch.
    */
    function clear() {
      this.ternaryState = 2;
    },

    /**
    * Restores the view based on passed in predicate
    */
    function restoreFromPredicate(predicate) {
      if ( predicate == this.TRUE ) return;

      if ( predicate.arg2.value ) this.ternaryState = 1;
      if ( ! predicate.arg2.value ) this.ternaryState = 0;
    }
  ]
});
