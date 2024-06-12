/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.filter.properties',
  name: 'EnumFilterView',
  extends: 'foam.u2.Controller',

  documentation: `
    A Search View for properties of type ENUM. Unlike String and Reference, this
    view does not need to call the DAO. Therefore, it currently does not provide
    the amount of results an option would provide.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  css: `
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
    { name: 'LABEL_SELECTED', message: 'SELECTED OPTIONS' },
    { name: 'LABEL_FILTERED', message: 'OPTIONS' }
  ],

  properties: [
    {
      name: 'property',
      documentation: `
        The property that this view is filtering by. Should be of type Enum.
      `,
      required: true
    },
    {
      class: 'String',
      name: 'search'
    },
    {
      class: 'Array',
      name: 'selectedOptions',
      factory: function() {
        return [];
      }
    },
    {
      name: 'filteredOptions',
      expression: function(property, search, selectedOptions) {
        var options = property.of.VALUES;
        // Filter out search
        if ( search ) {
          var lowerCaseSearch = search.toLowerCase();
          options = options.filter(function(option) {
            return option.label ?
              option.label.toLowerCase().includes(lowerCaseSearch) :
              option.name.toLowerCase().includes(lowerCaseSearch);
          });
        }

        // Filter out selectedOptions
        selectedOptions.forEach(function(selection) {
          options = options.filter(function(option) {
            return option.name !== selection.name;
          });
        });

        return options;
      }
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
        if ( selectedOptions.length <= 0 ) return this.TRUE;
        var ordinals = selectedOptions.map(option => option.ordinal);

        if ( ordinals.length === 1) {
          return this.EQ(this.property, ordinals[0]);
        }

        return this.IN(this.property, ordinals);
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
      this.addClass(this.myClass())
        .start().addClass(this.myClass('container-search'))
          .start({
            class: 'foam.u2.TextField',
            data$: this.search$,
            placeholder: this.LABEL_PLACEHOLDER,
            onKey: true
          })
          .end()
        .end()
        .start().addClass(this.myClass('container-filter'))
          .add(this.slot(function(selectedOptions) {
            var element = this.E();
            if ( selectedOptions.length <= 0 ) return element;
            return element
              .start('p').addClass(self.myClass('label-section'))
                .add(self.LABEL_SELECTED)
              .end()
              .call(function() {
                self.selectedOptions.forEach(function(option, index) {
                  const label = option.label ? option.label : option.name;
                  return element
                    .start().addClass(self.myClass('container-option'))
                      .on('click', () => self.deselectOption(index))
                      .start({
                        class: 'foam.u2.CheckBox',
                        data: true,
                        showLabel: true,
                        label: label
                      }).end()
                    .end();
                });
              });
          }))
          .add(this.slot(function(selectedOptions, filteredOptions) {
            var element = this.E();
            return element
              .start('p').addClass(self.myClass('label-section'))
                .add(self.LABEL_FILTERED)
              .end()
              .call(function() {
                self.filteredOptions.forEach(function(option, index) {
                  const label = option.label || option.name;
                  return element
                    .start().addClass(self.myClass('container-option'))
                      .on('click', () => self.selectOption(index))
                      .start({
                        class: 'foam.u2.CheckBox',
                        data: false,
                        showLabel: true,
                        label: label
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
    },

    /**
    * Restores the view based on passed in predicate
    */
    function restoreFromPredicate(predicate) {
      if ( predicate === this.TRUE ) return;

      if ( Array.isArray(predicate.arg2.value) ) {
        var ordinals = predicate.arg2.value.map((e) => { return e.ordinal; });
        this.selectedOptions = ordinals.map((o) => { return this.property.of.forOrdinal(o); });
        return;
      }
      this.selectedOptions = [this.property.of.forOrdinal(predicate.arg2.value.ordinal)];
    }
  ],

  listeners: [
    {
      name: 'selectOption',
      code: function(index) {
        this.selectedOptions$push(this.filteredOptions[index]);
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
