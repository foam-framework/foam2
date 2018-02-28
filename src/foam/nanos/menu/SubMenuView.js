/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'SubMenuView',
  extends: 'foam.nanos.menu.PopupMenu',

  requires: [ 'foam.nanos.menu.Menu' ],

  properties: [ 'X', 'menu' ],

  css: `
    ^inner {
      -webkit-box-shadow: 0px 0px 67px -15px rgba(0,0,0,0.75);
      -moz-box-shadow: 0px 0px 67px -15px rgba(0,0,0,0.75);
      box-shadow: 0px 0px 67px -15px rgba(0,0,0,0.75);
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
      position: absolute;
      top: 65px;
      font-weight: 300;
    }
    ^inner div {
      box-sizing: border-box;
      padding: 8px 24px;
      padding-right: 48px;
      cursor: pointer;
      background: white;
      color: black;
      border-left: solid 1px #edf0f5;
      border-right: solid 1px #edf0f5;
    }
    ^inner div:last-child {
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
    }
    ^inner div:hover {
      color: white;
      background: %ACCENTCOLOR% !important;
      border-left: solid 1px %ACCENTCOLOR%;
      border-right: solid 1px %ACCENTCOLOR%;
    }
  `,

  methods: [
    function initE() {
      this.addClass(this.myClass());
      var self = this;
      var menu = this.menu;
      var X    = this.X;

      // TODO: should be orderBy(this.Menu.ORDER, this.Menu.LABEL) when
      // multi-key sorting supported.
      menu.children.orderBy(this.Menu.ORDER).select({
        put: function(menu) {
          if ( ! menu.handler ) return;
          self.start('div')
            .on('click', function() { self.close(); menu.launch(X); })
            .add(menu.label)
          .end();
        },
        eof: function() {}
      });
    }
  ]
});
