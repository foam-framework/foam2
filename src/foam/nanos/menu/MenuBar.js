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

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
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
        ^ {
          background: #093649;
          width: 100%;
          min-width: 992px;
          height: 60px;
          color: white;
          padding-top: 5px;
        }
        ^ .menuBar > div > ul {
          margin-top: 0;
          padding-left: 0;
          font-weight: 100;
          color: #ffffff;
        }
        ^ li {
          display: inline-block;
          cursor: pointer;
        }
        ^ .menuItem{
          display: inline-block;
          padding: 0px 0px 10px 0px;
          cursor: pointer;
          border-bottom: 4px solid transparent;
          transition: text-shadow;
        }
        ^ .menuItem:hover {
          border-bottom: 4px solid #1cc2b7;
          padding-bottom: 5px;
          text-shadow: 0 0 0px white, 0 0 0px white;
        }
        ^ .selected {
          border-bottom: 4px solid #1cc2b7;
          padding-bottom: 5px;
          text-shadow: 0 0 0px white, 0 0 0px white;
        }

      */}
    })
  ],

  properties: [
    {
      name: 'menuName',
      value: '' // The root menu
    },
    {
      name: 'selected',
      postSet: function(o, n) {
        if ( o ) o.selected = false;
        n.selected = true;
      }
    },
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
                    this.start().addClass('menuItem').enableClass('selected', menu.selected$)
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
