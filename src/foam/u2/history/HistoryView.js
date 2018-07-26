/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.history',
  name: 'HistoryView',
  extends: 'foam.u2.View',
  requires: [
    'foam.dao.history.HistoryRecord',
    'foam.u2.history.HistoryItemView',
  ],

  implements: [ 'foam.mlang.Expressions' ],

  documentation: 'View displaying history',

  css: `
    ^ {
      height: 370px;
      background: white;
      position: relative;
      vertical-align: top;
      border-radius: 2px;
      overflow: auto;
      font-size: 12px;
      padding-left: 20px;
      padding-right: 20px;
      z-index: 0;
    }
    ^ h2 {
      height: 20px;
      opacity: 0.6;
      font-family: Roboto;
      font-size: 20px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: 1;
      letter-spacing: 0.3px;
      text-align: left;
      color: #093649;
    }
    ^ .timelineRecord {
      position: relative;
    }
    ^ .timeline {
      width: 2px;
      height: 100%;
      background: rgba(164, 179, 184, 0.3);
      position: absolute;
      left: 23px;
      top: 5px;
      z-index: -1;
      margin-bottom: 20px;
      content: '';
    }
    ^ > div:last-of-type .timeline {
      display: none;
    }
  `,

  properties: [
    'data',
    'historyItemView',
    { class: 'String', name: 'title', value: 'History' }
  ],

  methods: [
    function initE() {
      var view = this;

      this
        .addClass(this.myClass())
        .start('h2').add(this.title).end()
        .select(view.data.orderBy(this.DESC(this.HistoryRecord.TIMESTAMP)), function(record) {
          return this.E().start('div')
            .addClass('timelineRecord')
            .start('div').addClass('timeline').end()
            .call(function() {
              view.historyItemView.outputRecord(this, record)
            })
          .end();
        });
    }
  ]
});
