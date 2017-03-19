foam.CLASS({
  package: 'foam.u2.view',
  name: 'RecipricalSearch',
  extends: 'foam.u2.Element',
  requires: [
    'foam.u2.search.SearchManager'
  ],
  exports: [
    'as filterController',
    'as data'
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
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      factory: function() {
        return this.__context__[foam.String.daoize(this.of.name)];
      }
    },
    {
      class: 'Array',
      name: 'filters',
      factory: null,
      expression: function(of) {
        return ! of ? [] :
          of.model_.tableColumns ? of.model_.tableColumns :
          of.getAxiomsByClass(foam.core.Property).
          filter(function(p) { return ! p.hidden }).
          map(foam.core.Property.NAME.f);
      }
    }
  ],
  methods: [
    function initE() {
      var self = this;

      // TODO: Add "n of m selected" header.
      this.
        add(this.slot(function(filters) {
          var searchManager = self.SearchManager.create({
            dao$: self.dao$,
            predicate$: self.data$
          });

          var e = this.E('div');

          e.onDetach(searchManager);

          e.forEach(filters, function(f) {
            // TODO: See if this can be cleaned up somehow, if searchView didn't require the proprety explicitly, or
            // could find the search manager via the context and add itself to that.
            var axiom = self.of.getAxiomByName(f);
            var spec  = axiom.searchView;
            var view  = foam.u2.ViewSpec.createView(spec, { property: axiom, dao: self.dao }, this, this.__subSubContext__);

            searchManager.add(view);
            this.add(axiom.label, view);
          });

          return e;
        }, this.filters$), this.CLEAR);
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
  ]
});
