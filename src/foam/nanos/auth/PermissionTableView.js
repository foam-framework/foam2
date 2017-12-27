foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PermissionTableView',
  extends: 'foam.u2.Element',

  imports: [
    'groupDAO',
    'permissionDAO',
    'auth'
  ],

  requires: [
    "foam.nanos.auth.Permission"
  ],

  css: `
    ^ .net-nanopay-ui-ActionView{
      width: 95.5%;
      height: 40px;
      background: #59aadd;
      margin-bottom: 15px;
      width: 200;
    }
    ^ .foam-u2-view-TableView th {
      font-family: 'Roboto';
      padding-left: 15px;
      font-size: 14px;
      line-height: 1;
      letter-spacing: 0.4px;
      color: #093649;
      font-style: normal;
    }
    ^ .foam-u2-view-TableView td {
      width: 130;
      text-align: center;
      margin-bottom: 30;
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
            this.start('th').addClass('foam-u2-view-TableView').add(g.id).end();
          })
        .end()
        .select(this.permissionDAO.orderBy(this.Permission.ID), function(p) {
          this.start('tr')
            .start('th').add(p.id).end()
            .select(self.groupDAO, function(g) {
              var cb = foam.u2.CheckBox.create({data: self.checkPermissionForGroup(p.id, g)});
              cb.data$.sub(function() { self.updateGroup(p, g, cb.data); });
              this.start('td').style({'text-align': 'center', 'width': '130', 'margin-bottom': '30'}).tag(cb).end(); //style({'text-align': 'text-align', 'width': '130'})
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
