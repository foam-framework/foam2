/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'foam.nanos.mobile.ui',
  name: 'TopSideNavigation',
  extends: 'foam.u2.Controller',

  documentation: `
    Top and side navigation menu bars. Side navigation bar displays menu items
    available to user and a menu search which navigates to menu after selection.
    Top navigation bar displays application and user related information along
    with personal settings menus.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.menu.VerticalMenu'
  ],

  imports: [
    'menuListener',
    'loginSuccess',
    'isMenuOpen',
    'title',
//    'rightAction'
  ],

  exports: [
//    'title',
    'rightAction'
  ],

  properties: [
//    'title',
    'rightAction'
  ],

  css: `
//    ^ .foam-u2-view-TreeViewRow-label {
//      display: inline-flex;
//      justify-content: space-between;
//      align-items: center;
//      font-size:3rem;
//    }
//
//    ^ .foam-u2-view-TreeViewRow {
//      white-space: normal !important;
//    }

    ^ .foam-nanos-menu-VerticalMenu .side-nav-view {
//      margin-top: 56px;
//      margin-left: -50px;
//      width:100%;
//      background-color: #f5f7fa;
    }
//    ^ .foam-nanos-menu-VerticalMenu .foam-u2-view-TreeViewRow {
//          width: 100%;
//          height: 7rem;
//          border: 1px solid black;
//      }

    ^ .foam-u2-view-TreeViewRow-label {
      font-size: 4rem;
      display: inline-flex;
      justify-content: space-between;
      align-items: center;
    }
//    ^ .foam-u2-view-TreeViewRow-heading {
//      padding-left: 100px;
//    }

    ^ .foam-u2-search-TextSearchView {
      display: grid;
      padding: 20px;
    }

    ^ .foam-nanos-menu-VerticalMenu input[type="search"] {
      width: 100%;
      height: 6rem;
    }

    ^ .foam-u2-view-TreeViewRow {
      height: 9rem;
      display: table;
    }


    ^ .foam-nanos-menu-VerticalMenu .side-nav-view {
//      margin-top: 56px;
//      margin-left: -50px;
    position: fixed;
      width:100%;
      background-color: #f5f7fa;
    }

    ^ .imageMenuStyle {
//      float: left;
      padding: 1.5rem;
      height: 60%;
//      padding-top: 13px;
//      padding-left: 1vw;
//      background-color: /*%PRIMARY1%*/ #202341;
//      cursor: pointer;
//      border: none;
//      outline: none;
    }

    ^ .openMenuStyle {
      margin-left: 4vw;
    }

    ^ .toolbar-title {
          color: white;
              float: right;
              font-size: 3rem;
              margin: auto;
              width: 65%;
              margin-top: 1.5rem;
        }

    ^ .setTopMenu {
      height: 8rem;
      width: 100%;
      z-index: 100001;
      background-color: /*%PRIMARY1%*/ #202341;
      position: fixed;
      top: 0;
    }
  `,

  listeners: [
    function setViewDimentions(event) {
      var coll = document.getElementsByClassName('foam-u2-stack-StackView');
      var i;
      var value;
      for ( i = 0; i < coll.length; i++ ) {
        value = this.isMenuOpen ? 250 : 0;
        coll[i].style.paddingLeft = `${value}px`;
        coll[i].style.maxWidth = `${window.innerWidth - value}px`;
      }
    },
    function toggleMenu(event) {
      this.isMenuOpen = ! this.isMenuOpen;
//      this.setViewDimentions();
    }
  ],
  methods: [
    function init() {
      this.setViewDimentions();
    },
    function initE() {
//    this.title = 'nnnnnenwneiuhwf';
      window.onresize = this.setViewDimentions;
      var self = this;
      // Sets currentMenu and listeners on search selections and subMenu scroll on load.
      if ( window.location.hash != null ) this.menuListener(window.location.hash.replace('#', ''));

      this
      .show(this.loginSuccess$)
      .start()
        .addClass(this.myClass())
        .start()
          .addClass('setTopMenu')
          .start('img')
            .addClass('imageMenuStyle')
            .attr('src', '/images/menu/threeBars.svg')
            .on('click', function() { self.toggleMenu(); } )
          .end()
          .start().addClass('toolbar-title').add(this.title$).end()
          .start()
            .tag(this.rightAction$)
          .end()
          .start()
            .show(this.isMenuOpen$)
            .tag({ class: 'foam.nanos.menu.VerticalMenu' })
          .end()
          .start()
            .addClass('openMenuStyle')
            .tag({ class: 'foam.nanos.mobile.ui.TopNavigation' })
          .end()
        .end()
      .end()
      ;
    }
  ]
});
