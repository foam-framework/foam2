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

  `,

  requires: [
    'foam.mlang.predicate.True',
    'foam.u2.CheckBox'
  ],

  css: `
    ^container {
      width: 100%;
      padding: 12px 16px;
    }

    ^container:first-child {
      padding-top: 24px;
    }

    ^container:last-child {
      padding-bottom: 24px;
    }

    ^container .foam-u2-Checkbox:hover, ^container .foam-u2-Checkbox-label:hover {
      cursor: pointer;
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
      name: 'bool1',
      documentation: `Lets the user pick boolean they want to filter by`,
      value: false
    },
    {
      class: 'Boolean',
      name: 'bool2',
      documentation: `Lets the user pick boolean they want to filter by`,
      value: false
    },
    {
      name: 'predicate',
      documentation: `All SearchViews must have a predicate as required by the
      SearchManager. The SearchManager will read this predicate and use it
      to filter the dao being displayed in the view.`,
      expression: function(bool1, bool2) {
        if ( ( ! bool1 && ! bool2 ) || ( bool1 && bool2 )) return this.True.create();

        return bool1 ?
          foam.mlang.predicate.Eq.create({
            arg1: this.property,
            arg2: true
          }) :
          foam.mlang.predicate.Eq.create({
            arg1: this.property,
            arg2: false
          });
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
          .add(this.CheckBox.create({ data$: this.bool1$, label: 'True' }))
        .end()
        .start().addClass(this.myClass('container'))
          .add(this.CheckBox.create({ data$: this.bool2$, label: 'False' }))
        .end()
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
