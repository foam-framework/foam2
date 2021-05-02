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
    'searchColumns',
    'memento'
  ],

  exports: [
    'as data',
    'filterController',
    'currentMemento_ as memento'
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
      border: 1px solid transparent;
      border-radius: 5px;
      display: flex;
      max-height: 0;
      overflow: hidden;
      transition: all 0.24s linear;
      -webkit-transition: all 0.24s linear;
      -moz-transition: all 0.24s linear;
    }

    ^container-drawer-open {
      align-items: center;
      border-color: #cbcfd4;
      margin-top: 24px;
      max-height: -webkit-fill-available;
      max-height:-moz-available;
      overflow: auto;
      padding: 24px;
    }

    ^container-filters {
      display: grid;
      grid-gap: 24px 16px;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      width: 100%;
    }

    ^general-field {
      margin: 0;
      flex: 1 1 80%;
    }

    ^general-field .foam-u2-tag-Input {
      width: 100%;
      height: 34px;
      border-radius: 0 5px 5px 0;
      border: 1px solid /*%GREY4%*/ #e7eaec;
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
      align-self: center;
      color: /*%DESTRUCTIVE3%*/ red;
      flex-shrink: 0;
      margin-right: 0;
    }

    ^link-mode.clear:hover {
      color: /*%DESTRUCTIVE1%*/ darkred;
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

    ^float-result-count {
      float: right;
      padding-top: 8px;
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
    { name: 'LABEL_SEARCH', message: 'Search'},
    { name: 'SELECTED', message: 'selected'},
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

        var columns = of.getAxiomByName('searchColumns');
        columns = columns && columns.columns;
        if ( columns ) return columns;

        columns = of.getAxiomByName('tableColumns');
        columns = columns && columns.columns;
        if ( columns ) {
          return columns.filter(function(c) {
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
    },
    'currentMemento_'
  ],

  methods: [
    function initE() {
      var self = this;

      var counter = 0;
      counter = this.updateCurrentMementoAndReturnCounter(counter);

      counter = this.filters.length;
      //memento which will be exported to table view
      if ( self.currentMemento_ ) self.currentMemento_ = self.currentMemento_.tail;

      this.onDetach(this.filterController$.dot('isAdvanced').sub(this.isAdvancedChanged));
      var selectedLabel = ctrl.__subContext__.translationService.getTranslation(foam.locale, 'foam.u2.filter.FilterView.SELECTED', this.SELECTED);
      this.addClass(self.myClass())
        .add(this.slot(function(filters) {

          counter = self.updateCurrentMementoAndReturnCounter.call(self, counter);

          self.generalSearchField = foam.u2.ViewSpec.createView(self.TextSearchView, {
            richSearch: true,
            of: self.dao.of.id,
            onKey: true,
            viewSpec: {
              class: 'foam.u2.tag.Input',
              placeholder: this.LABEL_SEARCH
            }
          },  this, self.__subSubContext__.createSubContext({ memento: self.currentMemento_ }));

          if ( self.currentMemento_ ) self.currentMemento_ = self.currentMemento_.tail;

          self.show(filters.length);

          var e = this.E();
          e.onDetach(self.filterController);
          e.start().addClass(self.myClass('container-search'))
            .start().addClass(self.myClass('container-handle'))
              .on('click', self.toggleDrawer)
              .start('p').addClass(self.myClass('handle-title')).add(self.LABEL_FILTER).end()
            .end()
            .start()
              .add(self.generalSearchField)
              .addClass(self.myClass('general-field'))
            .end()
          .end()
          .start()
            .style({overflow: 'hidden'})
            .add(this.filterController.slot(function (totalCount, resultsCount) {
              return self.E().addClass(self.myClass('float-result-count')).add(`${resultsCount.toLocaleString(foam.locale)} of ${totalCount.toLocaleString(foam.locale)} ` + selectedLabel);
            }))
          .end()
          .add(this.filterController.slot(function (criterias) {
            return self.E().start().addClass(self.myClass('container-drawer'))
              .enableClass(self.myClass('container-drawer-open'), self.isOpen$)
                .start().addClass(self.myClass('container-filters'))
                  .forEach(filters, function(f) {
                    var axiom = self.dao.of.getAxiomByName(f);
                    if ( axiom ) {
                      var propView = foam.u2.ViewSpec.createView(self.PropertyFilterView, {
                        criteria: 0,
                        searchView: axiom.searchView,
                        property: axiom,
                        dao: self.dao
                      },  self, self.__subSubContext__.createSubContext({ memento: self.currentMemento_ }));

                      counter--;
                      if ( self.currentMemento_ ) {
                        if ( counter != 0 ) {
                          self.currentMemento_ = self.currentMemento_.tail;
                          if ( self.currentMemento_.tail == null )
                            self.currentMemento_.tail = foam.nanos.controller.Memento.create();
                        }
                      }

                      this.start()
                        .add(propView)
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
    },

    function updateCurrentMementoAndReturnCounter() {
      if ( this.memento ) {
        var m = this.memento;
        //i + 1 as there is a textSearch that we also need for memento
        for ( var i = 0 ; i < this.filters.length + 1 ; i++ ) {
          if ( ! m ) {
            m = foam.nanos.controller.Memento.create({ value: '', parent: this.memento });
            this.memento.tail = m;
          } else {
            if ( ! m.tail )
              m.tail = foam.nanos.controller.Memento.create({ value: '', parent: m });
            m = m.tail;
          }
        }
        this.currentMemento_ = this.memento.tail;
      }

      if ( this.currentMemento_ && this.currentMemento_.tail ) {
        var m = this.memento;
        var counter = 0;

        while ( counter < this.filters.length &&  m != null ) {
          m = m.tail;

          counter++;

          if ( ! m || m.head.length == 0 )
            continue;
        }
      }
      return counter;
    }
  ]
});
