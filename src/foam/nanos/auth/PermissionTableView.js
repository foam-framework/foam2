/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 // TODO:
 // permission dependency graph is too complex given @group permissions
 // so instead of maintaining graph just invalidate all states and then just
 // recalculate lazily whenever any checkbox is clicked
 // invalidated values should still maintain their previous value while
 // being recalculated
foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PermissionTableView',
  extends: 'foam.u2.Controller',

  requires: [
    'foam.graphics.Label',
    'foam.graphics.ScrollCView',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.GroupPermissionJunction',
    'foam.nanos.auth.Permission'
  ],

  imports: [
    'auth',
    'groupDAO',
    'groupPermissionJunctionDAO',
    'permissionDAO',
    'user'
  ],

  constants: {
    ROWS: 26
  },

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

    ^ tbody tr:hover, ^hovered {
      background: #ccc;
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

    ^ .property-groupQuery {
      margin-left: 8px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'query',
      postSet: function() { this.skip = 0; },
      view: {
        class: 'foam.u2.TextField',
        type: 'Search',
        placeholder: 'Permission Search',
        onKey: true
      }
    },
    {
      class: 'String',
      name: 'groupQuery',
      view: {
        class: 'foam.u2.TextField',
        type: 'Search',
        placeholder: 'Group Search',
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

    },
    {
      class: 'Map',
      name: 'gpMap'
    },
    {
      class: 'Map',
      name: 'gMap'
    },
    {
      class: 'Map',
      name: 'pMap'
    },
    {
      class: 'Int',
      name: 'skip'
    },
    'ps', /* permissions array */
    'gs', /* groups array */
    'currentGroup',
    {
      name: 'filteredPs',
      expression: function(ps, query) {
        query = query.trim();
        return ps.filter(function(p) {
          return query == '' || p.id.indexOf(query) != -1;
        });
      }
    },
    {
      name: 'filteredRows',
      expression: function(filteredPs) {
        return filteredPs.length;
      }
    }
  ],

  methods: [
    async function initMatrix() {
      var ps   = this.filteredPs, gs = this.gs;
      var self = this;
      var perms = await this.groupPermissionJunctionDAO.select();
      perms.array.forEach(perm => {
        var g = perm.sourceId, p = perm.targetId;
        var key = p + ':' + g;

        var data = this.GroupPermission.create({
          checked: true
        });

        this.gpMap[key] = data;
      });

      this
        .addClass(this.myClass())
        .start()
          .style({display:'grid', justifyContent: 'center'})
          .start()
            .style({gridColumn: '1/span 1', gridRow: '1/span 1'})
            .addClass(this.myClass('header'))
            .add('Permission Matrix')
            .add(this.GROUP_QUERY, ' ', this.QUERY)
          .end()
          .start('table')
            .on('wheel', this.onWheel)
            .style({gridColumn: '1/span 1', gridRow: '2/span 1'})
            .start('thead')
              .start('tr')
                .start('th')
                  .attrs({colspan:1000})
                  .style({textAlign: 'left', padding: '8px', fontWeight: 400})
                  .add(gs.length, ' groups, ', ps.length, ' permissions', self.filteredRows$.map(function(rows) { return rows == ps.length ?  '' : (', ' + rows + ' selected'); }))
                  .start()
                    .style({float: 'right'})
                    .add('⋮')
                  .end()
                .end()
              .end()
              .start('tr')
                .start('th').style({minWidth: '510px'}).end()
                .call(function() { self.initTableColumns.call(this, gs, self); })
              .end()
            .end()
            .add(this.slot(function(skip, filteredPs) {
              var count = 0;
              return self.E('tbody').forEach(filteredPs, function(p) {
                if ( count > self.skip + self.ROWS ) return;
                if ( count < self.skip ) { count++; return; }
                count++;
                this.start('tr')
                  .start('td')
                    .addClass('permissionHeader')
                    .attrs({title: p.description})
                    .add(p.id)
                  .end()
                  .forEach(gs, function(g) {
                    this.start('td')
                      .show(self.groupQuery$.map(function(q) {
                        return q == '' || g.id.indexOf(q) != -1;
                      }))
                      .on('mouseover', function() { self.currentGroup = g; })
                      .on('mouseout', function() { if ( self.currentGroup === g ) self.currentGroup = ''; })
                      .enableClass(self.myClass('hovered'), self.currentGroup$.map(function(cg) { return cg === g; } ))
                      .attrs({title: g.id + ' : ' + p.id})
                      .tag(self.createCheckBox(p, g))
                    .end();
                  })
                .end();
              });
            }))
          .end()
          .start(self.ScrollCView.create({
            value$: self.skip$,
            extent: self.ROWS,
            height: self.ROWS*21,
            width: 26,
            size$: self.filteredRows$.map(function(m){return m-1;})
          }))
            .style({gridColumn: '2/span 1', gridRow: '2/span 2', 'margin-top':'236px'})
          .end()
        .end();
    },

    // * -> null, foo.bar -> foo.*, foo.* -> *
    function getParentGroupPermission(p, g) {
      var pid = p.id;
      while ( true ) {
        while ( pid.endsWith('.*') ) {
          pid = pid.substring(0, pid.length-2);
        }
        if ( pid == '*' ) return null;
        var i = pid.lastIndexOf('.');
        pid = ( i == -1 ) ? '*' : pid.substring(0, i) + '.*';
        if ( pid in this.pMap ) return this.getGroupPermission(g, this.pMap[pid]);
      }
    },

    function getGroupPermission(g, p) {
      var key  = p.id + ':' + g.id;
      var data = this.gpMap[key];
      var self = this;

      if ( ! data ) {
        data = this.GroupPermission.create({
          checked: false
        });

        data.checked$.sub(function() {
          self.updateGroup(p, g, data.checked$, self);
        });

        // data.impliedByParentPermission = ! data.checked && g.implies(p.id);

        // Parent Group Inheritance
        this.dependOnGroup(g.parent, p, data);

        // Parent Permission Inheritance (wildcarding)
        var pParent = this.getParentGroupPermission(p, g);
        if ( pParent ) {
          function update2() {
            data.impliedByParentPermission = pParent.granted;
          }
          update2();
          this.onDetach(pParent.granted$.sub(update2));
        }

        this.gpMap[key] = data;
      }

      return data;
    },

    function dependOnGroup(g, p, data) {
      if ( ! g ) return;

      var a = this.gMap[g];
      if ( a ) {
        var parent = g && this.getGroupPermission(a, p);
        if ( parent ) {
          function update() {
            if ( parent.granted ) {
              data.impliedByGroups[parent.id] = true;
            } else {
              delete data.impliedByGroups[parent.id];
            }
            data.impliedByGroup = !! Object.keys(data.impliedByGroups).length;
          }
          update();
          this.onDetach(parent.granted$.sub(update));
        }
      }
    },

    function createCheckBox(p, g) {
      // Disable adding a group role to that group itself.
      // TODO: should be protected in the model as well to prevent
      // updating through Group GUI, DIG or API. Also, should prevent
      // loops.
      if ( p.id == '@' + g.id ) return this.E().add('X');
      var self = this;
      return function() {
        return self.GroupPermissionView.create({data: self.getGroupPermission(g, p)});
      };
    },

    function initTableColumns(gs, matrix) {
      var self = this;
      this.forEach(gs, function(g) {
        this.start('th')
          .show(matrix.groupQuery$.map(function(q) {
            return q == '' || g.id.indexOf(q) != -1;
          }))
          .attrs({title: g.description})
          .call(function() {
            var cv = foam.graphics.Box.create({
              color$: matrix.currentGroup$.map(function(cg) { return cg === g ? '#ccc' : 'white'; }),
              autoRepaint: true,
              width: 20,
              height: 200});
            var l  = foam.graphics.Label.create({
              text: g.id,
              x: 25,
              y: 8,
              color: 'black',
              font: '300 16px Roboto',
              width: 200,
              height: 20,
              rotation: -Math.PI/2});
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
        for ( var i = 0 ; i < gs.array.length ; i++ ) {
          self.gMap[gs.array[i].id] = gs.array[i];
        }
        self.permissionDAO.orderBy(self.Permission.ID).select().then(function(ps) {
          for ( var i = 0 ; i < ps.array.length ; i++ ) {
            self.pMap[ps.array[i].id] = ps.array[i];
          }
          self.gs = gs.array;
          self.ps = ps.array;
          self.initMatrix();
        })
      });
    },

    function updateGroup(p_, g_, data, self) {
      var dao = this.groupPermissionJunctionDAO;
      var obj = this.GroupPermissionJunction.create({sourceId: g_.id, targetId: p_.id});

      if ( data.get() ) {
        // Add permission
        dao.put(obj);
      } else {
        // Remove permission
        dao.remove(obj);      }
    }
  ],

  listeners: [
    {
      name: 'onWheel',
      code: function(e) {
        var negative = e.deltaY < 0;
        // Convert to rows, rounding up. (Therefore minumum 1.)
        var rows = Math.ceil(Math.abs(e.deltaY) / 40);
        this.skip = Math.max(0, this.skip + (negative ? -rows : rows));
        if ( e.deltaY !== 0 ) e.preventDefault();
      }
    }
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
          name: 'impliedByParentPermission'
        },
        {
          class: 'Map',
          name: 'impliedByGroups'
        },
        {
          class: 'Boolean',
          name: 'impliedByGroup'
        },
        {
          class: 'Boolean',
          name: 'implied',
          expression: function(impliedByParentPermission, impliedByGroup) {
            return impliedByParentPermission || impliedByGroup;
          }
        },
        {
          class: 'Boolean',
          name: 'granted',
          expression: function(checked, implied) {
            return checked || implied;
          }
        }
      ]
    },
    {
      name: 'GroupPermissionView',
      extends: 'foam.u2.View',
      css: `
        ^:hover { background: #f55 }
        ^checked { color: #4885ff }
        ^implied { color: gray }
      `,
      methods: [
        function initE() {
          this.SUPER();
          this.
            addClass(this.myClass()).
            style({width: '18px', height: '18px'}).
            enableClass(this.myClass('implied'), this.data.checked$, true).
            enableClass(this.myClass('checked'), this.data.checked$).
            add(this.slot(function(data$granted) {
              return data$granted ? '✓' : '';
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
