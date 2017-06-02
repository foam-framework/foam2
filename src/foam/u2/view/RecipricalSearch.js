/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
  package: 'foam.u2.view',
  name: 'RecipricalSearch', // Correct spelling: "reciprocal"
  extends: 'foam.u2.Element', // TODO: make be a View

  requires: [
    'foam.u2.search.SearchManager'
  ],

  imports: [
    'dao'
  ],

  exports: [
    'as filterController',
    'as data'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^count {
          font-size: 16pt;
          color: #555;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      name: 'data'
    },
    {
      class: 'Array',
      name: 'filters',
      factory: null,
      expression: function(dao) {
        var of = dao && dao.of;

        if ( ! of ) return [];

        return of.model_.searchColumns || of.model_.tableColumns ||
            of.getAxiomsByClass(foam.core.Property)
                .filter(function(p) { return ! p.hidden })
                .map(foam.core.Property.NAME.f);
      }
    },
    {
      class: 'Int',
      name: 'selectedCount'
    },
    {
      class: 'Int',
      name: 'totalCount'
    },
  ],

  methods: [
    function initE() {
      var self = this;

      this.dao.on.sub(this.updateTotalCount);
      this.updateTotalCount();

      this.
        add(this.slot(function(filters) {
          var searchManager = self.SearchManager.create({
            dao$: self.dao$,
            predicate$: self.data$
          });

//          searchManager.filteredDAO.on.sub(self.updateSelectedCount);
          searchManager.filteredDAO$.sub(self.updateSelectedCount);
          self.updateSelectedCount(0,0,0,searchManager.filteredDAO$);

          var e = this.E('div');

          e.onDetach(searchManager);

          e.forEach(filters, function(f) {
            // TODO: See if this can be cleaned up somehow, if searchView didn't require the proprety explicitly, or
            // could find the search manager via the context and add itself to that.
            var axiom = self.dao.of.getAxiomByName(f);
            var spec  = axiom.searchView;
            var view  = foam.u2.ViewSpec.createView(spec, { property: axiom, dao: self.dao }, this, this.__subSubContext__);

            searchManager.add(view);
            this
              .start()
                .addClass(self.myClass('filter-header'))
                .add(axiom.label)
              .end()
              .start(view)
                .addClass(self.myClass('filter'))
            .end()
          });

          return e;
        }, this.filters$))
        .start()
          .addClass(self.myClass('count'))
          .add(self.selectedCount$, ' of ', self.totalCount$, ' selected')
        .end()
        .start(this.CLEAR).style({float: 'right'}).end();
    },

    function addFilter(key) {
      this.filters = this.filters.concat(key);
    },

    function removeFilter(key) {
      this.filters = this.filters.filter(function(k) {
        return key !== k;
      });
    }
  ],

  actions: [
    {
      name: 'clear',
      code: function() {
        this.data = undefined;
        this.filters = this.filters.slice();
      }
    }
  ],

  /*
  reactions: [
    [ 'data', 'on', 'updateTotalCount' ]
  ],
  */

  listeners: [
    {
      name: 'updateTotalCount',
      isFramed: true,
      code: function() {
        this.dao.select(foam.mlang.sink.Count.create()).then(function(c) {
          this.totalCount = c.value;
        }.bind(this));
      }
    },
    {
      name: 'updateSelectedCount',
      isFramed: true,
      code: function(_, __, ___, dao) {
        dao.get().select(foam.mlang.sink.Count.create()).then(function(c) {
          this.selectedCount = c.value;
        }.bind(this));
      }
    }
  ]
});
