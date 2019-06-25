/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'SideNavigation',
  extends: 'foam.u2.View',
  
  documentation: 'Side navigation bar',
  
  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.menu.Menu',
    'foam.nanos.u2.navigation.SideNavigationItemView'
  ],

  imports: [
    'menuDAO'
  ],

  css:`
  ^side-nav {
    height: 100%;
    width: 200px;
    z-index: 1;
    top: 0;
    left: 0;
    overflow-x: hidden;
    background: /*%BLACK%*/ #1e1f21;
    display: inline-block;
  }
  ^side-nav div a {
    display: inline-block;
    margin: 8px 8px 8px 8px;
    transition: all .15s ease-in-out;
    border-top: 1px;
    color: #fff;
    cursor: pointer;
  }
  ^side-nav div a:hover {
    opacity:1 !important;
  }
  `,

  properties: [
    {
      class: 'String',
      name: 'menuName',
    }
  ],

  methods: [
    function initE() {
      var self = this;
      var dao = this.menuDAO
        .orderBy(this.Menu.ORDER)
        .where(this.EQ(this.Menu.PARENT, this.menuName));
      this.addClass(this.myClass())
        .start()
          .addClass(this.myClass('side-nav'))
          .select(dao, function(menu) {
            return foam.nanos.u2.navigation.SideNavigationItemView.create({ data: menu, level: 0 }, this);
          })
        .end();
    }
  ]
});
