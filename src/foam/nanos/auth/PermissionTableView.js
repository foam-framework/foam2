/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PermissionTableView',
<<<<<<< HEAD
  extends: 'foam.u2.View',
=======
  extends: 'foam.u2.Element',
>>>>>>> d17a6d1b6072ea63eed6d51ff43402f5c31dee2b

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
<<<<<<< HEAD
    ^ table > tbody:nth-child(odd) {
      background: #f6f9f9;
=======
    ^ .net-nanopay-ui-ActionView{
      width: 95.5%;
      height: 40px;
      background: #59aadd;
      margin-bottom: 15px;
      width: 200;
>>>>>>> d17a6d1b6072ea63eed6d51ff43402f5c31dee2b
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

<<<<<<< HEAD
      this.addClass(this.myClass()).start('table')
        .start('thead').start('tr').style({'background': '#D4E3EB'})
          .tag('td').style({'text-align': 'left', 'width': '480', 'height': '35'})
            .select(this.groupDAO.orderBy(this.Group.ID), function(g) {
              this.start('td').start().style({'text-align': 'center', 'width': '100'}).add(g.id).end();
            })
        .end().end()

        .select(this.permissionDAO.orderBy(this.Permission.ID), function(p) {
          this.start('tr')
            .start('td').style({'text-align': 'center', 'width': '480'}).add(p.id).end()
            .select(self.groupDAO.orderBy(self.Group.ID), function(g) {
                var cb = foam.u2.md.CheckBox.create({data: self.checkPermissionForGroup(p.id, g)});
                cb.data$.sub(function() { self.updateGroup(p, g, cb.data); });
                this.start('td').style({'text-align': 'center', 'width': '100'}).tag(cb).call(function() {
                  if ( g.implies(p.id) ) { cb.style({'border-color': '#40C75B'}) };
                }).end()
            })
        })
        .end()
=======
      this.start('table')
        .start('tr')
          .tag('td').style({'text-align': 'left', 'width': '480'})
          .select(this.groupDAO.orderBy(this.Group.ID), function(g) {
            this.start('td').start().style({'text-align': 'center', 'width': '100'}).add(g.id).end().end();
          })
        .end()
        .select(this.permissionDAO.orderBy(this.Permission.ID), function(p) {
          this.start('tr')
            .start('td').style({'text-align': 'left', 'width': '480'}).add(p.id).end()
            .select(self.groupDAO.orderBy(self.Group.ID), function(g) {
              var cb = foam.u2.md.CheckBox.create({data: self.checkPermissionForGroup(p.id, g)});
              cb.data$.sub(function() { self.updateGroup(p, g, cb.data); });
              this.start('td').style({'text-align': 'center', 'width': '100'}).tag(cb).call(function() {
                if ( g.implies(p.id)  ) { cb.style({'border-color': '#40C75B'}) };
              })
              .end();
            })
            .end()
        })
>>>>>>> d17a6d1b6072ea63eed6d51ff43402f5c31dee2b
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
