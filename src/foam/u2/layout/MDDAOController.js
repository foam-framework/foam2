/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'MDDAOController',
  extends: 'foam.u2.View',

  requires: [
    'foam.comics.v2.DAOControllerConfig',
    'foam.u2.layout.MDSearchView',
    'foam.u2.layout.MDToolbarView'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
    MD DAO controller with toolbar on top.
  `,

  imports: [
    'isMenuOpen',
    'stack'
  ],

  exports: [
    'dblclick',
    'filteredTableColumns',
    'isSearchActive',
    'selection'
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
    'selection',
    {
      class: 'Boolean',
      name: 'isSearchActive'
    }
  ],

  actions: [
    {
      name: 'openMenu',
      iconFontName: 'menu',
      label: '',
      code: function() {
        this.isMenuOpen = true;
      }
    },
    {
      name: 'search',
      iconFontName: 'search',
      label: '',
      code: function() {
        this.isSearchActive = ! this.isSearchActive;
      }
    },
    {
      name: 'create',
      iconFontName: 'add',
      label: '',
      code: function() {
        if ( ! this.stack ) return;
        this.stack.push({
          class: 'foam.u2.layout.MDDAOCreateController',
          data: this.data.of.create({ mode: 'create'}, this),
          of: this.data.of
        }, this);
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.isMenuOpen = false;

      this.isSearchActive$.sub(this.onSearchActiveChanged);

      this.addClass(this.myClass())
      .startContext({data: this})
         .tag({
           class: 'foam.u2.layout.MDToolbarView',
           title$: self.title$,
           leftAction: self.OPEN_MENU,
           rightAction: self.rightAction$
         })
       .endContext()
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
        class: 'foam.u2.layout.MDDAOUpdateController',
        data: obj,
        config: this.config,
        of: this.config.of,
        dao: this.data
      }, this);
    },

    function resetActions() {
      this.title = this.data.of.model_.plural;
      this.rightAction = this.SEARCH;
    }
  ],

  listeners: [
    function onCreate() {
      if ( ! this.stack ) return;
      this.stack.push({
        class: 'foam.u2.layout.MDDAOCreateController',
        data: this.data.of.create({ mode: 'create'}, this),
        of: this.data.of,
        dao: this.data
      }, this.__subContext__);
    },

    function onSearchActiveChanged() {
      if ( this.isSearchActive ) {
        this.rightAction = this.MDSearchView.create({dao$: this.searchFilterDAO$,data$: this.searchPredicate$});
        this.title = '';
      } else {
        this.resetActions();
      }
    }
  ],

  css: `
    ^ .right .foam-u2-search-TextSearchView {
      position: relative;
    }

    ^ .right {
      flex: 1;
    }

    ^ .create-btn {
      position: absolute;
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
  `
});
