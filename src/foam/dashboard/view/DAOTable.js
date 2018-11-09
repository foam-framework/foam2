foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'DAOTable',
  extends: 'foam.u2.Element',
  requires: [
    'foam.u2.view.TableView',
  ],
  imports: [ 'data' ],
  css: `
    ^ table {
      width: 100%;
    }
  `,
  methods: [
    function initE() {
      this.
        addClass(this.myClass()).
        add(this.slot(function(data$dao, data$limit) {
          return this.E().
            start(this.TableView, {
              data: data$dao.limit(data$limit),
            }).
            end()
        }));
    }
  ]
});
