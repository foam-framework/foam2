/**
* @license
* Copyright 2019 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.filter',
  name: 'BooleanFilterView',
  extends: 'foam.u2.Controller',

  documentation: `
    A simple Boolean filter that allows the user to pick between true or false.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.CheckBox'
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

    ^container .foam-u2-md-CheckBox-label {
      position: relative;
      margin-top: 0;
    }

    ^container .foam-u2-md-CheckBox {
      border-color: #9ba1a6;
    }

    ^container .foam-u2-md-CheckBox:checked {
      background-color: #406dea;
      border-color: #406dea;
    }
  `,

  properties: [
    {
      name: 'property',
      documentation: `The property that this view is filtering by. Should be of
      type Boolean.`,
      required: true
    },
    {
      class: 'Boolean',
      name: 'boolT',
      label: 'True',
      documentation: `Filter property for True`,
      value: false
    },
    {
      class: 'Boolean',
      name: 'boolF',
      label: 'False',
      documentation: `Filter property for False`,
      value: false
    },
    {
      name: 'predicate',
      documentation: `All SearchViews must have a predicate as required by the
      SearchManager. The SearchManager will read this predicate and use it
      to filter the dao being displayed in the view.`,
      expression: function(boolT, boolF) {
        if ( ( ! boolT && ! boolF ) || ( boolT && boolF )) return this.TRUE;

        return this.EQ(this.property, boolT);
      }
    },
    {
      name: 'name',
      documentation: `Required by SearchManager.`,
      value: 'Boolean filter view'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .start().addClass(this.myClass('container'))
          .start({
            class: 'foam.u2.md.CheckBox',
            data$: this.boolT$,
            showLabel: true,
            label: this.BOOL_T.label
          }).end()
        .end()
        .start().addClass(this.myClass('container'))
          .start({
            class: 'foam.u2.md.CheckBox',
            data$: this.boolF$,
            showLabel: true,
            label: this.BOOL_F.label
          }).end()
        .end();
    },

    /**
    * Clears the fields to their default values.
    * Required on all SearchViews. Called by ReciprocalSearch.
    */
    function clear() {
      this.boolT = false;
      this.boolF = false;
    }
  ]
});
