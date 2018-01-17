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

  imports: [ 'menuDAO' ],

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
    },
    {
      //currently selected menu
      name: 'selected'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .start()
          .start('ul')
            .select(this.menuDAO.where(this.EQ(this.Menu.PARENT, this.menuName)), function(menu) {
              this.start('li')
                .call(function() {
                  var e = this;
                  if ( ! self.selected ) self.selected = menu;
                  this.start().addClass('menuItem').enableClass('selected', self.selected$.map(function(selected) { return selected.id == menu.id; }))
                    .add(menu.label)
                    .on('click', function() {
                      menu.launch_(self.__context__, e)
                      self.selected = menu;
                    }.bind(this))
                  .end();
                })
              .end()
            })
          .end()
        .end()
      .end();
    }
  ]
});
