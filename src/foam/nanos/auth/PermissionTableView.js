/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PermissionTableView',
  extends: 'foam.u2.Controller',

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
    ^ table > tbody:nth-child(odd) {
      background: #f6f9f9;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'query',
      view: {
        class: 'foam.u2.TextField',
        type: 'Permission Search',
        placeholder: 'Permission',
        onKey: true
      }
    },
    {
      name: 'selectedGroup',
      documentation: 'Array for managing checkbox value on groups filter'
    },
    {
      name: 'columns_',
      documentation: 'Array for managing checked groups'
    },
    {
      name: 'textData',
      documentation: 'input text value by user'

    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.selectedGroup = []
      this.columns_ = []

      this.query$.sub(function() {
        self.filterPermission(self, self.query);
      });

      this.start('table').style({'table-layout': 'fixed', 'margin-left': '100'})
        .start('tbody')
          .start('tr')
            .start('td').style({'display': 'block', 'padding': '10'})
              .start('h2').add('Permission').end()
              .add('Search: ').start(this.QUERY).end()
              .tag('br').tag('br').tag('br')
              .add('Groups: ').tag('br')

              .start().select(self.groupDAO.orderBy(self.Group.ID), function(g) {
                var cbGroup = foam.u2.md.CheckBox.create({label: g.id, data: true});
                this.tag(cbGroup).tag('br')

                self.columns_.push(g.id);
                self.selectedGroup.push(cbGroup.data$);
                cbGroup.data$.sub(function() { self.filterGroup(g, self); });
              }).end()

              .start('td').style({'padding-top': '50'}).call(function() { self.td = this; })
                .addClass(this.myClass())
                  .start('table').style({'table-layout': 'fixed', 'width': 'auto'}).call(function() { self.table = this; })
                    .start('thead')
                      .start('tr').style({'background': '#D4E3EB'})
                        .tag('td').style({'text-align': 'left', 'width': '480', 'height': '35'})
                        .select(this.groupDAO.orderBy(this.Group.ID), function(g) {
                          this.start('td').addClass(g.id).start().style({'text-align': 'center', 'width': '100'}).add(g.id).end().end();
                        }).end()
                      .end()
                      .select(this.permissionDAO.orderBy(this.Permission.ID), function(p) {
                        this.start('tr')
                          .start('td').style({'text-align': 'left', 'width': '480', 'padding-left': '8px'}).add(p.id).end()
                            .select(self.groupDAO.orderBy(self.Group.ID), function(g) {
                                var cb = foam.u2.md.CheckBox.create({data: self.checkPermissionForGroup(p.id, g)});
                                cb.data$.sub(function() { self.updateGroup(p, g, cb.data); });
                                this.start('td').style({'text-align': 'center', 'width': '100'}).tag(cb).call(function() {
                                  if ( g.implies(p.id) ) { cb.style({'border-color': '#40C75B'}) };
                                }).end()
                            })
                        .end()
                      })
                    .end()
                .end()
            .end()
        .end()
      .end()
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
    },

    function showTable(self, columns_, rows_) {
      this.table.remove();

      this.td.addClass(this.myClass())
      .start('table').style({'table-layout': 'fixed', 'width': 'auto'}).call(function() { self.table = this; })
        .start('thead')
          .start('tr').style({'background': '#D4E3EB'})
            .tag('td').style({'text-align': 'left', 'width': '480', 'height': '35'})
            .forEach(columns_, function(g) {
                this.start('td').start().style({'text-align': 'center', 'width': '100'}).add(g).end().end();
            })
           .end()
        .end()

        .select(this.permissionDAO.orderBy(this.Permission.ID), function(p) {
          if ( rows_ == null || p.id.indexOf(rows_) != -1 ) {
            this.start('tr')
              .start('td').style({'text-align': 'left', 'width': '480', 'padding-left': '8px'}).add(p.id).end()
                .select(self.groupDAO.orderBy(self.Group.ID), function(g) {
                  for ( var j = 0 ; j < columns_.length ; j++ ) {
                    if ( ( columns_[j] == g.id ) ) {
                      var cb = foam.u2.md.CheckBox.create({data: self.checkPermissionForGroup(p.id, g)});
                      cb.data$.sub(function() { self.updateGroup(p, g, cb.data); });
                          this.start('td').style({'text-align': 'center', 'width': '100'}).tag(cb).call(function() {
                            if ( g.implies(p.id) ) { cb.style({'border-color': '#40C75B'}) };
                          }).end()
                    }
                  }
                })
            .end()
          }
        })
      .end();
     }
  ],

  listeners: [
    function filterGroup(group, self) {
      this.columns_ = []

      for ( var i = 0 ; i < this.selectedGroup.length ; i++ ) {
        var cbGroupData = this.selectedGroup[i].obj.data;
        var curProp = this.selectedGroup[i].obj.label;

        if ( cbGroupData ) {
          this.columns_.push(curProp);
        }
      }

      this.showTable(self, this.columns_, this.textData);
    },

    function filterPermission(self, rows) {
      this.textData = rows;

      this.showTable(self, this.columns_, rows);
    }
  ]
});
