foam.CLASS({
  package: 'foam.u2.view',
  name: 'RecipricalSearch',
  extends: 'foam.u2.Element',
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
      name: 'data',
      postSet: function() {
        debugger;
      }
    },
    {
      name: 'dao',
      factory: function() {
        return this.__context__[foam.String.daoize(this.of)];
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
          this.forEach(filters, function(f) {
            this.tag(self.of.getAxiomByName(f).searchView);
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
