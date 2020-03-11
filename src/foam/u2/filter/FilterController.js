/**
* @license
* Copyright 2019 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/
foam.CLASS({
  package: 'foam.u2.filter',
  name: 'FilterController',
  documentation: 'This file will be deprecating the SearchManager.',

  requires: [
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.True'
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
      mergeDelay: 10,
      code: function() {
        this.predicate = this.and(this.views);
        // That will tickle the expression for filteredDAO.
        this.updateViews();
      }
    },
    {
      name: 'updateViews',
      isMerged: true,
      mergeDelay: 20,
      code: function() {
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
