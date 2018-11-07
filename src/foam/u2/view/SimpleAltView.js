foam.CLASS({
  package: 'foam.u2.view',
  name: 'SimpleAltView',
  extends: 'foam.u2.Element',
  requires: [
    'foam.u2.view.ChoiceView'
  ],
  properties: [
    {
      name: 'choices'
    },
    {
      name: 'selected'
    }
  ],
  methods: [
    function initE() {
      var view = this;

      this.
        add(this.slot(function(choices) {
          if ( ! view.selected ) view.selected = choices[0][0];

          return this.ChoiceView.create({
            choices: choices,
            data$: this.selected$
          });
        })).
        add(this.slot(function(selected) {
          return foam.u2.ViewSpec.createView(selected, null, this, this.__subSubContext__);
        }));
    }
  ]
});
