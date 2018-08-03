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
    ^ .foam-u2-md-CheckBox:hover {
      background: #FFCCCC;
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
      var groupId = '';

      var cbGroup_ = '';
      var groups = {};

      this.start('table').style({'table-layout': 'fixed', 'margin-left': '100'})
        .start('tr')
          .start('td').style({'display': 'block', 'padding': '10'})
            .start('h2').add('Permission').end()
            .add('Search: ').start(this.QUERY).end()
            .tag('br').tag('br').tag('br')
            .add('Groups: ').tag('br')

            .start().select(self.groupDAO.orderBy(self.Group.ID), function(g) {
              groups[g.id] = foam.u2.md.CheckBox.create({label: g.id, data: true});
              this.tag(groups[g.id]).tag('br')
            }).end()

            .start('td').style({'padding-top': '50'})
              .addClass(this.myClass())
                .start('table').style({'table-layout': 'fixed', 'width': 'auto'})
                  .start('thead')
                    .start('tr').style({'background': '#D4E3EB'})
                      .tag('td').style({'text-align': 'left', 'width': '480', 'height': '35'})
                      .select(this.groupDAO.orderBy(this.Group.ID), function(g) {
                        this.start('td').show(groups[g.id].data$.map(function() { return groups[g.id].data;} ))
                          .addClass(g.id).start().style({'text-align': 'center', 'width': '100'}).add(g.id).end().end();
                      }).end()
                    .end()
                    .select(this.permissionDAO.orderBy(this.Permission.ID), function(p) {
                      this.start('tr')
                        .show(self.query$.map(function(query) { query = query.trim(); return query == "" || p.id.indexOf(query) != -1; }))
                        .start('td').style({'text-align': 'left', 'width': '480', 'padding-left': '8px'}).add(p.id).end()
                          .select(self.groupDAO.orderBy(self.Group.ID), function(g) {
                              var cb = foam.u2.md.CheckBox.create({data: self.checkPermissionForGroup(p.id, g)});
                              cb.data$.sub(function() { self.updateGroup(p, g, cb.data, self); });
                              this.start('td').show(groups[g.id].data$.map(function() { return groups[g.id].data; }))
                                    .style({'text-align': 'center', 'width': '100'}).tag(cb).call(function() {
                                      if ( g.implies(p.id) ) {
                                        cb.setAttribute('title', g.id + ': ' + p.id);
                                        cb.style({'border-color': '#40C75B'});
                                      } else {
                                        g.parent$find.then(function(a) {
                                          if ( a != undefined && a.implies(p.id) ) {
                                            cb.setAttribute('title', g.parent + ': ' + p.id);
                                            cb.style({'border-color': '#40C75B'});
                                          }
                                        });
                                      }
                                    }).end()
                          })
                      .end()
                    })
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

    function updateGroup(p_, g_, data, self) {
      var dao = this.groupDAO;
      var e = foam.mlang.Expressions.create();

      dao.find(g_.id).then(function(group) {
        // Remove permission if found
        var permissions = group.permissions.filter(function(p) {
          return p.id != p_.id;
        });

        //parents' permissions
        group.parent$find.then(function(groupParent) {
          if ( groupParent != undefined ) {
              permissions += groupParent.permissions.filter(function(gp) {
                return gp.id == p_.id;
              });
          }
        });

        // Add if requested
        if ( data ) permissions.push(p_);

        group.permissions = permissions;
        dao.put(group);

        self.updateChildrenPermission(g_.id, permissions);
      });
    },

    function updateChildrenPermission(gp, permissions) {
      var self = this;
      var dao = this.groupDAO;
      var e = foam.mlang.Expressions.create();

      dao.where(e.EQ(this.Group.PARENT, gp)).select().then(function(sink) {
        var array = sink.array;

        for ( var i = 0; i < array.length; i++ ) {
            self.updateChildrenPermission(array[i].id, permissions);

            array[i].permissions = permissions;
            dao.put(array[i]);
        }
      });
    }
  ]
});
