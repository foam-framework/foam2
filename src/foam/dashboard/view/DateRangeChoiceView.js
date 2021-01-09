/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'DateRangeChoiceView',
  extends: 'foam.u2.Controller',

  documentation: 'A Drop-down with predefined date ranges',

  css: `
    ^ .foam-u2-tag-Select {
      border: none;
    }
  `,

  properties: [
    {
      name: 'property',
      documentation: `
        The property that this view is filtering by. Should be of type Date.
      `
    },
    {
      class: 'String',
      name: 'qualifier',
      documentation: 'Lets the user choose a predicate to filter the view by.',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          [0, 'All Time'],
          [1, 'Today'],
          [7, 'Last 7 days'],
          [30, 'Last 30 days']
        ],
        defaultValue: 0
      }
    },
    {
      name: 'predicate',
      expression: function(qualifier) {
        if ( qualifier == 0 ) return foam.mlang.predicate.True.create();
        var date = new Date();
        date.setDate(date.getDate() - qualifier);
          return foam.mlang.predicate.Gt.create({
            arg1: this.property,
            arg2: date
          });
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.addClass(this.myClass())
        .start(this.QUALIFIER)
          .start('div').addClass(this.myClass('carrot')).end()
        .end();
    }
  ]
});
