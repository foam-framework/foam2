/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.history',
  name: 'HistoryView',
  extends: 'foam.u2.View',
  requires: [ 'foam.u2.history.HistoryItemView' ],

  documentation: 'View displaying history',

  axioms: [
    foam.u2.CSS.create({
      code: `
        ^{
          width: 905px;
          height: 370px;
          background: white;
          position: relative;
          vertical-align: top;
          margin-right: 6px;
          border-radius: 3px;
          overflow: auto;
          font-size: 12px;
          padding-left: 40px;
          padding-top: 20px;
          padding-bottom: 20px;
          margin-bottom: 20px;
          z-index: 0;
        }
        ^h2 {
          width: 128px;
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
        ^timelineRecord {
          position: relative;
        }
        ^timeline {
          width: 2px;
          height: 100%;
          background: rgba(164, 179, 184, 0.3);
          position: absolute;
          left: 23px;
          top: 5px;
          z-index: -1;
          margin-bottom: 20px;
          content: '';
        }`
    })
  ],

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
        .call(function outputRecords() {
          // Gets records from DAO
          view.data.select().then(function(records) {
            // Reverses records array for chronological output
            view.forEach(records.array.reverse(), function(record) {
              view.start('div')
                .addClass(view.myClass('timelineRecord'))
                .start('div').addClass(view.myClass('timeline')).end()
                .call(function() {
                  view.historyItemView.outputRecord(this, record)
                })
              .end();
            })
          })
        });
    }
  ]
});
