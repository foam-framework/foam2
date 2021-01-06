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
      this.start().addClass('container-search')
        .start(self.TextSearchView, {
             richSearch: true,
             of: this.dao.of.id,
             onKey: true,
             view: {
               class: 'foam.u2.tag.Input',
               placeholder: 'Search'
             }
           },this.generalSearchField$)
          .addClass('general-field')
        .end()
      .end()
      .start().addClass('clear-btn')
        .add(this.CLEAR)
      .end()
    },

    function init() {
      this.onload.sub(this.addStyleOpenClose);
      this.onunload.sub(this.removeStyleOpenClose);
    }
  ],

  actions: [
    {
      name: 'clear',
      iconFontName: 'close',
      label: '',
      code: function() {
        this.filterController.clearAll();
        this.generalSearchField.view.data = '';
        this.isSearchActive = false;
      }
    }
  ],

  listeners: [
    {
      name: 'addStyleOpenClose',
      isMerged:true,
      mergeDelay:10, code: function() { this.enableClass('open-close', true);}
    },
    {
      name: 'removeStyleOpenClose',
      isMerged:true,
      mergeDelay:10,
      code: function() { this.addClass('test');}
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
      right: 0;
      width: 0%;
//      transition: 1s;
      position: absolute;
    }

    ^ .container-search {
      flex: 1;
    }
    .open-close .container-search .general-field input {
      width: 100%;
      transition: .5s;
    }

    .test .container-search .general-field input {
      width: 0% !important;
    }
  `
});

