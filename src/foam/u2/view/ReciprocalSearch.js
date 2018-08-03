/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ReciprocalSearch',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.search.SearchManager',
    'foam.u2.view.SearchViewWrapper'
  ],

  imports: [
    'dao'
  ],

  exports: [
    'as filterController',
    'as data'
  ],

  // TODO: CSS classname shouldn't be .net-nanopay-ui-ActionView, fix.
  css: `
    ^ {
      background-color: white;
      border-radius: 2px;
      min-width: 300px;
      font-size: medium;
    }

    ^ input {
      font-size: medium;
    }

    ^ .foam-u2-tag-Input {
      background-image: url("images/ic-search.svg");
      background-repeat: no-repeat;
      background-position: 8px;
      border-radius: 2px;
      border: 1px solid #dce0e7;
      color: #093649;
      font-size: 14px;
      height: 40px;
      padding: 0 21px 0 38px;
      width: 100%;
    }

    ^ input:not([type="checkbox"]):focus, ^ select:focus {
      outline: none;
      border: 1px solid #59a5d5;
    }

    ^ .general-query {
      padding: 20px;
    }

    ^count {
      font-size: 14pt;
      color: #555;
      margin: 20px 20px 0 20px;
    }

    ^ .net-nanopay-ui-ActionView-clear {
      background-color: rgba(164, 179, 184, 0.1);
      border: solid 1px rgba(164, 179, 184, 0.5);
      border-radius: 2px;
      color: #093649;
      font-family: Roboto;
      font-size: 14px;
      font-stretch: normal;
      font-style: normal;
      font-weight: normal;
      height: 40px;
      letter-spacing: 0.2px;
      line-height: 2.86;
      text-align: center;
      width: 60px;
      margin: 20px;
    }
  `,

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      name: 'data'
    },
    {
      class: 'Array',
      name: 'filters',
      factory: null,
      expression: function(dao) {
        var of = dao && dao.of;

        if ( ! of ) return [];

        if ( of.model_.searchColumns ) return of.model_.searchColumns;

        if ( of.model_.tableColumns ) {
          return of.model_.tableColumns.filter(function(c) {
            var axiom = of.getAxiomByName(c);
            return axiom && axiom.searchView;
          });
        }

        return of.getAxiomsByClass(foam.core.Property)
            .filter((prop) => prop.searchView && ! prop.hidden)
            .map(foam.core.Property.NAME.f);
      }
    },
    {
      class: 'Int',
      name: 'selectedCount'
    },
    {
      class: 'Int',
      name: 'totalCount'
    },
  ],

  methods: [
    function initE() {
      var self = this;

      this.dao.on.sub(this.updateTotalCount);
      this.updateTotalCount();

      this.
        addClass(self.myClass()).
        add(this.slot(function(filters) {
          self.show(filters.length);

          var searchManager = self.SearchManager.create({
            dao$: self.dao$,
            predicate$: self.data$
          });

          searchManager.filteredDAO$.sub(self.updateSelectedCount);
          self.updateSelectedCount(0, 0, 0, searchManager.filteredDAO$);

          var e = this.E('div');

          e.onDetach(searchManager);

          var generalQueryView = foam.u2.ViewSpec.createView(
              { class: 'foam.u2.search.TextSearchView' },
              {
                richSearch: true,
                of: self.dao.of.id,
                onKey: true
              },
              this,
              this.__subSubContext__);
          searchManager.add(generalQueryView);
          e.start(generalQueryView).addClass('general-query').end();

          e.forEach(filters, function(f) {
            // TODO: See if this can be cleaned up somehow, if searchView didn't
            // require the proprety explicitly, or could find the search manager
            // via the context and add itself to that.
            var axiom = self.dao.of.getAxiomByName(f);
            var spec = axiom.searchView;
            var view = foam.u2.ViewSpec.createView(spec, {
              property: axiom,
              dao: self.dao
            }, this, this.__subSubContext__);

            searchManager.add(view);
            this
              .start(self.SearchViewWrapper, { searchView: view })
                .addClass(self.myClass('filter'))
              .end();
          });

          return e;
        }, this.filters$))
        .start()
          .addClass(self.myClass('count'))
          // TODO: move formatting function to stdlib
          .add(self.selectedCount$.map(function(a) {
            return a.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          }))
          .entity('nbsp')
          .add('of')
          .entity('nbsp')
          .add(self.totalCount$.map(function(a) {
            return a.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          }))
          .entity('nbsp')
          .add('selected')
        .end()
        .tag(this.CLEAR);
    },

    function addFilter(key) {
      this.filters = this.filters.concat(key);
    },

    function removeFilter(key) {
      this.filters = this.filters.filter(function(k) {
        return key !== k;
      });
    }
  ],

  actions: [
    {
      name: 'clear',
      code: function() {
        this.data = undefined;
        this.filters = this.filters.slice();
      }
    }
  ],

  listeners: [
    {
      name: 'updateTotalCount',
      isFramed: true,
      code: function() {
        this.dao.select(foam.mlang.sink.Count.create()).then(function(c) {
          this.totalCount = c.value;
        }.bind(this));
      }
    },
    {
      name: 'updateSelectedCount',
      isFramed: true,
      code: function(_, __, ___, dao) {
        dao.get().select(foam.mlang.sink.Count.create()).then(function(c) {
          this.selectedCount = c.value;
        }.bind(this));
      }
    }
  ]
});
