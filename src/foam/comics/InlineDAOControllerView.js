foam.CLASS({
  package: 'foam.comics',
  name: 'InlineDAOControllerView',
  extends: 'foam.u2.Element',

  imports: [
    'stack'
  ],

  exports: [
    'editRecord'
  ],

  requires: [
    'foam.comics.DAOController'
  ],

  properties: [
    'data',
    'of',
    {
      name: 'controller',
      factory: function() {
        return this.DAOController.create({
          of$: this.of$,
          data$: this.data$
        });
      }
    }
  ],

  methods: [
    function editRecord(obj) {
      this.stack.push({
        class: 'foam.comics.DAOUpdateControllerView',
        of: this.of,
        data: obj.id
      });
    },
    function initE() {
      this.startContext({ data: this.controller }).
        add(this.DAOController.FILTERED_DAO,
            this.DAOController.CREATE).
        endContext();
    }
  ]
});
