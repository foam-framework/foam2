/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.filter',
  name: 'FilterView',
  extends: 'foam.u2.View',

  documentation: `
    Filter View takes the properties defined in 'searchColumns' and creates
    a filter option which allows a user to filter the DAO by.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.core.SimpleSlot',
    'foam.u2.dialog.Popup',
    'foam.u2.filter.FilterController',
    'foam.u2.filter.property.PropertyFilterView',
    'foam.u2.search.TextSearchView'
  ],

  imports: [
    'searchColumns'
  ],

  exports: [
    'as data',
    'filterController'
  ],

  css: `
    ^ {
      flex: 1;
      position: relative;
    }

    ^container-search {
      display: flex;
    }

    ^container-drawer {
      max-height: 0;
      overflow: hidden;

      transition: all 0.24s linear;

      display: flex;

      border: 1px solid transparent;
      border-radius: 5px;
    }

    ^container-drawer-open {
      border-color: #cbcfd4;
      margin-top: 24px;
      max-height: 500px;
    }

    ^container-filters {
      display: flex;
      flex: 1;
      flex-wrap: wrap;
      align-items: center;
    }

    ^general-field {
      margin: 0;
      flex: 1 1 80%;
    }

    ^general-field .foam-u2-tag-Input {
      width: 100%;
      height: 34px;
      border-radius: 0 5px 5px 0;
      border: 1px solid /*%GREY4%*/ #cbcfd4;
    }

    ^container-search .foam-u2-search-TextSearchView {
      margin: 0;
    }

    ^container-handle {
      padding: 0 16px;
      box-sizing: border-box;
      height: 34px;
      border: 1px solid /*%GREY4%*/ #e7eaec;
      border-radius: 5px 0 0 5px;
      background-image: linear-gradient(to bottom, #ffffff, #e7eaec);

      flex: 1 1 5%;
      display: flex;
      align-items: center;
    }

    ^handle-title {
      flex: 1;
      margin: 0;
      text-align: center;
    }

    ^container-handle:hover {
      cursor: pointer;
      background-image: linear-gradient(to bottom, #ffffff, #d3d6d8);
    }

    ^container-footer {
      margin-top: 8px;
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    ^label-results {
      margin: 0;
      font-size: 12px;
      padding: 0 8px;
      flex: 1;
    }

    ^link-mode {
      margin: 0;
      font-size: 14px;
      margin: 16px;
      cursor: pointer;
    }

    ^link-mode.advanced {
      color: #9ba1a6;
      text-decoration: underline;
    }

    ^link-mode.advanced:hover {
      color: #5e6061;
    }

    ^link-mode.clear {
      color: red;
      margin: 24px 16px;
      flex-shrink: 0;
      align-self: flex-start;
    }

    ^link-mode.clear:hover {
      color: darkred;
    }

    ^message-advanced {
      margin: 16px;
    }

    ^message-view {
      margin: 16px;
      margin-left: auto;
      color: #4D7AF7;
    }

    ^message-view:hover {
      cursor: pointer;
      color: #233E8B;
    }

    ^ .foam-u2-dialog-Popup-inner {
      width: 75%;
      height: 80%;
      border-radius: 5px;
    }
  `,

  messages: [
    { name: 'LABEL_FILTER', message: 'Filters'},
    { name: 'LABEL_RESULTS', message: 'Filter results: '},
    { name: 'LABEL_CLEAR', message: 'Clear filters'},
    { name: 'LINK_ADVANCED', message: 'Advanced filters'},
    { name: 'LINK_SIMPLE', message: 'Switch to simple filters'},
    { name: 'MESSAGE_ADVANCEDMODE', message: 'Advanced filters are currently being used.'},
    { name: 'MESSAGE_VIEWADVANCED', message: 'View filters'},
  ],

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      name: 'dao'
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
        this.filterController.add(n, n.name, 0);
      }
    },
    {
      name: 'filterController',
      factory: function() {
        return this.FilterController.create({
          dao$: this.dao$,
          finalPredicate$: this.data$
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
      class: 'String',
      name: 'resultLabel',
      expression: function(isFiltering, filterController$totalCount, filterController$resultsCount ) {
        if ( ! isFiltering ) return '';
        return `${this.LABEL_RESULTS}${filterController$resultsCount} of ${filterController$totalCount}`;
      }
    },
    {
      class: 'String',
      name: 'iconPath',
      expression: function(isOpen) {
        return isOpen ? 'images/expand-less.svg' : 'images/expand-more.svg';
      }
    },
    {
      class: 'String',
      name: 'modeLabel',
      expression: function(filterController$isAdvanced) {
        return filterController$isAdvanced ? this.LINK_SIMPLE : this.LINK_ADVANCED;
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.onDetach(this.filterController$.dot('isAdvanced').sub(this.isAdvancedChanged));
      this.addClass(self.myClass())
        .add(this.slot(function(filters) {
          self.show(filters.length);

          var e = this.E();
          e.onDetach(self.filterController);
          e.start().addClass(self.myClass('container-search'))
            .start().addClass(self.myClass('container-handle'))
              .on('click', self.toggleDrawer)
              .start('p').addClass(self.myClass('handle-title')).add(self.LABEL_FILTER).end()
            .end()
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

          .end()
          .add(this.filterController.slot(function (criterias) {
            return self.E().start().addClass(self.myClass('container-drawer'))
              .enableClass(self.myClass('container-drawer-open'), self.isOpen$)
                .start().addClass(self.myClass('container-filters'))
                  .forEach(filters, function(f) {
                    var axiom = self.dao.of.getAxiomByName(f);
                    if ( axiom ){
                      this.start(self.PropertyFilterView, {
                        criteria: 0,
                        searchView: axiom.searchView,
                        property: axiom,
                        dao: self.dao
                      })
                      .hide(self.filterController$.dot('isAdvanced'))
                      .end();
                    }
                  })
                  .start('p')
                    .show(self.filterController$.dot('isAdvanced'))
                    .addClass(self.myClass('message-advanced'))
                    .add(self.MESSAGE_ADVANCEDMODE)
                  .end()
                  .start('p')
                    .show(self.filterController$.dot('isAdvanced'))
                    .addClass(self.myClass('message-view'))
                    .on('click', self.openAdvanced)
                    .add(self.MESSAGE_VIEWADVANCED)
                  .end()
                  .start('p')
                    .addClass(self.myClass('link-mode'))
                    .addClass('advanced')
                    .on('click', self.toggleMode)
                    .add(self.modeLabel$)
                  .end()
                .end()
                .start('p')
                  .hide(self.filterController$.dot('isAdvanced'))
                  .addClass(self.myClass('link-mode'))
                  .addClass('clear')
                  .on('click', self.clearAll)
                  .add(self.LABEL_CLEAR)
                .end()

            .end()
            .start().addClass(self.myClass('container-footer'))
              .start('p')
                .addClass(self.myClass('label-results'))
                .add(self.resultLabel$)
              .end()
            .end();
          }))

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
      var range = '';
      if ( num < 1000 ) return num;
      symbols.forEach((symbol, index) => {
        var lowerBound = Math.pow(10, (index + 1) * 3);
        var upperBound = lowerBound * 1000;
        if ( num >= lowerBound && num < upperBound ) {
          range = `~ ${Math.round(num/lowerBound)}${symbol}`;
        }
      });

      return range? range : 'Value too large';
    }
  ],

  listeners: [
    {
      name: 'toggleDrawer',
      code: function() {
        this.isOpen = ! this.isOpen;
      }
    },
    {
      name: 'clearAll',
      code: function() {
        // clear all filters
        if ( this.filterController.isAdvanced ) return;
        this.filterController.clearAll();
        this.generalSearchField.view.data = '';
      }
    },
    {
      name: 'toggleMode',
      code: function() {
        if ( this.filterController.isAdvanced ) {
          // Switch back to simple mode
          this.filterController.switchToSimple();
          return;
        }
        this.filterController.switchToPreview();
        this.openAdvanced();
      }
    },
    {
      name: 'openAdvanced',
      code: function() {
        this.add(this.Popup.create().tag({
          class: 'foam.u2.filter.advanced.AdvancedFilterView',
          dao$: this.dao$
        }));
      }
    },
    {
      name: 'isAdvancedChanged',
      code: function() {
        if ( ! this.filterController.isAdvanced ) {
          this.filterController.add(this.generalSearchField, 'generalSearchField', 0);
          this.generalSearchField.mode = foam.u2.DisplayMode.RW;
        } else {
          this.generalSearchField.data = '';
          this.generalSearchField.mode = foam.u2.DisplayMode.DISABLED;
        }
      }
    }
  ]
});
