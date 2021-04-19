/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'RichChoiceSummaryIdRowView',
  extends: 'foam.u2.View',

  documentation: 'Appends object id after object summary in RichChoiceViews',

  // duplicates css, properties,methods from RichChoiceView.DefaultRowView
  css: `
        ^row {
          background: white;
          padding: 1px 2px;
          font-size: 12px;
        }

        ^row:hover {
          background: #f4f4f9;
          cursor: pointer;
        }
      `,

  properties: [
    {
      name: 'data',
      documentation: 'The selected object.'
    }
  ],

  methods: [
    function initE() {
      var summary = this.data.toSummary() + ' ('+this.data.id+')';
      return this
        .start()
        .addClass(this.myClass('row'))
        .translate(summary || ('richChoiceSummary.' + this.data.cls_.id + '.' + this.data.id), summary)
        .end();
    }
  ]
});
