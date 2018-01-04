foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PermissionTableView',
  extends: 'foam.u2.Element',

  imports: [
    'auth',
    'groupDAO',
    'permissionDAO'
  ],

  requires: [
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Permission'
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
          .tag('td').style({'width': '100'})
          .select(this.groupDAO.orderBy(this.Group.ID), function(g) {
            this.start('th').style({'text-align': 'center', 'width': '100'}).add(g.id).end(); //.style({'text-align': 'center', 'width': '400', 'margin-bottom': '30'})
          })
        .end()
        .select(this.permissionDAO.orderBy(this.Permission.ID), function(p) {
          this.start('tr')
            .start('th').style({'text-align': 'left', 'width': '100'}).add(p.id).end()
            .select(self.groupDAO.orderBy(self.Group.ID), function(g) {
              var cb = foam.u2.md.CheckBox.create({data: self.checkPermissionForGroup(p.id, g)});
              cb.data$.sub(function() { self.updateGroup(p, g, cb.data); });
              this.start('td').style({'text-align': 'center', 'width': '100'}).tag(cb).call(function() { //.style({'text-align': 'center', 'width': '400', 'margin-bottom': '30'})
              if ( g.implies(p.id, p, g)  ) { cb.style({'border-color': 'red'}) }; //this.style({'background': 'yellow'}) };
              })
              .end();
            })
            .end()
        })
      .end();
    },

    function checkPermissionForGroup(permissionId, group) {
      for ( i = 0 ; i < group.permissions.length ; i++ ) {
        if ( permissionId == group.permissions[i].id ) {
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
