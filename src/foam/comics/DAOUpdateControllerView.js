foam.CLASS({
  package: 'foam.comics',
  name: 'DAOUpdateControllerView',
  extends: 'foam.u2.Element',
  requires: [
    'foam.comics.DAOUpdateController'
  ],
  properties: [
    'data',
    'of',
    {
      name: 'controller',
      factory: function() {
        return this.DAOUpdateController.create({
          of$: this.of$,
          data$: this.data$
        })
      }
    }
  ],
  methods: [
    function initE() {
      this.startContext({ data: this.controller }).
        tag(this.DAOUpdateController.STATUS, { visibility: foam.u2.Visibility.RO }).
        add(this.DAOUpdateController.OBJ,
            this.DAOUpdateController.SAVE).
        endContext();
    }
  ]
});
