/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'ResultView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.HTMLView',
    'foam.u2.tag.TextArea'
  ],

  documentation: `View to display DIG results. Will be a TextArea for plaintext
    and an HTMLView for HTML`,

  css: `
    ^ {
      margin-bottom: 5px;
      overflow-x: auto;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass());

      this.add(this.data$.map(data => {
        if ( data.length && data.substring(0, 6) == '<html>' ) {
          return this.HTMLView.create({data: this.data});
        }

        var rows = data ? Math.min(20, this.data.split('\n').length) : 2;
        return this.TextArea.create({data: this.data, rows: 16, cols: 120, escapeTextArea: false});
      }));
    }
  ]
});
