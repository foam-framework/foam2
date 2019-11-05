/**
* @license
* Copyright 2019 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.filter',
  name: 'ReferenceFilterView',
  extends: 'foam.u2.Controller',

  documentation: `
    Enables string filtering on Reference properties of a model.
    An example might be - enables search by name rather than id of owner on a model where owner is a reference to users.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.CheckBox'
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

  properties: [
    {
      name: 'property',
      documentation: `The property that this view is filtering by. Should be of
      type int that refers to the id of the referenced object.`,
      required: true
    },
    {
      name: 'targetDAOName',
      documentation: `The property that this view is filtering by. Should be of
      type int that refers to the id of the referenced object.`,
      expression: function(property) {
        return property.targetDAOKey;
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      required: true
    },
    {
      name: 'referenceObjectsArray',
      factory: function() {
        return [];
      }
    },
    {
      name: 'idToStringDisplayMap',
      documentation: 'map that contains ids as keys and names as values',
      expression: function(referenceObjectsArray, setOfReferenceIds) {
        if ( ! referenceObjectsArray || ! setOfReferenceIds ) return {};
        var result = {};
        for ( i =0; i < referenceObjectsArray.length; i++ ) {
          if ( setOfReferenceIds.has(referenceObjectsArray[i].id) ) {
            var objectId = referenceObjectsArray[i].id;
            var summary = referenceObjectsArray[i].toSummary();
            if ( summary ) {
              result[objectId] = summary;
            } else {
              result[objectId] = `ID: ${objectId}`;
            }
          }
        }
        return result;
      }
    },
    {
      name: 'daoContents',
      factory: function() {
        return [];
      }
    },
    {
      name: 'setOfReferenceIds',
      documentation: 'an array of unique reference ids',
      expression: function(daoContents) {
        if ( ! daoContents ) return;
        var self = this;
        var result = [];
        daoContents.forEach( function(content) {
          result.push(content[self.property]);
        });
        return new Set(result);
      }
    },
    {
      name: 'selectedOptions',
      factory: function() {
        return [];
      }
    },
    {
      class: 'String',
      name: 'search',
      documentation: 'Property used to search for available options'
    },
    {
      name: 'filteredOptions',
      expression: function(property, daoContents, idToStringDisplayMap, search, selectedOptions) {
        if ( ! daoContents || daoContents.length === 0 || ! idToStringDisplayMap ) return [];

        var options = Object.values(idToStringDisplayMap);

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
      name: 'name',
      documentation: `Required by SearchManager.`,
      value: 'Reference filter view'
    },
    {
      name: 'predicate',
      documentation: ``,
      expression: function(selectedOptions, idToStringDisplayMap) {
        function getKeyByValue_(object, value) {
          return Object.keys(object).find( (key) => object[key] === value );
        }

        if ( selectedOptions.length <= 0 ) {
          return this.TRUE;
        }

        if ( selectedOptions.length === 1 ) {
          var key = getKeyByValue_(idToStringDisplayMap, selectedOptions[0]);
          key = parseInt(key) ? parseInt(key) : key;
          return this.EQ(this.property, key);
        }

        var keys = selectedOptions.map( (label) => {
          var key = getKeyByValue_(idToStringDisplayMap, label);
          key = parseInt(key) ? parseInt(key) : key;
          return key;
        });

        return this.IN(this.property, keys);
      }
    },
    {
      class: 'Boolean',
      name: 'isLoading',
      documentation: 'boolean tracking we are still loading info from DAO',
      value: true
    }
  ],


  messages: [
    { name: 'LABEL_PLACEHOLDER', message: 'Search' },
    { name: 'LABEL_LOADING', message: '- LOADING OPTIONS -' },
    { name: 'LABEL_SELECTED', message: 'SELECTED OPTIONS' },
    { name: 'LABEL_FILTERED', message: 'OPTIONS' }
  ],


  methods: [
    function initE() {
      var self  = this;
      if ( ! this.targetDAOName ) {
        console.error('Please specify a targetDAOKey on the reference.');
        return;
      }

      this.dao.select().then(function(result) {
        self.daoContents = result.array; //  gets contents from the source dao
      });

      this.__subContext__[this.targetDAOName].select().then(function(result) {
        self.referenceObjectsArray = result.array;
      });

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
