/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.dao',
  name: 'MDBrowserListView',
  extends: 'foam.u2.View',
  requires: [
    'foam.comics.SearchMode',
    'foam.comics.v2.DAOControllerConfig',
    'foam.log.LogLevel',
    'foam.u2.ActionView',
    'foam.u2.dialog.Popup',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.layout.MDSearchView',
    'foam.u2.view.ScrollTableView',
    'foam.u2.view.SimpleSearch',
    'foam.u2.view.TabChoiceView',
    'foam.u2.layout.MDToolbarView',
    'foam.u2.ToolbarAction'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
    List controller with toolbar on top.
  `,

  css: `
    ^ {
      overflow: hidden;
    }

    ^ .search {
      float: right;
    }

//    ^ .foam-u2-view-SimpleSearch .foam-u2-search-TextSearchView .foam-u2-tag-Input {
//      width: 100%;
//    }


//    ^ .foam-u2-search-TextSearchView {
//      display: grid;
//      padding: 20px;
//    }

//    ^ .foam-u2-layout-MDSearchView

//    ^ .foam-u2-layout-MDSideNavigation input[type="search"] {
//      width: 100%;
//      height: 6rem;
//    }


//    ^ .foam-u2-layout-MDSideNavigation .side-nav-view {
//      position: absolute;
//      width:100%;
//      background-color: #f5f7fa;
//      height: 100rem;
//    }

     ^ .menuOpen {
      left: -00px;
      transition: .2s;
    }

    ^ .menuClosed {
      left: -52rem;
      transition: .2s;
    }

    ^ .right .foam-u2-search-TextSearchView {
      margin: 0;
      height: 4rem;
    }

//    .foam-u2-search-TextSearchView {
//      margin: unset !important;
//    }

    ^browse-view-container {
//      margin-top: 10rem;
//      height: 100rem;
      overflow: scroll;
    }
//    ^ .foam-u2-layout-MDSideNavigation {
//      top: 0;
//    }

    ^ .create-btn {
      position: fixed;
      bottom: 3rem;
      right: 3rem;
      border-radius: 100%;
      padding: 3rem;
      color: white;
      font-weight: 900;
      font-size: 4rem;
      background-color: /*%PRIMARY2%*/ #937dff;
      box-shadow: inset 0px 0px 15px 0px white;
    }

    ^ .back-btn {
      background-color: blue;
    padding: 1.5rem;
    }

    ^ .back-btn i {
      font-size: 5rem;
      /* width: fit-content; */
      float: left;
      /* height: 8rem; */
      background-color: unset;
      color: white;
    }
//    ^ .profile-icon {
//      width: fit-content;
//    }
//    ^ .profile-name {
//      font-size: 2.5rem;
//      padding-left: 1rem;
//    }
//    ^ .profile-container {
//      display: flex;
//          align-items: center;
//    }
//    ^ .navigation-header {
//      background-color: blue;
//      z-index: 99;
//      padding-left: 1rem;
//      display: flex;
//      height: 10rem;
//      align-items: center;
//      color: white;
//    }
    .boxless-for-drag-drop {
      background-color: unset;
      border: unset;
    }

    .prof-icon {
      height: 6rem;
      border-radius: 50%;
    }

    .logout {
      font-size: 2rem;
      color: red;
      padding-left: 8rem;
    }

    .no-records {
      font-size: 3rem;
    }
  `,

  imports: [
    'stack',
    'ctrl',
    'user'
  ],

  exports: [
    'dblclick',
    'filteredTableColumns',
    'selection',
    'isSearchActive',
    'isMenuOpen'
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'filteredTableColumns'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config',
      factory: function() {
        return this.DAOControllerConfig.create({ dao: this.data });
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'summaryView',
      factory: function() {
        return {
          class: 'foam.u2.dao.MDDAOList',
          data: this.data,
          rowView: { class: 'foam.u2.layout.MDRowView' }
        }
      }
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'cannedPredicate',
      expression: function(config$cannedQueries) {
        return config$cannedQueries && config$cannedQueries.length
          ? config$cannedQueries[0].predicate
          : foam.mlang.predicate.True.create();
      }
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'searchPredicate',
      expression: function() {
        return foam.mlang.predicate.True.create();
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'predicatedDAO',
      expression: function(config, cannedPredicate, searchPredicate) {
        return config.dao$proxy.where(this.AND(cannedPredicate, searchPredicate));
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'searchFilterDAO',
      expression: function(config, cannedPredicate) {
        return config.dao$proxy.where(cannedPredicate);
      }
    },
    {
      name: 'title',
      expression: function(data$of, isSearchActive) {
        return data$of.model_.plural;
      }
    },
    {
      name: 'rightAction',
      expression: function() {
        return this.SEARCH;
      }
    },
    {
      name: 'leftAction',
      expression: function() {
        return this.OPEN_MENU;
      }
    },
    'selection',
    {
      class: 'Boolean',
      name: 'isMenuOpen',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isSearchActive',
      value: false
    }
  ],
  actions: [
    {
      name: 'openMenu',
      iconFontName: 'menu',
      displayLabel: false,
      code: function() {
        this.isMenuOpen = true;;
      }
    },
    {
      name: 'closeMenu',
      iconFontName: 'arrow_back',
      displayLabel: false,
      code: function() {
        this.isMenuOpen = false;
      }
    },
    {
      name: 'search',
      iconFontName: 'search',
      displayLabel: false,
      code: function() {
        this.isSearchActive = ! this.isSearchActive;
      }
    },
    {
      name: 'create',
      iconFontName: 'add',
      displayLabel: false,
      code: function() {
        if ( ! this.stack ) return;
        this.stack.push({
          class: 'foam.u2.layout.MDCreateBrowserView',
          data: this.data.of.create({ mode: 'create'}, this),
          of: this.data.of
        }, this.__subContext__);
      }
    }
  ],
  methods: [
    function initE() {
      this.SUPER();
      var self = this;

//      this.isMenuOpen$.sub(this.onMenuOpenChanged);
      this.isSearchActive$.sub(this.onSearchActiveChanged);

      this.addClass(this.myClass())
      .startContext({data: this})
         .tag({
           class: 'foam.u2.layout.MDToolbarView',
           title$: self.title$,
           leftAction: self.leftAction$,
           rightAction: self.rightAction$
         })
       .endContext()
      .start('div')
//        .addClass('side-navigation')
//        .addClass(this.slot(function(isMenuOpen) {
//          return isMenuOpen ? 'menuOpen' : 'menuClosed';
//        }, this.isMenuOpen$))
        .tag({ class: 'foam.u2.layout.MDSideNavigation' })
      .end()
      .start(self.summaryView,{
        data: self.predicatedDAO$proxy
      }).addClass(self.myClass('browse-view-container')).end();

      this
      .startContext({data: this})
        .start('div')
          .addClass('create-btn')
          .addClass('material-icons')
          .add('add')
          .on('click', this.onCreate)
        .end()
      .endContext();

    },

    function dblclick(obj) {
      if ( ! this.stack ) return;
      this.stack.push({
        class: 'foam.u2.layout.MDUpdateBrowserView',
        data: obj,
        config: this.config,
        of: this.config.of,
        dao: this.data
      });
    },

    function resetActions() {
      this.title = this.data.of.model_.plural;
      this.rightAction = this.SEARCH;
      this.leftAction = this.OPEN_MENU;
    },

  ],

  listeners: [
    function onMenuOpenChanged() {
    },
    function onCreate() {
      if ( ! this.stack ) return;
      this.stack.push({
        class: 'foam.u2.layout.MDCreateBrowserView',
        data: this.data.of.create({ mode: 'create'}, this),
        of: this.data.of,
        dao: this.data
      }, this.__subContext__);
    },

    function onSearchActiveChanged() {
      if ( this.isSearchActive ) {
        this.rightAction = this.MDSearchView.create({dao$: this.searchFilterDAO$,data$: this.searchPredicate$});
        this.title = '';
      }
      else {
        this.resetActions();
      }
    }
  ]
});
