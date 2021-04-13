/**
* @license
* Copyright 2019 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.filter.properties',
  name: 'ReferenceFilterView',
  extends: 'foam.u2.Controller',
  documentation: `
    Enables easier filtering on Reference properties of a model. Since references
    and relationships use ids, we needed a way to filter them with human readable
    values.
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

    ^label-limit {
      margin-top: 8px;
      margin-bottom: 0;
    }

    ^container-filter {
      max-height: 320px;
      overflow: auto;
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
    { name: 'LABEL_LIMIT_REACHED', message: 'Please refine your search to view more options' },
    { name: 'LABEL_LOADING', message: '- LOADING OPTIONS -' },
    { name: 'LABEL_NO_OPTIONS', message: '- NO OPTIONS AVAILABLE -' },
    { name: 'LABEL_SELECTED', message: 'SELECTED OPTIONS' },
    { name: 'LABEL_FILTERED', message: 'OPTIONS' }
  ],

  properties: [
    {
      name: 'property',
      documentation: `
        The referenced property on which this view is providing string search.
      `,
      required: true
    },
    {
      name: 'targetDAOName',
      documentation: `
        The name of the DAO that contains the reference property - the userDAO
        in the case where a reference to owner is intended to be filtered by
        name rather than id.
      `,
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
      documentation: 'The array containing the actual result of the reference',
      factory: function() {
        return [];
      }
    },
    {
      name: 'idToStringDisplayMap',
      documentation: 'Map that contains the ids as keys and strings as values',
      expression: function(referenceObjectsArray, daoContents) {
        if ( ! daoContents ) return {};
        if ( referenceObjectsArray.length === 0 ) {
          var m = {};
          daoContents.groupKeys.forEach(g => m[g] = g);
          return m;
        }
        var result = {};
        for ( i = 0; i < daoContents.groupKeys.length; i++ ) {
          var refObj = referenceObjectsArray.find(r => r.id == daoContents.groupKeys[i] );
          if ( refObj ) {
            var objectId = refObj.id;
            var summary = refObj.toSummary();
            if ( summary ) {
              result[objectId] = summary;
            } else {
              result[objectId] = `ID: ${objectId}`;
            }
          } else {
            result[0] = '';
          }
        }
        return result;
      }
    },
    {
      name: 'daoContents'
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
        if ( ! daoContents || ! idToStringDisplayMap ) return [];

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
      class: 'Boolean',
      name: 'isLoading',
      documentation: 'Boolean tracking that we are still loading info from DAO',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isOverLimit'
    },
    {
      name: 'predicate',
      documentation: `
        All Search Views must have a predicate as required by the
        Filter Controller. When this property changes, the Filter Controller will
        generate a new main predicate and also reciprocate the changes to the
        other Search Views.
      `,
      expression: function(selectedOptions) {
        if ( selectedOptions.length <= 0 || Object.keys(this.idToStringDisplayMap).length === 0 ) {
          return this.TRUE;
        }
        if ( selectedOptions.length === 1 ) {
          var key = this.getKeyByValue(selectedOptions[0]);
          if ( ! isNaN(key) )
            key = parseInt(key) ? parseInt(key) : key;
          return this.EQ(this.property, key);
        }
        var keys = selectedOptions.map( (label) => {
          var key = this.getKeyByValue(label);
          if ( ! isNaN(key) )
            key = parseInt(key) ? parseInt(key) : key;
          return key;
        });
        return this.IN(this.property, keys);
      }
    },
    {
      name: 'name',
      documentation: 'Required by Filter Controller.',
      expression: function(property) {
        return property.name;
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      if ( ! this.targetDAOName ) {
        console.error('Please specify a targetDAOKey on the reference.');
        return;
      }
      this.onDetach(this.daoContents$.sub(this.updateReferenceObjectsArray));
      this.onDetach(this.dao$.sub(this.daoUpdate));
      this.daoUpdate();

      this.addClass(this.myClass())
        .start().addClass(this.myClass('container-search'))
          .start({
            class: 'foam.u2.TextField',
            data$: this.search$,
            placeholder: this.LABEL_PLACEHOLDER,
            onKey: true
          })
          .end()
          .start('p')
            .addClass(this.myClass('label-limit'))
            .show(this.isOverLimit$)
            .add(this.LABEL_LIMIT_REACHED)
          .end()
        .end()
        .start().addClass(self.myClass('container-filter'))
        .add(this.slot(function(property, selectedOptions, isLoading, idToStringDisplayMap) {
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
                  class: 'foam.u2.CheckBox',
                  data: true,
                  showLabel: true,
                  label: option ? self.getLabelWithCount(option) : self.LABEL_EMPTY
                }).end()
              .end();
            });
          });
        }))
        .add(this.slot(function(property, selectedOptions, filteredOptions, isLoading, idToStringDisplayMap) {
          var element = this.E();
          if ( isLoading ) {
            return element
              .start('p').addClass(self.myClass('label-loading'))
                .add(self.LABEL_LOADING)
              .end();
          }
          if ( filteredOptions.length === 0 ) {
            return element
              .start('p').addClass(self.myClass('label-loading'))
                .add(self.LABEL_NO_OPTIONS)
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
                  class: 'foam.u2.CheckBox',
                  data: false,
                  showLabel: true,
                  label: option ? self.getLabelWithCount(option) : self.LABEL_EMPTY
                }).end()
              .end();
            });
          });
        }))
      .end();
    },

    function getKeyByValue(value) {
      return Object.keys(this.idToStringDisplayMap).find( (key) => this.idToStringDisplayMap[key] === value );
    },

    function getLabelWithCount(option) {
      var referenceKey = this.getKeyByValue(option);
      var countForKey = this.daoContents.groups[referenceKey].value;
      return countForKey > 1 ? `[${countForKey}] ${option}` : option;
    },

    /**
     * Restores the view based on passed in predicate
     */
    function restoreFromPredicate(predicate) {
      if ( predicate === this.TRUE ) return;

      var selections = Array.isArray(predicate.arg2.value) ? predicate.arg2.value : [predicate.arg2.value];
      // wait for idToStringDisplayMap to populate
      this.idToStringDisplayMap$.sub(() => {
        var options = [];
        selections.forEach((selection) => {
          options.push(this.idToStringDisplayMap[selection]);
        });
        this.selectedOptions = options;
      })
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
      name: 'daoUpdate',
      code: function() {
        this.isOverLimit = false;
        this.isLoading = true;
        this.dao.select(this.GROUP_BY(this.property, null, 101)).then((results) => {
          this.daoContents = results; // gets contents from the source dao
          if ( Object.keys(results.groups).length > 100 ) this.isOverLimit = true;
          this.isLoading = false;
        });
      }
    },
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
    },
    {
      name: 'updateReferenceObjectsArray',
      code: function() {
        if ( ! this.daoContents || this.daoContents.groupKeys.length === 0 ) return;
        this.__subContext__[this.targetDAOName].where(this.IN(this.property.of.ID, this.daoContents.groupKeys)).select().then((results) => {
          this.referenceObjectsArray = results.array;
        });
      }
    }
  ]
});
