/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'MenuBar',
  extends: 'foam.u2.Element',

  implements: [ 'foam.mlang.Expressions' ],

  requires: [ 'foam.nanos.menu.Menu' ],

  imports: [
    'currentMenu',
    'menuDAO',
    'window'
  ],

  documentation: 'Navigational menu bar',

  css: `
    ^ {
      display: inline-block;
      vertical-align: top;
    }
    ^ ul{
      margin-top: 20px;
      font-size: 13px;
      list-style-type: none;
    }
    ^ li{
      margin-left: 25px;
      display: inline-block;
      cursor: pointer;
    }
    ^ .foam-nanos-menu-SubMenuView-inner{
      z-index: 10001;
    }
  `,

  properties: [
    {
      name: 'menuName',
      value: '' // The root menu
    }
  ],

  methods: [
    function initE() {
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .start('ul')
            .select(this.menuDAO.orderBy(this.Menu.ORDER).where(this.EQ(this.Menu.PARENT, this.menuName)), function(menu) {
              this.start('li')
                .call(function() {
                  var e = this;
                  this.start()
                    .addClass('menuItem')
                    .enableClass('selected', self.currentMenu$.map(function (value) {
                      // only show selected menu if user settings sub menu item has not been selected
                      if ( self.window.location.hash.includes('#set') ) return false;
                      return self.isSelected(value, menu);
                    }))
                    .add(menu.label)
                    .on('click', function() {
                      menu.launch_(self.__context__, e);
                    }.bind(this))
                  .end();
                })
              .end()
            })
          .end()
        .end()
      .end();
    },

    function isSelected(current, menu) {
      if ( ! current ) return false;

      if ( this.window.location.hash.includes('#' + menu.id) ) {
        return true;
      }

      if ( current.parent ) {
        if ( current.parent === menu.id ) {
          return true;
        }
      }

      return false;
    }
  ]
});
