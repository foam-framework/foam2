foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PermissionTableView',
  extends: 'foam.u2.Element',

  imports: [
    'groupDAO',
    'permissionDAO',
    'auth'
  ],

  css: `
    ^ .net-nanopay-ui-ActionView{
      width: 95.5%;
      height: 40px;
      background: #59aadd;
      margin-bottom: 15px;
      width: 200;
    }
  `,

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
            .start('th').add(p.id).end()
            .select(self.groupDAO, function(g) {
              var cb = foam.u2.CheckBox.create({data: self.checkPermissionForGroup(p.id, g)});
              cb.data$.sub(function() { self.updateGroup(p, g, cb.data); });
              this.start('td').style({'text-align': 'center'}).tag(cb).end();
            })
          .end()
        })
      .end();
    },

    function checkPermissionForGroup(permission, group) {
      for ( i = 0 ; i < group.permissions.length ; i++ ) {
        if ( permission == group.permissions[i].id ) {
          return true;
        }
      }
    },

    function updateGroup(permission, group, data) {
      var dao = this.groupDAO;
      dao.find(group).then(function(group) {
        // Remove permission if found
        var permissions = group.permissions.filter(function(p) {
          return p.id != permission.id;
        });

        // Add if requested
        if ( data ) permissions.push(permission);

        group.permissions = permissions;
        dao.put(group);
      });
    }
  ]
});
