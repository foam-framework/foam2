foam.CLASS({
  package: 'foam.u2.view',
  name: 'ExprView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.view.ChoiceView'
  ],
  imports: [
    'of'
  ],
  properties: [
    {
      name: 'choices',
      expression: function(of) {
        return of.getAxiomsByClass(foam.core.Property).map(function(prop) {
          return [prop, prop.label];
        });
      }
    }
  ],
  methods: [
    function initE() {
      this.tag(this.ChoiceView, {
        choices$: this.of$.map(function(of) {
          return of.getAxiomsByClass(foam.core.Property).map(function(prop) {
            return [prop, prop.label];
          });
        }),
        data$: this.data$
      });
    }
  ]
});
