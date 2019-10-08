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

  requires: [
    'foam.mlang.predicate.True',
    'foam.u2.CheckBox'
  ],

  css: `
    ^container {
      width: 100%;
      padding: 12px 16px;
    }

    ^container:first-child {
      padding-top: 24px;
    }

    ^container:last-child {
      padding-bottom: 24px;
    }

    ^container .foam-u2-Checkbox:hover, ^container .foam-u2-Checkbox-label:hover {
      cursor: pointer;
    }
  `,

  properties: [
    {
      name: 'targetDAOName',
      documentation: `The property that this view is filtering by. Should be of
      type int that refers to the id of the referenced object.`,
      expression: function(property) {
        return property.targetDAOKey;
      }
    },
    {
      name: 'property',
      documentation: `The property that this view is filtering by. Should be of
      type int that refers to the id of the referenced object.`,
      required: true
    },
    {
      name: 'selectedOptions',
      factory: function() {
        return [];
      }
    },
    {
      name: 'filteredOptions',
      expression: function(property, daoContents, idToStringDisplayMap, search, selectedOptions) {
        if ( ! daoContents || daoContents.length === 0 ) return [];

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

        return options;
      }
    },
    {
      class: 'String',
      name: 'search'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      required: true
    },
    {
      name: 'daoContents',
    },
    {
      name: 'idToStringDisplayMap',
      documentation: 'map that contains ids as keys and names as values',
      expression: function(referenceObjectsArray) {
        if ( ! referenceObjectsArray ) return;
        referenceObjectsArray = referenceObjectsArray.instance_.array;
        var result = {};
        for ( i =0; i < referenceObjectsArray.length; i++ ) {
            if ( this.setOfReferenceIds.has(referenceObjectsArray[i].instance_.id) ) {
              result[referenceObjectsArray[i].instance_.id] = referenceObjectsArray[i].legalName;
            }
          }
        return result;
      }
    },
    {
      name: 'setOfReferenceIds',
      documentation: 'an array of unique reference ids',
      expression: function(daoContents) {
        var result = [];
        daoContents.instance_.array.forEach( function(id) {
          ( result.push(id.instance_.owner) );
        });
        return new Set(result);
      }
    },
    {
      name: 'referenceObjectsArray',
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
          return this.True.create();
        }

        if ( selectedOptions.length === 1 ) {
          return foam.mlang.predicate.Eq.create({
            arg1: this.property,
            arg2: parseInt(getKeyByValue_(idToStringDisplayMap, selectedOptions[0]))
          });
        }

        var pred = foam.mlang.predicate.Or.create({ args: [] });
        selectedOptions.forEach( (string) => {
          pred.args.push(foam.mlang.predicate.Eq.create({
            arg1: this.property,
            arg2: parseInt(getKeyByValue_(idToStringDisplayMap, string))
          }));
        });
        return pred;
      }
  }
  ],


  messages: [
    { name: 'LABEL_PLACEHOLDER', message: 'Search' },
    { name: 'LABEL_SELECTED', message: 'SELECTED OPTIONS' },
    { name: 'LABEL_FILTERED', message: 'OPTIONS' }
  ],


    methods: [
      async function initE() {
        var self  = this;
        this.daoContents = await this.dao.select(); //  gets contents from the source dao
        if ( ! this.targetDAOName ) {
          console.error('Please specify a targetDAOKey on the reference.');
          return;
        }
        this.referenceObjectsArray = await this.__subContext__[this.targetDAOName].select();
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
          .add(this.slot(function(property, selectedOptions) {
            var element = this.E();
            if ( selectedOptions.length <= 0 ) return element;
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
            .add(this.slot(function(property, selectedOptions, filteredOptions) {
            var element = this.E();
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

