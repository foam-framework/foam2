/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ticket',
  name: 'SummaryCard',
  extends: 'foam.u2.View',

  documentation: 'Cards for summary views',

  css: `
    ^ {
      display: inline-block;
      width: 145px;
      background: white;
      height: 100px;
      vertical-align: top;
      margin-left: 6px;
      border-radius: 3px;
      overflow: hidden;
      border: 3px solid white;
    }
    ^ .label {
      color: white;
      position: relative;
      top: 35;
      left: 10;
      font-size: 12px;
      font-weight: normal;
      padding: 3px 7px;
      display: inline;
    }
    ^ .count {
      font-size: 30px;
      font-weight: 300;
      line-height: 1;
      position: relative;
      top: 20;
      left: 20;
    }
  `,

  properties: [
    'count',
    'status'
  ],

  methods: [
    function initE(){
      var self = this;
      this
        .addClass(this.myClass())
          .start().addClass('count').add(this.count$).end()
          .start()
            .addClass(this.status)
            .addClass('label')
            .addClass('special-status-tag')
            .add(this.status)
          .end()
        .end();
    },
  ]
});
