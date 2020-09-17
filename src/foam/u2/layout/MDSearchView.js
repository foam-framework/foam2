/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'MDSearchView',
  extends: 'foam.u2.Element',

  documentation: `
      Simple md-styled search view.
  `,

  requires: [
    'foam.u2.filter.FilterController',
    'foam.u2.search.TextSearchView'
  ],

  imports: [
    'isSearchActive'
  ],

  exports: [
    'as data',
    'filterController'
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
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.addClass(self.myClass())
      this.start().addClass(self.myClass('container-search'))
        .start(self.TextSearchView, {
          richSearch: true,
          of: this.dao.of.id,
          onKey: true,
          viewSpec: {
            class: 'foam.u2.tag.Input',
            placeholder: 'Search'
          }
        }, this.generalSearchField$)
          .addClass(self.myClass('general-field'))
        .end()
      .end()
      .start().addClass('clear-btn')
        .add(this.CLEAR)
      .end()
    }
  ],

  actions: [
    {
      name: 'clear',
      iconFontName: 'close',
      displayLabel: false,
      code: function() {
        this.filterController.clearAll();
        this.generalSearchField.view.data = '';
        this.isSearchActive = false;
      }
    }
  ],

  css: `
    ^ {
      display: flex;
    }

    ^ .clear-btn {
      display: flex;
      align-items: center;
    }

    ^ .clear-btn i {
      background-color: unset;
      color: white;
      font-size: 3.5rem;
    }

    ^ input {
      background-color: unset;
      border: none;
      border-bottom: solid 1px white;
      font-size: 3rem;
      color: white;
    }
  `
});

