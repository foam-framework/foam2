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
  name: 'GroupAutocompleteSearchView',
  extends: 'foam.u2.View',

  documentation: 'Uses a TextField with autocomplete driven by a list. This ' +
      'depends on the browser\'s native support for the input.list ' +
      'attribute, which is also polyfilled by Polymer.',

  requires: [
    'foam.mlang.predicate.True',
    'foam.u2.search.GroupCompleter',
    // TODO(braden): Implement and uncomment the split-completer.
    //'foam.u2.search.GroupSplitCompleter',
    'foam.u2.view.TextField'
  ],

  properties: [
    {
      class: 'String',
      name: 'split',
      documentation: 'Set this to a string, and group values will be split ' +
          'on it. This can be used to split a comma-separated string into ' +
          'its component parts.',
      value: ''
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewSpec',
      value: { class: 'foam.u2.view.TextField', onKey: true }
    },
    {
      name: 'dao',
      label: 'DAO',
      required: true,
      postSet: function() {
        this.updateDAO();
      }
    },
    {
      name: 'property',
      required: true,
      postSet: function(o, property) {
        var isIntProp = foam.core.Int.isInstance(property) ||
          foam.core.Reference.isInstance(property) &&
          foam.core.Int.isInstance(property.of.ID);
        if ( ! this.op ) {
          this.op = isIntProp
            ? foam.mlang.predicate.Eq
            : foam.mlang.predicate.ContainsIC;
        }
      }
    },
    {
      name: 'name',
      documentation: 'All SearchViews require a name. Defaults to the ' +
          'property name.',
      expression: function(property) {
        return property.name;
      }
    },
    {
      class: 'Class',
      name: 'op'/*,
      expression: function(property) {
        // TODO: broken by CLASS, fix
        // All the numeric types extend from Int, so I'll use that as my base.
        return foam.core.Int.isInstance(property) ? foam.mlang.predicate.Eq :
            foam.mlang.predicate.ContainsIC;
      }*/
    },
    {
      name: 'predicate',
      documentation: 'My filter for the SearchManager to read.',
      factory: function() {
        return this.True.create();
      }
    },
    {
      name: 'label',
      expression: function(property) {
        return property.label;
      }
    },
    {
      name: 'groups',
      documentation: 'List of groups found the last time the DAO was updated.'
    },
    {
      name: 'autocompleter',
      factory: function() {
        var model = this.GroupCompleter;
        var args = { groups$: this.groups$ };
        if ( this.split ) {
          model = this.GroupSplitCompleter;
          args.split = this.split;
        }

        return model.create(args, this);
      }
    },
    {
      name: 'view'
    }
  ],

  methods: [
    function clear() {
      this.view.data = '';
    },

    function initE() {
      this.view = this.start(this.viewSpec, {
        prop: this.property,
        label$: this.label$,
        alwaysFloatLabel: true,
        autocompleter: this.autocompleter
      });

      this.dao.on.sub(this.updateDAO);
      this.view.data$.sub(this.updatePredicate);
    }
  ],

  listeners: [
    {
      name: 'updateDAO',
      isMerged: true,
      mergeDelay: 100,
      code: function() {
        // Makes a select query, grouping by the value of this.property.
        // That builds the this.groups list, which is what we're autocompleting
        // against.
        this.dao.select(foam.mlang.sink.GroupBy.create({
          arg1: this.property,
          arg2: foam.mlang.sink.Count.create()
        })).then(function(groups) {
          this.groups = groups.sortedKeys();
        }.bind(this));
      }
    },
    {
      name: 'updatePredicate',
      code: function(sub, _, __, slot) {
        var str = slot.get();
        this.predicate = str ? this.op.create({
          arg1: this.property,
          arg2: this.property.fromString ? this.property.fromString(str) : str
        }) : this.True.create();
      }
    }
  ]
});
