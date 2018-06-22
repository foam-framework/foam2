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
  package: 'foam.u2',
  name: 'TableSelection',
  extends: 'foam.u2.Element',

  requires: [
    'foam.dao.ArraySink',
    'foam.mlang.predicate.False',
    'foam.mlang.predicate.In',
    'foam.mlang.predicate.Or',
    'foam.mlang.predicate.Not',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Map',
    'foam.u2.TableView'
  ],

  imports: [
    'unfilteredDAO'
  ],

  exports: [
    'bulkActions',
    'selectionQuery'
  ],

  css: `
    ^link {
      color: #00c;
      margin: 0 8px;
      text-decoration: none;
    }
  `,

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( this.daoSub_ ) {
          this.daoSub_.detach();
          this.daoSub_ = null;
        }
        if ( nu ) this.daoSub_ = nu.on.sub(this.updateCounts);
        this.updateCounts();
      }
    },
    'daoSub_',
    {
      class: 'Class',
      name: 'of',
      expression: function(data) { return data.of; }
    },
    {
      name: 'selectionQuery',
      factory: function() { return this.False.create(); }
    },
    'filteredCount_',
    'totalCount_',
    {
      class: 'String',
      name: 'selectionText_',
      expression: function(filteredCount_, totalCount_) {
        if ( ! totalCount_ ) return '';
        var s = (totalCount_ || '0') + ' selected';
        if ( totalCount_ !== filteredCount_ ) {
          s += ' (' + (filteredCount_ || '0') + ' shown)';
        }
        return s;
      }
    },
    'selectAllState',
    {
      class: 'FObjectArray',
      of: 'Action',
      name: 'bulkActions'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'view',
      value: { class: 'foam.u2.TableView' }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.start()
          .start('div')
              .add('Select')
              .start('a')
                  .attrs({ href: 'javascript:' })
                  .on('click', this.selectAll)
                  .addClass(this.myClass('link'))
                  .add('All')
              .end()
              .start('a')
                  .attrs({ href: 'javascript:' })
                  .on('click', this.selectNone)
                  .addClass(this.myClass('link'))
                  .add('None')
              .end()
          .end()
          .start('span').add(this.selectionText_$).end()
          .start()
              .addClass(this.myClass('actions'))
              .add(this.bulkActions)
          .end()
      .end()
      .start(this.view, {
        of: this.of,
        data$: this.data$
      }).end();

      this.selectionQuery$.sub(this.updateCounts);
    }
  ],

  listeners: [
    {
      name: 'selectNone',
      isFramed: true,
      code: function() {
        this.selectionQuery = this.False.create();
      }
    },
    {
      name: 'selectAll',
      isFramed: true,
      code: function() {
        var self = this;
        this.data.select(this.Map.create({
          arg1: this.of.ID,
          delegate: this.ArraySink.create()
        })).then(function(array) {
          var q = self.In.create({
            arg1: self.of.ID,
            arg2: array.delegate.a
          });

          self.selectionQuery = self.Or.create({
            args: [ self.selectionQuery, q ]
          }).partialEval();
        });
      }
    },
    {
      name: 'updateCounts',
      isFramed: true,
      code: function() {
        var self = this;
        this.unfilteredDAO.where(this.selectionQuery)
            .select(this.Count.create())
            .then(function(c) { self.totalCount_ = c.value; });
        this.data.where(this.selectionQuery)
            .select(this.Count.create())
            .then(function(c) { self.filteredCount_ = c.value; });
      }
    }
  ]
});
