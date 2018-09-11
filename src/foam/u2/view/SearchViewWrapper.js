/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'SearchViewWrapper',
  extends: 'foam.u2.View',

  documentation: `Wraps a SearchView with a checkbox to enable or disable its
    predicate.`,

  requires: [
    'foam.mlang.predicate.True'
  ],

  css: `
    ^ {
      background-color: white;
      border-bottom: 1px solid #e9e9e9;
      color: #093649;
      padding: 0;
    }

    ^ .foam-u2-md-CheckBox {
      border: 1px solid #d6dddf;
    }

    ^ .form-element-container {
      background-color: #f6f9f9;
      border-top: 1px solid #e9e9e9;
    }

    ^ .section {
      padding: 13px 16px;
    }

    ^ .section:first-of-type {
      display: flex;
      align-items: center;
    }

    ^ .section:first-of-type label {
      position: initial;
      margin: 0 0 0 8px;
    }

    ^ .foam-u2-search-TextSearchView {
      position: relative;
    }

    ^ .foam-u2-search-GroupBySearchView .foam-u2-tag-Select {
      background-color: rgba(0, 0, 0, 0);
      border: 0;
      width: 100%;
    }

    ^ .foam-u2-search-GroupBySearchView .foam-u2-tag-Select > option:hover {
      background-color: rgba(164, 179, 184, 0.3);
    }

    ^ .foam-u2-search-GroupBySearchView .foam-u2-tag-Select > option {
      color: #093649;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.6;
      letter-spacing: 0.2px;
      padding: 0 21px;
    }
  `,

  properties: [
    {
      name: 'searchView',
      documentation: `The SearchView to wrap. You must set this.`,
      required: true
    },
    {
      name: 'checkbox',
      documentation: `A named reference to the checkbox in this view so that we
        can subscribe to events that it publishes.`,
    },
    {
      class: 'Boolean',
      name: 'active',
      documentation: `Tracks whether the property is being used as part of the
        filter criteria or not.`
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .addClass('section')
          .tag(
            { class: 'foam.u2.md.CheckBox', },
            { label: this.searchView.property.label },
            this.checkbox$
          )
        .end()
        .start()
          .addClass('section')
          .addClass('form-element-container')
          .show(this.active$)
          .add(this.searchView)
        .end();

      this.checkbox.data$.sub(this.checkboxChanged);
    }
  ],

  listeners: [
    function checkboxChanged() {
      if ( this.active ) this.searchView.clear();
      this.active = ! this.active;
    }
  ]
});
