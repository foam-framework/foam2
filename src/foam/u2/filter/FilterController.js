/**
* @license
* Copyright 2019 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/
foam.CLASS({
  package: 'foam.u2.filter',
  name: 'FilterController',
  documentation: `
    This file will be deprecating the SearchManager.
    The FilterController controls the final predicate the DAO will use. This
    predicate is constructed from the various PropertyFilterViews.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  // requires: [
  //   'foam.mlang.predicate.And',
  //   'foam.mlang.predicate.Or',
  //   'foam.mlang.predicate.True'
  // ],

  properties: [
    {
      class: 'Map',
      name: 'criterias',
      documentation: 'Map containing all criterias',
      factory: function() {
        // Example structure
        // {
        //   0: {
        //     views: { viewName: ... },
        //     subs: { viewName: ... },
        //     predicate: ...
        //   }
        // }
        return {};
      }
    },
    {
      class: 'Map',
      name: 'previewCriterias',
      documentation: `
        To keep the information separated when moving between preview and simple
        modes.
      `
    },
    // TODO(braden): See if there's a clever way to write the memento logic as
    // an expression, instead of a set of clever postSets.
    {
      name: 'finalPredicate',
      factory: function() {
        return this.TRUE;
      }
    },
    {
      name: 'previewPredicate',
      documentation: `
        This enables advanced mode to preview a predicate without actually applying
        it. Storing it here also gives us the capability to restore the predicate if
        the user wishes to edit the predicate. This is for UX purposes.
      `,
      factory: function() {
        return this.TRUE;
      }
    },
    {
      name: 'dao',
      documentation: 'The pure unadulterated DAO as a basis for the criterias'
    },
    {
      class: 'Boolean',
      name: 'isPreview'
    },
    {
      class: 'Boolean',
      name: 'isAdvanced'
    }
  ],

  methods: [
    function init() {
      this.addCriteria();
    },

    function and(views) {
      return this.And.create({
        args: Object.keys(views).map(function(k) { return views[k].predicate; })
          .filter(function(predicate) { return predicate !== undefined })
      }).partialEval();
    },

    function addCriteria() {
      var criterias = this.isPreview ? this.previewCriterias : this.criterias;
      var keys = Object.keys(criterias);
      var newIndex = keys.length > 0 ? Number.parseInt(keys[keys.length - 1]) + 1 : 0;
      if ( ! this.isPreview ) {
        this.criterias$set(newIndex, {
          views: {},
          subs: {},
          predicate: this.TRUE
        });
        return;
      }
      this.previewCriterias$set(newIndex, {
        views: {},
        subs: {},
        predicate: this.TRUE
      });
    },

    function add(view, name, criteria) {
      if ( ! this.isPreview ) {
        this.criterias[criteria].views[name] = view;
        this.criterias[criteria].subs[name] = view.predicate$.sub(() => {
          this.onCriteriaPredicateUpdate(criteria);
        });
      } else {
        this.previewCriterias[criteria].views[name] = view;
        this.previewCriterias[criteria].subs[name] = view.predicate$.sub(() => {
          this.onCriteriaPredicateUpdate(criteria);
        });
      }
      this.onCriteriaPredicateUpdate(criteria);
      return view;
    },

    function onCriteriaPredicateUpdate(criteria) {
      var criterias = this.isPreview ? this.previewCriterias : this.criterias;
      var criteriaViews = criterias[criteria].views;
      var predicate = this.and(criteriaViews);

      if ( predicate == this.TRUE ) return;

      if ( ! this.isPreview ) {
        this.criterias[criteria].predicate = predicate;
      } else {
        this.previewCriterias[criteria].predicate = predicate;
      }

      this.reciprocateCriteriaViews(criteria);
    },

    function reciprocateCriteriaViews(criteria) {
      // This function reciprocates the other filters
      var criterias = this.isPreview ? this.previewCriterias : this.criterias;
      var criteriaView = criterias[criteria].views;
      foam.Object.forEach(criteriaView, function(view, name) {
        var temp = {};
        foam.Object.forEach(criteriaView, function(v, n) {
          if ( name === n ) return;
          temp[n] = v;
        });
        // Temp now holds all the other views. Combine all their predicates to
        // get the reciprocal predicate for this view.
        if ( ! this.isPreview ) {
          this.criterias[criteria].views[name].dao = this.dao.where(this.and(temp));
        } else {
          this.previewCriterias[criteria].views[name].dao = this.dao.where(this.and(temp));
        }
      }.bind(this));
      this.updateFilterPredicate();
    },

    function updateFilterPredicate() {
      var criterias = this.isPreview ? this.previewCriterias : this.criterias;
      var orPredicate = this.Or.create({
        args: Object.values(criterias).map((criteria) => { return criteria.predicate; })
      }).partialEval();

      if ( ! this.isPreview ) {
        this.finalPredicate = orPredicate;
        return;
      }
      this.previewPredicate = orPredicate;
    },

    function switchToPreview() {
      this.isPreview = true;
      if ( Object.keys(this.previewCriterias).length === 0 ) this.addCriteria();
    },

    function applyPreview() {
      console.log('Preview applied');
      this.isAdvanced = true;
      this.isPreview = false;
      this.finalPredicate = this.previewPredicate;
    },

    function removeCriteria(criteria) {
      this.isPreview ? this.previewCriterias$remove(criteria) : this.criterias$remove(criteria);
      this.updateFilterPredicate();
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
  ]
});
