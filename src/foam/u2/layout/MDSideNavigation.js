/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.u2.layout',
  name: 'MDSideNavigation',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'auth',
    'currentMenu',
    'isMenuOpen',
    'loginSuccess',
    'menuDAO',
    'menuListener',
    'pushMenu',
    'user'
  ],

  requires: [
    'foam.dao.ArraySink',
    'foam.nanos.menu.Menu',
    'foam.u2.layout.MDProfileImageView'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao_',
      factory: function() {
        return this.menuDAO.orderBy(this.Menu.ORDER);
      }
    },
    {
      class: 'String',
      name: 'menuSearch',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        onKey: true
      },
      value: ''
    },
    {
      name: 'profileImg',
      factory: function() {
        return this.MDProfileImageView.create({ label: this.user.legalName,
          src: 'images/ic-placeholder.png' });
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this
      .show(this.loginSuccess$)
      .addClass(this.myClass())
      .addClass(this.slot(function(isMenuOpen) {
        return isMenuOpen ? 'menuOpen' : 'menuClosed';
      }, this.isMenuOpen$))
      .startContext({data: this})
         .tag({
           class: 'foam.u2.layout.MDToolbarView',
           title: self.profileImg,
           leftAction: self.CLOSE_MENU,
           rightAction: self.LOGOUT
         })
       .endContext();
      this
      .start()
        .addClass('side-nav-view')
        .start()
          .startContext({ data: this })
            .start()
              .add(this.MENU_SEARCH)
              .addClass('foam-u2-search-TextSearchView')
            .end()
          .endContext()
          .start()
            .tag({
              class: 'foam.u2.view.TreeView',
              data: self.dao_,
              relationship: foam.nanos.menu.MenuMenuChildrenRelationship,
              startExpanded: true,
              query: self.menuSearch$,
              onClickAddOn: function(data) { self.openMenu(data); },
              selection$: self.currentMenu$,
              formatter: function(data) { this.add({ data : data, clsInfo : data.cls_.LABEL.name, default : data.label }); }
            })
          .end()
        .end()
      .end();
    },

    function openMenu(menu) {
      if ( menu.handler ) {
        this.pushMenu(menu);
        this.menuListener(menu);
      }
    }
  ],

  actions: [
    {
      name: 'closeMenu',
      iconFontName: 'arrow_back',
      displayLabel: false,
      code: function() {
        this.isMenuOpen = ! this.isMenuOpen;
      }
    },
    {
      name: 'logout',
      code: function() {
        this.auth.logout().then(function() {
          this.window.location.hash = '';
          this.window.location.reload();
        })
      }
    }
  ],

  css: `
    ^ {
      padding-top: 10rem;
      z-index: 99;
      width: 50rem;
      height: 100rem;
      position: absolute;
      box-shadow: 0px 0px 50px 0px #000;
      top: 0;
    }
    ^ input[type="search"] {
      width: 90%;
      height: 7rem;
      font-size: 3rem;
    }

    ^ .side-nav-view {
      height: 100%;
      overflow-x: hidden;
      background-color: #f5f7fa;
    }

    ^ .foam-u2-search-TextSearchView {
      padding-top: 4rem;
      width: 100%;
      display: flex;
      justify-content: center;
    }


    ^ .foam-u2-view-TreeViewRow {
      width: 100%;
    }

    ^ .foam-u2-view-TreeViewRow .toggle-icon {
      font-size: 3rem !important;
    }

    ^ .foam-u2-view-TreeViewRow-label {
      font-size: 2.5rem;
      font-weight: 500;
      display: inline-flex;
      justify-content: space-between;
      align-items: center;
      color: /*%GREY1%*/ #5e6061;
    }

    ^ .foam-u2-view-TreeViewRow-selected > .foam-u2-view-TreeViewRow-heading {
       border-left: 1rem solid /*%PRIMARY3%*/ #406dea;
     }

    ^ .foam-u2-view-TreeViewRow-heading {
        height: 10rem;
        padding-left: 3rem !important;
        border-bottom: 1px solid #efefef;
    }

    ^ .foam-u2-view-TreeViewRow-label-icon {
      display: none;
    }

    ^ toolbar .right .foam-u2-ActionView {
        font-size: 2rem;
      }

    ^ .img-container img {
      width: 5rem;
    }

    ^ .foam-u2-layout-MDProfileImageView .label {
      font-size: 2.5rem;
      padding-left: 2rem;
    }


    ^ .child-menu {
      padding-left: 3rem;
    }

    ^ .child-menu .foam-u2-view-TreeViewRow {
        display: unset;
        height: unset;
      }

    ^ .child-menu .foam-u2-view-TreeViewRow-label {
      font-weight: 300;
    }

    ^ .child-menu .foam-u2-view-TreeViewRow-heading {
      padding: unset;
    }
  `
});
