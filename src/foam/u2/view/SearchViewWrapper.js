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
    'foam.mlang.predicate.True',
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
      background-color: #e9e9e9;
    }

    ^ .section {
      padding: 10px 13px;
    }

    ^ .foam-u2-search-TextSearchView {
      position: relative;
    }

    ^ .foam-u2-tag-Input {
      background-image: url("images/ic-search.svg");
      background-repeat: no-repeat;
      background-position: 8px;
      border-radius: 2px;
      border: 1px solid #dce0e7;
      color: #093649;
      font-size: 14px;
      height: 40px;
      padding: 0 21px 0 38px;
      width: 100%;
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
        filter criteria or not.`,
      value: false
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
    },

    function toggleActive() {
      if ( this.active ) this.searchView.clear();
      this.active = ! this.active;
    }
  ],

  listeners: [
    function checkboxChanged() {
      this.toggleActive();
    }
  ]
});
