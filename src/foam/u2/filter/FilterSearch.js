/**
* @license
* Copyright 2019 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.filter',
  name: 'FilterSearch',
  extends: 'foam.u2.View',

  documentation: `
    Filter search takes the properties defined in 'searchColumns' and creates
    a filter option which allows a user to filter the DAO by.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.core.SimpleSlot',
    'foam.u2.search.SearchManager',
    'foam.u2.filter.FilterViewController',
    'foam.u2.search.TextSearchView'
  ],

  imports: [
    'dao',
    'searchColumns'
  ],

  exports: [
    'as filterController',
    'as data',
    'searchManager'
  ],

  css: `
    ^ {
      flex: 1;
    }

    ^container-search {
      display: flex;
    }

    ^container-drawer {
      max-height: 0;
      overflow: hidden;

      transition: max-height 0.24s ease-in-out;

      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
    }

    ^general-field {
      margin: 0;
      flex: 1 1 80%;
    }

    ^general-field .foam-u2-tag-Input {
      width: 100%;
      height: 34px;
      border-radius: 5px 0 0 5px;
      border: 1px solid /*%GREY4%*/ #cbcfd4;
    }

    ^container-drawer-open {
      max-height: 1000px;
    }

    ^container-handle {
      padding: 0 16px;
      box-sizing: border-box;
      height: 34px;
      border: 1px solid /*%GREY4%*/ #e7eaec;
      border-radius: 0 5px 5px 0;
      background-image: linear-gradient(to bottom, #ffffff, #e7eaec);

      flex: 1 1 20%;
      display: flex;
      align-items: center;
    }

    ^handle-title {
      flex: 1;
      margin: 0;
    }

    ^container-handle:hover {
      cursor: pointer;
      background-image: linear-gradient(to bottom, #ffffff, #d3d6d8);
    }

    ^label-results {
      margin: 0;
      margin-top: 8px;
      font-size: 12px;
      padding: 0 8px;
    }
  `,

  messages: [
    { name: 'LABEL_FILTER', message: 'Filter'},
    { name: 'LABEL_RESULTS', message: 'Filter Results: '}
  ],

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
      expression: function(dao, searchColumns) {
        var of = dao && dao.of;

        if ( ! of ) return [];

        if ( searchColumns ) return searchColumns;

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
      name: 'generalSearchField',
      postSet: function(o, n) {
        this.searchManager.add(n);
      }
    },
    {
      name: 'searchManager',
      factory: function() {
        return this.SearchManager.create({
          dao$: this.dao$,
          predicate$: this.data$
        });
      }
    },
    {
      class: 'Boolean',
      name: 'isOpen'
    },
    {
      class: 'Boolean',
      name: 'isFiltering',
      expression: function(data) {
        if ( ! data ) return false;
        return Object.keys(data.instance_).length > 0;
      }
    },
    {
      class: 'Long',
      name: 'resultsCount'
    },
    {
      class: 'String',
      name: 'resultLabel',
      expression: function(isFiltering, resultsCount) {
        if ( ! isFiltering ) return 'Showing all results';
        return `${this.LABEL_RESULTS}${resultsCount}`;
      }
    },
    {
      class: 'String',
      name: 'iconPath',
      expression: function(isOpen) {
        return isOpen ? 'images/expand-less.svg' : 'images/expand-more.svg';
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.onDetach(this.isFiltering$.sub(this.getResultCount));
      this
        .addClass(self.myClass())
        .add(this.slot(function(filters) {
          self.show(filters.length);

          var e = this.E();
          e.onDetach(self.searchManager);
          e.start().addClass(self.myClass('container-search'))
            .start(self.TextSearchView, {
              richSearch: true,
              of: self.dao.of.id,
              onKey: true,
              viewSpec: {
                class: 'foam.u2.tag.Input',
                placeholder: 'Search'
              }
            }, self.generalSearchField$)
              .addClass(self.myClass('general-field'))
            .end()
            .start().addClass(self.myClass('container-handle'))
              .on('click', self.toggleDrawer)
              .start('p').addClass(self.myClass('handle-title')).add(self.LABEL_FILTER).end()
              .start({ class: 'foam.u2.tag.Image', data$: self.iconPath$}).end()
            .end()
          .end()
          .start().addClass(self.myClass('container-drawer'))
            .enableClass(self.myClass('container-drawer-open'), self.isOpen$)
            .forEach(filters, function(f) {
              var axiom = self.dao.of.getAxiomByName(f);

              if ( axiom ){
                this.start(self.FilterViewController, {
                  searchView: axiom.searchView,
                  property: axiom,
                  dao$: self.dao$
                })
                .end();
              }
            })
          .end()
          .start('p')
            .addClass(self.myClass('label-results'))
            .show(self.isFiltering$)
            .add(self.resultLabel$)
          .end();

          return e;
        }, this.filters$));
    },

    function addFilter(key) {
      this.filters = this.filters.concat(key);
    },

    function removeFilter(key) {
      this.filters = this.filters.filter(function(k) {
        return key !== k;
      });
    },

    //TODO: Move this to a tool? Would be useful for any large number
    function formatLargeValue(num) {
      var symbols = ['K', 'M', 'B', 'T'];

      symbols.forEach((symbol, index) => {
        var upperBound = (index + 1) * 3 * 10;
        if ( num < upperBound ) {
          return index > 0 ? `> ${Math.round(num/(upperBound/100))}${symbol}` : `${num}`;
        }
      });

      return 'Value too large';

      // if ( num < 1000 ) return `${num}`; // Less than K
      // if ( num < 1000000) return `> ${Math.round(num/1000)}K`; // Less than M
      // if ( num < 1000000000) return `> ${Math.round(num/1000000)}M`; // Less than B
      // if ( num < 1000000000000) return `> ${Math.round(num/1000000000)}B`; // Less than T
      // if ( num < 1000000000000000) return `> ${Math.round(num/1000000000000)}T`; // Less than Q

      // return 'Value too large';
    }
  ],

  listeners: [
    {
      name: 'getResultCount',
      code: function() {
        this.searchManager.filteredDAO.select(this.COUNT()).then((count) => {
          this.resultsCount = count.value;
        });
      }
    },
    {
      name: 'toggleDrawer',
      code: function() {
        this.isOpen = ! this.isOpen;
      }
    }
  ]
});
