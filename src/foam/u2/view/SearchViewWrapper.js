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
    'foam.parse.QueryParser'
  ],

  imports: [
    'searchManager',
    'memento'
  ],

  css: `
    ^ {
      background-color: white;
      border-bottom: 1px solid #e9e9e9;
      color: /*%BLACK%*/ #1e1f21;
      padding: 0;
    }


    ^ .form-element-container {
      background-color: #f6f9f9;
      border-top: 1px solid #e9e9e9;
    }

    ^ .section {
      padding: 8px 16px;
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
      color: /*%BLACK%*/ #1e1f21;
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
    },
    {
      name: 'searchViewElement_'
    },
    'container_',
    'property',
    'dao',
    {
      class: 'Boolean',
      name: 'firstTime_',
      value: true
    },
    'view_',
    {
      name: 'queryParser',
      factory: function() {
        return this.QueryParser.create({ of: this.dao.of || this.__subContext__.lookup(this.property.forClass_) });
      }
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
            { class: 'foam.u2.CheckBox', },
            { label: this.property.label },
            this.checkbox$
          )
        .end()
        .start('div', null, this.container_$)
          .addClass('section')
          .addClass('form-element-container')
          .show(this.active$)
        .end();

      this.checkbox.data$.sub(this.checkboxChanged);

      var predicate = this.getPredicateFromMemento();
      if ( predicate )
        this.checkbox.data = true;
    },
    
    function getPredicateFromMemento() {
      if ( this.memento && this.memento.head.length > 0 ) {
        var predicate = this.queryParser.parseString(this.memento.head);
        if ( predicate ) {
          return predicate.partialEval();
        }
      }
    }
  ],

  listeners: [
    function checkboxChanged() {
      this.active = ! this.active;
      var self = this;

      if ( this.active ) {
        if ( this.firstTime_ ) {
          this.container_.tag(this.searchView, {
            property: this.property,
            dao: this.dao
          }, this.view_$);

          var predicate = this.getPredicateFromMemento();
          if ( predicate ) {
            this.view_.restoreFromPredicate(predicate);
          }

          this.searchManager.add(this.view_$.get());
          this.firstTime_ = false;
        }

        if ( this.view_ ) {
          this.view_.onDetach(self.view_.predicate$.sub(function() {
            var pred;
            if ( Object.keys(self.view_.predicate).length > 0 && ! foam.mlang.predicate.True.isInstance(self.view_.predicate) )
              pred = self.view_.predicate.toMQL && self.view_.predicate.toMQL();
    
            if ( pred ) {
              self.memento.head = pred ? pred : '';
            } else {
              self.memento.head = '';
            }
          }));
        }
      } else {
        if ( this.view_ ) this.view_.clear();
      }
    }
  ]
});
