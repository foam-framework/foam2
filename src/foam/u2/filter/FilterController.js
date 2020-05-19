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
    },
    {
      class: 'Long',
      name: 'resultsCount'
    },
    {
      class: 'Long',
      name: 'totalCount'
    }
  ],

  methods: [
    function init() {
      this.addCriteria();
      this.onDetach(this.dao$.sub(this.onDAOUpdate));
      this.onDAOUpdate();
      this.onDetach(this.finalPredicate$.sub(this.getResultsCount));
      this.onDetach(this.previewPredicate$.sub(this.getResultsCount));
    },

    function and(views) {
      return this.And.create({
        args: Object.keys(views).map(function(k) { return views[k].predicate; })
          .filter(function(predicate) { return predicate !== undefined })
      }).partialEval();
    },

    function addCriteria(key) {
      var criterias = this.isPreview ? this.previewCriterias : this.criterias;
      var keys = Object.keys(criterias);
      var newKey;
      if ( key ) {
        newKey = key;
      } else {
        newKey = keys.length > 0 ? Number.parseInt(keys[keys.length - 1]) + 1 : 0;
      }

      if ( ! this.isPreview ) {
        this.criterias$set(newKey, {
          views: {},
          subs: {},
          predicate: this.TRUE
        });
        return;
      }
      this.previewCriterias$set(newKey, {
        views: {},
        subs: {},
        predicate: newKey === 0 ? this.criterias[newKey].predicate : this.TRUE
      });
      this.updateFilterPredicate();
    },

    function add(view, name, criteria) {
      var criterias = this.isPreview ? this.previewCriterias : this.criterias;
      criterias[criteria].views[name] = view;
      criterias[criteria].subs[name] = view.predicate$.sub(() => {
        this.onCriteriaPredicateUpdate(criteria);
      });
      this.onCriteriaPredicateUpdate(criteria);
    },

    function onCriteriaPredicateUpdate(criteria) {
      var criterias = this.isPreview ? this.previewCriterias : this.criterias;
      var criteriaViews = criterias[criteria].views;
      var predicate = this.and(criteriaViews);

      criterias[criteria].predicate = predicate;

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
        criterias[criteria].views[name].dao = this.dao.where(this.and(temp));
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

    function getExistingPredicate(criteriaKey, property) {
      // Check if there is an existing predicate to rebuild from
      var propertyName = typeof property === 'string' ? property : property.name;
      var previewCriteria = this.previewCriterias[criteriaKey];
      var criteria = this.criterias[criteriaKey];
      if ( ! previewCriteria && ! criteria ) return null;

      // Existing view can come from criterias or previewCriterias
      var view;
      // Preview predicate takes precendence
      if ( previewCriteria ) {
        view = previewCriteria.views[propertyName]
        if ( view && view.predicate !== this.TRUE ) return view.predicate;
      }
      // Preview criteria predicate does not exist, check main criteria predicate
      if ( criteria ) {
        view = criteria.views[propertyName]
        if ( view && view.predicate !== this.TRUE ) return view.predicate;
      }

      return null;
    },

    function applyPreview() {
      // At this point, users should be coming from advanced mode
      this.isAdvanced = true;
      this.isPreview = false;
      // Copy required information to be reconstructed
      Object.keys(this.previewCriterias).forEach((criteriaKey) => {
        this.addCriteria(criteriaKey);
        Object.keys(this.previewCriterias[criteriaKey].views).forEach((viewKey) => {
          var view = this.previewCriterias[criteriaKey].views[viewKey];
          this.criterias[criteriaKey].views[viewKey] = {
            property: view.property,
            predicate: view.predicate
          };
        });
        this.criterias[criteriaKey].predicate = this.previewCriterias[criteriaKey].predicate;
      });
      // This will apply the predicate onto the DAO
      this.finalPredicate = this.previewPredicate;
    },

    function switchToPreview() {
      // At this point, user should be going into advanced mode
      this.isPreview = true;
      this.clearAll(true);
      // Assign the predicates to the previews to reconstruct the view
      Object.keys(this.criterias).forEach((key) => {
        this.addCriteria(key);
        this.previewCriterias[key].predicate = this.criterias[key].predicate;
      });
      this.updateFilterPredicate();
    },

    function switchToSimple() {
      // Essentially a reset
      this.isPreview = true;
      this.clearAll(true);
      this.updateFilterPredicate();
      this.isPreview = false;
      this.clearAll(true);
      this.updateFilterPredicate();
      this.isAdvanced = false;
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
        // Name may be from TextSearchView as well
        view = viewOrName;
        name = view.property ? view.property.name : view.name;
      }

      // Don't clear if view does not exist or crosscheck fails
      if ( ! view || ! criterias[criteria].views[name] ) return;
      // There could be a case where the view's data is for reconstruction
      // Therefore, there won't be a method called clear
      if ( criterias[criteria].views[name].clear ) criterias[criteria].views[name].clear();
      criterias[criteria].predicate = this.TRUE;
      if ( remove ) {
        // There could be a case where the view's data is for reconstruction
        // Therefore, there won't be any subs
        if ( criterias[criteria].subs[name] ) criterias[criteria].subs[name].detach();
        delete criterias[criteria].views[name];
        delete criterias[criteria].subs[name];
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
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      code: function() {
        this.dao.select(this.COUNT()).then((count) => {
          // This will need scalability testing
          this.totalCount = count.value;
        });
      }
    },
    {
      name: 'getResultsCount',
      code: function() {
        var predicate = this.isPreview ? this.previewPredicate : this.finalPredicate;
        console.log('isPreview: ', this.isPreview);
        console.log(predicate);
        this.dao.where(predicate).select(this.COUNT()).then((count) => {
          this.resultsCount = count.value;
        });
      }
    }
  ]
});
