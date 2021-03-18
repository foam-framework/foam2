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
  name: 'SearchManager',

  requires: [
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.True'
  ],

  imports: [
    'memento'
  ],

  properties: [
    {
      name: 'views',
      factory: function() { return {}; }
    },
    {
      name: 'subs_',
      factory: function() { return {}; }
    },
    // TODO(braden): See if there's a clever way to write the memento logic as
    // an expression, instead of a set of clever postSets.
    {
      name: 'predicate',
      factory: function() {
        return foam.mlang.predicate.True.create();
      }
    },
    {
      name: 'dao'
    },
    {
      name: 'filteredDAO',
      expression: function(dao, predicate) {
        if ( ! dao ) return;
        var d = dao.where(predicate);
        this.updateViews();
        return d;
      }
    }
  ],

  methods: [
    function init() {
      if ( this.memento && this.memento.paramsObj.f && this.memento.paramsObj.f.length > 0 ) {
        var predicates = this.memento.paramsObj.f.map(f => foam.json.parseString(f.pred, this.__subContext__));
        this.predicate = this.And.create({
          args: predicates
        }).partialEval();
      }
    },

    function and(views) {
      return this.And.create({
        args: Object.keys(views).map(function(k) { return views[k].predicate; })
          .filter(function(predicate) { return predicate !== undefined })
      }).partialEval();
    },

    function add(view) {
      // Check the view's name, and if it's a duplicate, change its name to add
      // a number.
      if ( this.views[view.name] ) {
        var num = 2;
        while ( this.views[view.name + '_' + num] ) {
          num++;
        }
        view.name = view.name + '_' + num;
      }

      this.views[view.name] = view;
      this.subs_[view.name] = view.predicate$.sub(this.onViewUpdate);
      this.onViewUpdate();
      return view;
    },

    function remove(viewOrName) {
      var view;
      var name;
      if ( typeof viewOrName === 'string' ) {
        name = viewOrName;
        view = this.views[viewOrName];
      } else {
        view = viewOrName;
        name = view.name;
      }

      if ( ! this.views[name] ) return;

      view.clear();
      this.subs_[name].detach();
      delete this.views[name];
      delete this.subs_[name];
    },

    function removeAll() {
      this.clear();
      foam.Object.forEach(this.subs_, function(sub) {
        sub.detach();
      });
      this.views = {};
      this.subs_ = {};
    },

    function clear() {
      foam.Object.forEach(this.views, function(view) { view.clear(); });
    }
  ],

  listeners: [
    {
      name: 'onViewUpdate',
      isMerged: true,
      mergeDelay: 250,
      code: function() {
        this.predicate = this.and(this.views);
        // That will tickle the expression for filteredDAO.
        this.updateViews();

        if ( ! this.memento )
          return;
        var searches = [];
        var keys = Object.keys(this.views);
        if ( keys.length == 0 ) {
          delete this.memento.paramsObj.f;
        } else {
          var outputter = foam.json.Outputter.create({
            strict: true
          });
          for ( var key of keys ) {
            if ( ! foam.mlang.predicate.True.isInstance(this.views[key].predicate ) ) {
              searches.push({ name: key, criteria: 0, pred: outputter.stringify(this.views[key].predicate) });
            }
          }
          
          this.memento.paramsObj = foam.Object.clone(this.memento.paramsObj);
        }
      }
    },
    {
      name: 'updateViews',
      isMerged: true,
      mergeDelay: 250,
      code: function() {
        // TODO: Why do we need this and not just one function combined with
        //       onViewUpdate? Revisit
        // Deliberately a longer delay than onViewUpdate, since updating the
        // views is less important.
        foam.Object.forEach(this.views, function(view, name) {
          var temp = {};
          foam.Object.forEach(this.views, function(v, n) {
            if ( name === n ) return;
            temp[n] = v;
          });
          // Temp now holds all the other views. Combine all their predicates to
          // get the reciprocal predicate for this view.
          this.views[name].dao = this.dao.where(this.and(temp));
        }.bind(this));
      }
    }
  ]
});
