foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PermissionTableView',
  extends: 'foam.u2.Element',

  imports: [
    'groupDAO',
    'permissionDAO',
    'auth'
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.start('table')
        .start('tr')
          .tag('td')
          .select(this.groupDAO, function(g) {
            this.start('th').add(g.id).end();
          })
        .end()
        .select(this.permissionDAO, function(p) {
          this.start('tr')
            .start('th').add('permission: ', p.id).end()
            .select(self.groupDAO, function(g) {
              this.start('td').tag({class: 'foam.u2.CheckBox', data: self.checkPermissionForGroup(p.id, g.id)}).end();
            })
          .end();
        })
      .end();
    },

    function checkPermissionForGroup(permission, group) {
      return Math.random() < 0.5;
    }
  ]
})
