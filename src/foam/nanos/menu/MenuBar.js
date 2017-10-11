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
      */}
    })
  ],

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
              .select(this.menuDAO.where(this.EQ(this.Menu.PARENT, this.menuName)), function(menu) {
                this.start('li')
                  .call(function() {
                    var e = this;
                    this.start()
                      .add(menu.label)
                      .on('click', function() { menu.handler && menu.handler.launch(self.__context__, menu, e) })
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
