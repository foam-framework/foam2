/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PermissionTableView',
  extends: 'foam.u2.View', //'foam.u2.Element',

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
    ^ table {
          border-collapse: collapse;
          margin: auto;
          width: 962px;
        }
        ^ thead > tr > th {
          font-family: 'Roboto';
          font-size: 14px;
          background-color: rgba(110, 174, 195, 0.2);
          color: #093649;
          line-height: 1.14;
          letter-spacing: 0.3px;
          border-spacing: 0;
          text-align: left;
          padding-left: 15px;
          height: 40px;
        }
        ^ tbody > tr > th > td {
          font-size: 12px;
          letter-spacing: 0.2px;
          text-align: left;
          color: #093649;
          padding-left: 15px;
          height: 60px;
        }
        ^ .foam-u2-view-TableView th {
          font-family: 'Roboto';
          padding-left: 15px;
          font-size: 14px;
          line-height: 1;
          letter-spacing: 0.4px;
          color: #093649;
        }
        ^ .foam-u2-view-TableView td {
          font-family: Roboto;
          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.2px;
          padding-left: 15px;
          font-size: 12px;
          color: #093649;
        }
        ^ tbody > tr {
          height: 60px;
          background: white;
        }
        ^ .changeColour:nth-child(odd) {
          background: #f6f9f9;
        }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      var i = 0;

      this.start('table')
        .start('tr').style({'background': '#D4E3EB'})
          .tag('td').style({'text-align': 'left', 'width': '480', 'height': '35'})
          .select(this.groupDAO.orderBy(this.Group.ID), function(g) {
            this.start('td').start().style({'text-align': 'center', 'width': '100'}).add(g.id).end().end();
          })
        .end()
        .select(this.permissionDAO.orderBy(this.Permission.ID), function(p) {
          this.start('tr').call(function() {
            if ( parseInt(i) % 2 == 0 ) { this.style({'background': '#f6f9f9'}) } else { this.style({'background': '#ffffff'}) };
          })
            .start('td').style({'text-align': 'center', 'width': '480'}).add(p.id).end()
            .select(self.groupDAO.orderBy(self.Group.ID), function(g) {
              var cb = foam.u2.md.CheckBox.create({data: self.checkPermissionForGroup(p.id, g)});
              cb.data$.sub(function() { self.updateGroup(p, g, cb.data); });
              this.start('td').style({'text-align': 'center', 'width': '100'}).tag(cb).call(function() {
                if ( g.implies(p.id) ) { cb.style({'border-color': '#40C75B'}) };
              })
              .end();
            })
            .end()
            i = parseInt(i)+1;
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
