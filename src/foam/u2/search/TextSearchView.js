/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.u2.search',
  name: 'TextSearchView',
  extends: 'foam.u2.View',

  imports: [
    'memento'
  ],

  exports: [
    'currentMemento_'
  ],

  requires: [
    'foam.parse.QueryParser',
    'foam.u2.tag.Input'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  messages: [
    { name: 'LABEL_SEARCH',    message: 'Search' }
  ],

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'Boolean',
      name: 'richSearch'
    },
    {
      class: 'Boolean',
      name: 'keywordSearch'
    },
    {
      class: 'Boolean',
      name: 'checkStrictEquality',
      documentation: `
        Set this flag if you want to match by strict equality instead of
        checking if the text contains the string. Doing so should improve
        performance.
      `
    },
    {
      name: 'queryParser',
      factory: function() {
        return this.QueryParser.create({ of: this.of });
      }
    },
    {
      class: 'Int',
      name: 'width',
      value: 47
    },
    'property',
    {
      name: 'predicate',
      factory: function() { return this.TRUE; }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewSpec',
      value: { class: 'foam.u2.tag.Input' }
    },
    {
      name: 'view'
    },
    {
      name: 'label',
      expression: function(property) {
        return property && property.label ? property.label : this.LABEL_SEARCH;
      }
    },
    {
      // All search views (in the SearchManager) need a name.
      // This defaults to 'textSearchView'.
      name: 'name',
      value: 'textSearchView'
    },
    {
      class: 'Boolean',
      name: 'onKey'
    },
    'currentMemento_'
  ],

  methods: [
    function initE() {
      if ( this.memento )
        this.currentMemento_$ = this.memento.tail$;
      this
        .addClass(this.myClass())
        .tag(this.viewSpec, {
          alwaysFloatLabel: true,
          label$: this.label$,
          ariaLabel$: this.label$,
          onKey: this.onKey,
          mode$: this.mode$
        }, this.view$);

      this.view.data$.sub(this.updateValue);

      if ( this.memento && this.memento.head.length != 0  ) {
        this.view.data = this.memento.head;
      }

      this.updateValue();

      if ( this.memento && this.memento.head ) {
        this.view.data = this.memento.head;
      }
    },

    function clear() {
      this.view.data = '';
      this.predicate = this.TRUE;
    }
  ],

  listeners: [
    {
      name: 'updateValue',
      isMerged: true,
      mergeDelay: 500,
      code: function() {
        var value = this.view.data;

        if ( this.memento ) {
          if ( value ) {
            this.memento.head = value;
          } else {
            this.memento.head = '';
          }
        }

        this.predicate = ! value ?
          this.True.create() :
          this.richSearch ?
            this.OR(
              this.queryParser.parseString(value) || this.FALSE,
              this.KEYWORD(value)
            ) :
            this.checkStrictEquality ?
              this.EQ(this.property, value) :
              this.CONTAINS_IC(this.property, value);
      }
    }
  ]
});
