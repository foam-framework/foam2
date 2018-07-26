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
  name: 'GroupBySearchView',
  extends: 'foam.u2.View',

  requires: [
    'foam.dao.FnSink',
    'foam.mlang.Constant',
    'foam.mlang.predicate.True',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.GroupBy',
    'foam.u2.view.ChoiceView'
  ],

  css: "^ select { min-width: 220px; }",

  properties: [
    {
      name: 'view'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewSpec',
      value: { class: 'foam.u2.view.ChoiceView', size: 10 }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      required: true,
    },
    {
      name: 'property',
      required: true
    },
    {
      name: 'name',
      expression: function(property) { return property.name; }
    },
    {
      class: 'Class',
      name: 'op',
      value: 'foam.mlang.predicate.Eq'
    },
    {
      name: 'predicate',
      factory: function() {
        return this.True.create();
      }
    },
    {
      class: 'Int',
      name: 'width',
      value: 17
    },
    {
      class: 'String',
      name: 'label',
      expression: function(property) {
        return property.label;
      }
    },
    {
      class: 'Function',
      name: 'aFormatLabel',
      value: function(key) { return Promise.resolve(''+key); }
    },
    'previewMode',
    'hardData'
  ],

  methods: [
    function clear() {
      this.view.data = '';
    },

    function initE() {
      var self = this;

      this
        .addClass(this.myClass())
        .tag(this.viewSpec, {
          label$: this.label$,
          alwaysFloatLabel: true
        }, this.view$)
        .on('click', function(e) {
          try {
            self.previewMode = false;
            var data         = self.view.choices[e.target.value][0];
            self.hardData    = data;
          } catch(x) {}
        })
        .on('mouseover', function(e) {
          try {
            var data = self.view.choices[e.target.value][0];

            if ( ! self.previewMode ) {
              self.previewMode = true;
              self.hardData = self.view.data;
            }

            self.view.data = data;
          } catch(x) {}
        })
        .on('mouseout', function(e) {
          self.view.data = self.hardData;
          if ( ! self.hardData ) self.view.data = '';
        })
        .onDetach(
          this.dao$proxy.listen(
            this.FnSink.create({fn: this.updateDAO})
          )
        );

      this.updateDAO();

      this.view.data$.sub(this.updatePredicate);
    },

    function updatePredicate_(choice) {
      var exists = typeof choice !== 'undefined' && choice !== '';
      this.predicate = exists ? this.op.create({
        arg1: this.property,
        arg2: this.Constant.create({ value: choice })
      }) : this.True.create();
    },

    function formatLabels(keys) {
      return Promise.all(keys.map(this.aFormatLabel.bind(this)));
    }
  ],

  listeners: [
    {
      name: 'updateDAO',
      isMerged: true,
      mergeDelay: 100,
      code: function() {
        var self = this;
        this.dao.select(this.GroupBy.create({
          arg1: this.property,
          arg2: this.Count.create()
        })).then(function(groups) {
          var options = [];
          var selected;
          var sortedKeys = groups.sortedKeys();
          self.formatLabels(sortedKeys).then(function (labels) {
            for ( var i = 0 ; i < sortedKeys.length ; i++ ) {
              var key = sortedKeys[i];
              if ( typeof key === 'undefined' ) continue;
              if ( key === '' ) continue;
              var count = foam.String.intern(
                  '(' + groups.groups[key].value + ')');
              var subKey = labels[i].substring(0, self.width - count.length - 3);
              // ???: Why do we need to clean the key?
              var cleanKey = foam.core.Enum.isInstance(self.property) ?
                  self.property.of[key].label :
                  subKey.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;');

              if ( self.view && self.view.data === key ) {
                selected = key;
              }

              options.push([
                key,
                cleanKey + foam.String.intern(
                    Array(self.width - subKey.length - count.length).join(' ')) +
                    count
              ]);
            }

            options.splice(0, 0, [ '', '--' ]);

            self.view.choices = options;
            if ( typeof selected !== 'undefined' ) {
              var oldData = self.view.data;
              self.view.data = selected;
              if ( typeof oldData === 'undefined' || oldData === '' ) {
                self.updatePredicate_(selected);
              }
            }
          });
        });
      }
    },
    {
      name: 'updatePredicate',
      code: function(_, __, ___, slot) {
        this.updatePredicate_(slot.get());
      }
    }
  ]
});
