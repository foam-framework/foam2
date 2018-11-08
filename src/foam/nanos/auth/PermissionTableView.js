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
    'permissionDAO',
    'user'
  ],

  requires: [
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Permission',
    'foam.graphics.Label'
  ],

  css: `
    ^ thead th {
      background: white;
      padding: 0;
      text-align: center;
    }

    ^ tbody td {
      text-align: center;
    }

    tbody {
       overflow: auto;
       width: 100%;
       height: 150px;
     }

    ^ tbody tr { background: white; }

    ^ .foam-u2-md-CheckBox {
      margin: 1px;
      border: none;
    }

    ^ .foam-u2-md-CheckBox:hover {
      background: #FFCCCC;
    }

    ^ tbody tr:hover {
      background: #eee;
    }

    ^ table {
       box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
       width: auto;
       border: 0;
      }

    ^header {
      box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
      background: white;
      padding: 8px;
      margin: 8px 0;
    }

    ^header input { float: right }

    ^ .permissionHeader {
      color: #444;
      text-align: left;
      padding-left: 6px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'query',
      view: {
        class: 'foam.u2.TextField',
        type: 'Search',
        placeholder: 'Permission Search',
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
    function initMatrix(gs, ps) {
      var self = this;
      this
        .addClass(this.myClass())
        .start()
          .style({display:'grid', justifyContent: 'center'})
          .start()
            .style({gridColumn: '1/span 1', gridRow: '1/span 1'})
            .addClass(this.myClass('header'))
            .add('Permission Matrix')
            .add(this.QUERY)
          .end()
          .start('table')
            .style({gridColumn: '1/span 1', gridRow: '2/span 1'})
            .attrs({border: 1})
            .start('thead')
              .start('tr')
                .start('th')
                  .attrs({colspan:1000})
                  .style({textAlign: 'left', padding: '8px', fontWeight: 400})
                  .add(gs.length, ' groups, ', ps.length, ' permissions')
                  .start()
                    .style({float: 'right'})
                    .add('⋮')
                  .end()
                .end()
              .end()
              .start('tr')
                .start('th').style({minWidth: '350px'}).end()
                .call(function() { self.initTableColumns.call(this, gs); })
              .end()
            .end()
            .start('tbody')
              .forEach(ps, function(p) {
                this
                  .start('tr')
                    .show(self.query$.map(function(query) { query = query.trim(); return query == "" || p.id.indexOf(query) != -1; }))
                    .start('td')
                      .addClass('permissionHeader')
                      .attrs({title: p.description})
                      .add(p.id)
                    .end()
                    .forEach(gs, function(g) {
                      this.start('td')
                        .attrs({title: g.id + ' : ' + p.id})
                        .tag(self.createCheckBox(p, g))
                      .end();
                    })
                  .end();
              })
            .end()
          .end()
        .end();
    },

    function createCheckBox(p, g) {
      var self = this;
      return function() {
        var data = self.GroupPermission.create({
          checked: self.checkPermissionForGroup(p.id, g),
          implied: g.implies(p.id)
        });
        data.checked$.sub(function() {
          self.updateGroup(p, g, data.checked$, self);
         });

        return self.GroupPermissionView.create({data: data});
      };
    },

    function initTableColumns(gs) {
      var self = this;
      this.forEach(gs, function(g) {
        this.start('th')
          .attrs({title: g.description})
          .call(function() {
            var cv = foam.graphics.CView.create({width: 20, height: 200});
            var l  = foam.graphics.Label.create({text: g.id, x: 25 , y: 8, color: 'black', font: '300 16px Roboto', width: 200, height: 20, rotation: -Math.PI/2});
            cv.add(l);
            this.add(cv);
          })
        .end();
      });
    },

    function initE() {
      this.SUPER();
      var self = this;

      this.groupDAO.orderBy(this.Group.ID).select().then(function(gs) {
        self.permissionDAO.orderBy(self.Permission.ID).select().then(function(ps) {
          self.initMatrix(gs.array, ps.array);
        })
      });
      /*
      this
      .start('table').style({'table-layout': 'fixed', 'margin-left': '100'})
        .start('tr')
          .start('td').style({'display': 'block', 'padding': '10'})
            .start('h2').add('Permission').end()
            .add('Search: ').start(this.QUERY).end()
            .tag('br').tag('br').tag('br')
            .add('Groups: ').tag('br')
            .start()
              .select(self.groupDAO.orderBy(self.Group.ID), function(g) {
                groups[g.id] = foam.u2.md.CheckBox.create({label: g.id, data: self.user.group == g.id});
                return self.E().add(groups[g.id]).tag('br');
              })
            .end()
            .start('td').style({'padding-top': '50'})
              .add('above table')
              .addClass(this.myClass())
              .start('table').style({'table-layout': 'fixed', 'width': 'auto'})
                .call(self.initColumns.bind(this, self, groups))
            .end()
          .end()
      .end()*/
    },

    /*
    function initColumns(self, groups) {
      this.start('tr')
        .style({'background': '#D4E3EB'})
        .tag('td').style({'text-align': 'left', 'width': '480', 'height': '35'})
        .select(this.groupDAO.orderBy(this.Group.ID), function(g) {
          debugger;
          return self.E('td').
            // .show(groups[g.id].data$.map(function() { return groups[g.id].data;} ))
            addClass(g.id).start().style({'text-align': 'center', 'width': '100'})
            .add(g.id)
          .end();
        })
      .end();
    },
    */

    /*
    function initPermissionRow() {
      return self.E('tr')
        .show(self.query$.map(function(query) { query = query.trim(); return query == "" || p.id.indexOf(query) != -1; }))
        .start('td').style({'text-align': 'left', 'width': '480', 'padding-left': '8px'}).add(p.id).end()
          .select(self.groupDAO.orderBy(self.Group.ID), function(g) {
            return self.E('b').add('X');
            return this.E('td')
              .show(groups[g.id].data$.map(function() { return groups[g.id].data; }))
              .style({'text-align': 'center', 'width': '100'})
              .start({class: 'foam.u2.md.CheckBox', data: self.checkPermissionForGroup(p.id, g)})
                .call(function() {
                  this.data$.sub(function() { self.updateGroup(p, g, this.data, self); });
                  if ( g.implies(p.id) ) {
                    this.setAttribute('title', g.id + ': ' + p.id);
                    //this.style({'border-color': '#40C75B'});
                  } else {
                    g.parent$find.then(function(a) {
                      if ( a != undefined && a.implies(p.id) ) {
                        this.setAttribute('title', g.parent + ': ' + p.id);
                        //this.style({'border-color': '#40C75B'});
                      }
                    });
                  }
                })
              .end()
            .end();
          })
        .end()

    },
    */

    function checkPermissionForGroup(permissionId, group) {
      for ( i = 0 ; i < group.permissions.length ; i++ ) {
        if ( permissionId == group.permissions[i].id ) {
          return true;
        }
      }
    },

    function updateGroup(p_, g_, data, self) {
      var dao = this.groupDAO;
      var e   = foam.mlang.Expressions.create();

      dao.find(g_.id).then(function(group) {
        // Remove permission if found
        var permissions = group.permissions.filter(function(p) {
          return p.id != p_.id;
        });

        // parents' permissions
        group.parent$find.then(function(groupParent) {
          if ( groupParent != undefined ) {
              permissions += groupParent.permissions.filter(function(gp) {
                return gp.id == p_.id;
              });
          }
        });

        // Add if requested
        if ( data.get() ) permissions.push(p_);

        group.permissions = permissions;
        dao.put(group);
      });
    },
    /*
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
    */
  ],

  classes: [
    {
      name: 'GroupPermission',
      properties: [
        {
          class: 'Boolean',
          name: 'checked'
        },
        {
          class: 'Boolean',
          name: 'implied'
        },
        {
          name: 'dependees',
          factory: function() { return []; }
        }
      ]
    },
    {
      name: 'GroupPermissionView',
      extends: 'foam.u2.View',
      css: `
        ^checked { color: #4885ed }
        ^implied { color: lightGray }
      `,
      methods: [
        function initE() {
          this.SUPER();
          this.
            addClass(this.myClass()).
            style({width: '18px', height: '18px'}).
            enableClass(this.myClass('implied'), this.data.checked$, true).
            enableClass(this.myClass('checked'), this.data.checked$).
            add(this.slot(function(data$checked, data$implied) {
              return data$checked || data$implied ? '✓' : '';
            })).
            on('click', this.onClick);
        }
      ],
      listeners: [
        function onClick() {
          this.data.checked = ! this.data.checked;
        }
      ]
    }
  ]
});
