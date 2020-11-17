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
      -moz-box-shadow: 0px 0px 67px -15px rgba(0,0,0,0.75);
      -webkit-box-shadow: 0px 0px 67px -15px rgba(0,0,0,0.75);
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
      box-shadow: 0px 0px 67px -15px rgba(0,0,0,0.75);
      font-weight: 300;
      position: absolute;
      top: 65px;
      width: 240px;
    }
    ^inner div {
      box-sizing: border-box;
      padding: 8px 24px;
      padding-right: 48px;
      cursor: pointer;
      background: white;
      color: black;
      border-left: solid 1px /*%GREY5%*/ #f5f7fa;
      border-right: solid 1px /*%GREY5%*/ #f5f7fa;
    }
    ^inner div:last-child {
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
    }
    ^inner div:hover {
      background: /*%PRIMARY5%*/ #e5f1fc !important;
      border-left: solid 1px /*%PRIMARY5%*/ #e5f1fc;
      border-right: solid 1px /*%PRIMARY5%*/ #e5f1fc;
    }
  `,

  methods: [
    function initE() {
      this.addClass(this.myClass());
      var self = this;
      var menu = this.menu;
      var X    = this.__subContext__;
      menu.children.select({
        put: function(menu) {
          if ( ! menu.handler ) return;
          self.start('div').call(function() {
            var e = this;
            this
              .on('click', function() {
                // TODO: if a submenu, don't close until child closed
                self.close();
                menu.launch_(X, e);
              })
              .translate(menu.id + '.label', menu.label);
            })
          .end();
        },
        eof: function() {}
      });
    }
  ]
});
