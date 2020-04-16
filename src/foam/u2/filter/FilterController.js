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
        predicate: newIndex === 0 ? this.criterias[newIndex].predicate : this.TRUE
      });
      this.updateFilterPredicate();
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
      if ( orPredicate === this.FALSE ) orPredicate = this.TRUE;

      if ( ! this.isPreview ) {
        this.finalPredicate = orPredicate;
        return;
      }
      this.previewPredicate = orPredicate;
    },

    function switchToPreview() {
      // At this point, user should be going into advanced mode
      this.isPreview = true;
      if ( Object.keys(this.previewCriterias).length === 0 ) this.addCriteria();
      if ( ! this.isAdvanced ) {
        this.previewCriterias[0].predicate = this.criterias[0].predicate;
        this.updateFilterPredicate();
      }
    },

    function applyPreview() {
      // At this point, users should be coming from advanced mode
      console.log('Preview applied');
      this.isAdvanced = true;
      this.isPreview = false;
      this.finalPredicate = this.previewPredicate;
    },

    function clear(viewOrName, criteria, remove) {
      var view;
      var name;
      // Get the right map to remove from
      var criterias = this.isPreview ? this.previewCriterias : this.criterias;

      if ( typeof viewOrName === 'string' ) {
        // If view name given, obtain it from map
        view = criterias[criteria].views[viewOrName];
        name = viewOrName;
      } else {
        // If view given, less work. Just assign name for crosscheck
        view = viewOrName;
        name = view.property.name;
      }

      // Don't clear if view does not exist or crosscheck fails
      if ( ! view || ! criterias[criteria].views[name] ) return;

      // Clear, detach, and remove view from the correct map
      if ( this.isPreview ) {
        this.previewCriterias[criteria].views[name].clear();
        this.previewCriterias[criteria].predicate = this.TRUE;
        if ( remove ) {
          this.previewCriterias[criteria].subs[name].detach();
          delete this.previewCriterias[criteria].views[name];
          delete this.previewCriterias[criteria].subs[name];
        }
      } else {
        this.criterias[criteria].views[name].clear();
        this.criterias[criteria].predicate = this.TRUE;
        if ( remove ) {
          this.criterias[criteria].subs[name].detach();
          delete this.criterias[criteria].views[name];
          delete this.criterias[criteria].subs[name];
        }
      }
    },

    function clearCriteria(criteria, remove) {
      var criterias = this.isPreview ? this.previewCriterias : this.criterias;
      Object.values(criterias[criteria].views).forEach((view) => {
        this.clear(view, criteria, remove);
      });

      if ( remove ) {
        if ( this.isPreview ) this.previewCriterias$remove(criteria);
        else this.criterias$remove(criteria);
      }

      this.updateFilterPredicate();
    },

    function clearAll(remove) {
      // Get the right map to clear
      var criterias = this.isPreview ? this.previewCriterias : this.criterias;
      // Clear each criteria properly (Which includes detaching subs)
      Object.keys(criterias).forEach((key) => {
        this.clearCriteria(key, remove);
      });
      if ( remove ) this.addCriteria();
    }
  ]
});
