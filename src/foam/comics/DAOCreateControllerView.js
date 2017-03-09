foam.CLASS({
  package: 'foam.comics',
  name: 'DAOCreateControllerView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.comics.DAOCreateController'
  ],

  properties: [
    'data',
    'of',
    {
      name: 'controller',
      factory: function() {
        var c = this.DAOCreateController.create({
          of$: this.of$
        });
        if ( this.data ) c.dao$ = this.data$;

        return c;
      }
    }
  ],

  methods: [
    function initE() {
      this.startContext({ data: this.controller }).
        add(this.DAOCreateController.DATA,
            this.DAOCreateController.SAVE,
            this.DAOCreateController.CANCEL).
        endContext();
    }
  ]
});
