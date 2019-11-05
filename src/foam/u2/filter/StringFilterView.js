/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.filter',
  name: 'StringFilterView',
  extends: 'foam.u2.Controller',

  documentation: `A SearchView for properties of type String.`,

  implements: [
    'foam.mlang.Expressions'
  ],

  css: `
    ^ {
      position: relative;
    }

    ^container-search {
      padding: 24px 16px;
      border-bottom: solid 1px #cbcfd4;
    }

    ^ .foam-u2-TextField {
      width: 100%;
      height: 36px;

      font-size: 14px;

      border-radius: 3px;
      border: solid 1px #cbcfd4;
      background-color: #ffffff;

      background-image: url(images/ic-search.svg);
      background-repeat: no-repeat;
      background-position: 8px;
      padding: 0 21px 0 38px;
    }

    ^container-filter {
      max-height: 320px;
      overflow: scroll;
      padding-bottom: 24px;
    }

    ^label-section {
      padding: 0 16px;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.33;
      letter-spacing: normal;
      color: #1e1f21;
    }

    ^label-loading {
      padding: 0 16px;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.33;
      letter-spacing: normal;
      color: #1e1f21;
      text-align: center;
    }

    ^container-option {
      display: flex;
      align-items: center;
      padding: 4px 16px;
    }

    ^container-option:hover {
      cursor: pointer;
      background-color: #f5f7fa;
    }

    ^container-option .foam-u2-md-CheckBox-label {
      position: relative;
      margin-top: 0;
    }

    ^container-option .foam-u2-md-CheckBox {
      border-color: #9ba1a6;
    }

    ^container-option .foam-u2-md-CheckBox:checked {
      background-color: #406dea;
      border-color: #406dea;
    }
  `,

  messages: [
    { name: 'LABEL_PLACEHOLDER', message: 'Search' },
    { name: 'LABEL_LOADING', message: '- LOADING OPTIONS -' },
    { name: 'LABEL_SELECTED', message: 'SELECTED OPTIONS' },
    { name: 'LABEL_FILTERED', message: 'OPTIONS' },
    { name: 'LABEL_EMPTY', message: '- Not Defined -' }
  ],

  properties: [
    {
      name: 'property',
      documentation: `The property that this view is filtering by. Should be of
          type String.`,
      required: true
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      required: true
    },
    {
      name: 'daoContents',
      preSet: function(_, n) {
        // remove objects with the same strings for specified property
        var self = this;
        return n.reduce(function(accumulator, obj) {

          // create an identifying id
          var id = obj[self.property];

          // if the id is not found in the temp array
          // add the object to the output array
          // and add the key to the temp array
          if ( accumulator.temp.indexOf(id) === -1 ) {
            accumulator.out.push(obj);
            accumulator.temp.push(id);
          }
          return accumulator;
        // return the zero duplicate array
        }, { temp: [], out: [] }).out;
      }
    },
    {
      class: 'String',
      name: 'search'
    },
    {
      name: 'selectedOptions',
      factory: function() {
        return [];
      }
    },
    {
      name: 'filteredOptions',
      expression: function(property, daoContents, search, selectedOptions) {
        if ( ! daoContents || daoContents.length === 0 ) return [];

        var options = daoContents.map((obj) => obj[this.property].trim());

        // Filter out search
        if ( search ) {
          var lowerCaseSearch = search.toLowerCase();
          options = options.filter(function(option) {
            return option.toLowerCase().includes(lowerCaseSearch);
          });
        }

        // Filter out selectedOptions
        selectedOptions.forEach(function(selection) {
          options = options.filter(function(option) {
            return option !== selection;
          });
        });

        this.isLoading = false;
        return options;
      }
    },
    {
      name: 'predicate',
      documentation: ``,
      expression: function(selectedOptions) {
        if ( selectedOptions.length <= 0 ) return this.TRUE;

        if ( selectedOptions.length === 1 ) {
          return this.EQ(this.property, selectedOptions[0]);
        }

        return this.IN(this.property, selectedOptions);
      }
    },
    {
      name: 'name',
      documentation: `Required by SearchManager.`,
      value: 'String search view'
    },
    {
      class: 'Boolean',
      name: 'isLoading',
      documentation: 'boolean tracking we are still loading info from DAO',
      value: true
    }
  ],

  methods: [
    function initE() {
      this.dao.select().then((results) => {
        this.daoContents = results.array;
      });
      var self = this;
      this
        .addClass(this.myClass())
        .start().addClass(this.myClass('container-search'))
          .start({
            class: 'foam.u2.TextField',
            data$: this.search$,
            placeholder: this.LABEL_PLACEHOLDER,
            onKey: true
          })
          .end()
        .end()
        .start().addClass(self.myClass('container-filter'))
          .add(this.slot(function(property, selectedOptions, isLoading) {
            var element = this.E();
            if ( isLoading || selectedOptions.length <= 0 ) return element;
            return element
              .start('p').addClass(self.myClass('label-section'))
                .add(self.LABEL_SELECTED)
              .end()
              .call(function() {
                self.selectedOptions.forEach(function(option, index) {
                  return element
                    .start().addClass(self.myClass('container-option'))
                      .on('click', () => self.deselectOption(index))
                      .start({
                        class: 'foam.u2.md.CheckBox',
                        data: true,
                        showLabel: true,
                        label: option ? option : self.LABEL_EMPTY
                      }).end()
                    .end();
                });
              });
          }))
          .add(this.slot(function(property, selectedOptions, filteredOptions, isLoading) {
            var element = this.E();
            if ( isLoading ) {
              return element
                .start('p').addClass(self.myClass('label-loading'))
                  .add(self.LABEL_LOADING)
                .end();
            }
            return element
              .start('p').addClass(self.myClass('label-section'))
                .add(self.LABEL_FILTERED)
              .end()
              .call(function() {
                self.filteredOptions.forEach(function(option, index) {
                  return element
                    .start().addClass(self.myClass('container-option'))
                      .on('click', () => self.selectOption(index))
                      .start({
                        class: 'foam.u2.md.CheckBox',
                        data: false,
                        showLabel: true,
                        label: option ? option : self.LABEL_EMPTY
                      }).end()
                    .end();
                });
              });
          }))
        .end();
    },

    /**
     * Clears the fields to their default values.
     * Required on all SearchViews. Called by ReciprocalSearch.
     */
    function clear() {
      this.selectedOptions = [];
    }
  ],

  listeners: [
    {
      name: 'selectOption',
      code: function(index) {
        this.selectedOptions = this.selectedOptions.concat([this.filteredOptions[index]]);
      }
    },
    {
      name: 'deselectOption',
      code: function(index) {
        this.selectedOptions = this.selectedOptions.filter(function(_, selectedIndex) {
          return index !== selectedIndex;
        });
      }
    }
  ]
});
