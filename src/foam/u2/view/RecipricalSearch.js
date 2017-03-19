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
          of.tableColumns ? of.tableColumns :
          of.getAxiomsByClass(foam.core.Property).
          filter(function(p) { return ! p.hidden }).
          map(foam.core.Property.NAME.f);
      }
    },
    {
      class: 'Int',
      name: 'count'
    }
  ],
  methods: [
    function initE() {
      var self = this;
      this.add(
        this.COUNT,
        this.slot(function(filters) {
          var searchManager = self.SearchManager.create({
            dao$: this.dao$,
            data$: this.data$
          });
          this.onDetach(searchManager);

          this.forEach(filters, function(f) {
            // TODO: See if this can be cleaned up if searchView were more robust and didn't require the property
            // as a paramter.
            var spec = self.of.getAxiomByName(f).searchView;
            var view = foam.u2.ViewSpec.createView(spec, { property: f, dao: self.dao }, this, this.__subSubContext__);

            searchManager.add(view);
            this.add(view);
          });
        }, this.filters$));
    },
    function addFilter(key) {
      this.filters = this.filters.concat(key);
    },
    function removeFilter(key) {
      this.filters = this.filters.filter(function(k) {
        return key !== k;
      });
    }
  ]
});
