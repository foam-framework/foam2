/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'PermissionsStringArrayView',
  extends: 'foam.u2.View',

  classes: [
    {
      name: 'PermissionRow',
      extends: 'foam.nanos.auth.Permission',

      properties: [
        {
          class: 'Boolean',
          name: 'granted',
          tableWidth: 70,
          tableCellFormatter: function(value, _, projection) {
            var id = projection[0];
            var slot = foam.core.SimpleSlot.create({value: value});
            slot.sub(() => {
              if ( slot.get() ) {
                this.__context__.addPermission(id);
              } else {
                this.__context__.removePermission(id);
              }
            });
            this.add(foam.u2.CheckBox.create({data$: slot}));
          }
        }
      ]
    }
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'permissionDAO'
  ],

  exports: [
    'addPermission',
    'removePermission'
  ],

  requires: [
    'foam.dao.MDAO',
    'foam.nanos.auth.Permission',
    'foam.u2.crunch.PermissionSelection',
    'foam.u2.TextField'
  ],

  css: `
    .foam-u2-crunch-PermissionsStringArrayView-padding {
      padding-top: 8px;
    }
    .property-permissionGranted > .foam-u2-view-ScrollTableView {
      height: 400px;
    }
  `,

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'permissions',
      factory: function() { return this.MDAO.create({of: this.PermissionRow}); },
      view: { class: 'foam.u2.view.ScrollTableView', editColumnsEnabled: false, pageSize: 10 }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'filteredPermissions',
      expression: function(search, permissions) {
        return permissions.where(this.CONTAINS(this.Permission.ID, search));
      },
      view: { class: 'foam.u2.view.ScrollTableView', editColumnsEnabled: false, pageSize: 10 }
    },
    {
      class: 'String',
      name: 'search',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'capability search',
        onKey: true
      },
      readVisibility: foam.u2.DisplayMode.RW
    },
    {
      class: 'String',
      name: 'customPermission',
      view: {
        class: 'foam.u2.TextField',
        placeholder: 'custom permission',
        onKey: true
      }
    },
    {
      name: 'pMap',
      factory: function() { return {}; }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.data.forEach(p => {
        this.pMap[p] = true;
        this.permissions.put(this.PermissionRow.create({id: p, description: 'custom permission', granted: true}));
      });

      this.permissionDAO.select(p => {
        this.permissions.put(this.PermissionRow.create(p).copyFrom({granted: this.pMap[p]}));
      });

      this.start()
        .startContext({ data: this })
          .start()
            .add(this.SEARCH, ' ', this.CUSTOM_PERMISSION, ' ', this.ADD_CUSTOM)
          .end()
          .start()
            .add(this.FILTERED_PERMISSIONS)
          .end()
        .endContext()
      .end();
    },

    function onSelectFunction(permission, isSelected) {
      var newArr =[];
      if ( isSelected ) {
        this.data.forEach(p => newArr.push(p));
        newArr.push(permission);
      } else {
        this.data.forEach(p => { if ( p !== permission ) newArr.push(p); });
      }
      this.data = newArr;
    },

    function addPermission(id) {
      if ( ! this.data.includes(id) ) {
        var data = foam.util.clone(this.data);
        data.push(id);
        data.sort();
        this.data = data;
      }
      this.permissions.find(id).then(row => {
        if ( row ) {
          row.granted = true;
          this.permissions.put(row);
          this.permissions.on.put.pub();
        } else {
          this.permissions.put(this.PermissionRow.create({id: id, description: 'custom permission', granted: true}));
        }
      });
    },

    function removePermission(id) {
      this.data = this.data.filter(p => p != id);
      this.permissions.find(id).then(row => {
        if ( row ) {
          row.granted = false;
          this.permissions.put(row);
          this.permissions.on.put.pub();
        }
      });
    },

    function onSearchChanged() {
      this.show = ! this.search || this.search.length === 0 || this.permission.toLowerCase().includes(this.search.toLowerCase() );
    },

    function onSearchChangedSelectAll() {
      this.stopOnSelect = true;
      this.isSelected = this.isSelectedPermissionsContainThisPermission(this.permission);
    }
  ],

  actions: [
    {
      name: 'addCustom',
      label: 'Add',
      isEnabled: function(customPermission) { return customPermission.trim(); },
      code: function() {
        this.addPermission(this.customPermission);
        this.customPermission = '';
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'PermissionSelection',
  extends: 'foam.u2.View',

  css: `
    ^ {
      height: 16px;
      width: 100%;
    }

    ^:hover {
      background: /*%PRIMARY5%*/ #e5f1fc;
    }

    .foam-u2-crunch-PermissionSelection-left {
      width: 55%;
      height: 16px;
      float: left;
    }

    .foam-u2-crunch-PermissionSelection-less-left {
      width: 40%;
      height: 16px;
      float: left;
    }

    .foam-u2-crunch-PermissionSelection-right {
      margin-right: 5px;
      height: 16px;
      float: right;
    }

    .property-isSelected {
      margin: 1.5px 0;
    }

    .foam-u2-crunch-PermissionSelection-tooltip {
      position: relative;
      visibility: hidden;
      border-radius: 4px;
      color: white;
      background: #999;
      max-height: 80px;
      width: 140px;
      overflow-y: scroll;
      word-break: break-word;
      padding: 4px;
      left: 80%;
    }

    .foam-u2-crunch-PermissionSelection-tooltiptext {
      bottom: 125%;
    }

    .foam-u2-crunch-PermissionSelection-center-tooltiptext {
      bottom: 250%;
    }

    .foam-u2-crunch-PermissionSelection-left:hover .foam-u2-crunch-PermissionSelection-tooltiptext {
      visibility: visible;
    }

    .foam-u2-crunch-PermissionSelection-less-left:hover .foam-u2-crunch-PermissionSelection-center-tooltiptext {
      visibility: visible;
    }

    .foam-u2-crunch-PermissionSelection-hide-text {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'permission'
    },
    {
      name: 'description'
    },
    {
      class: 'Boolean',
      name: 'isSelected',
      view: {
        class: 'foam.u2.CheckBox',
        showLabel: false
      },
      postSet: function() {
        if ( ( this.isSelected && ! this.isSelectedPermissionsContainThisPermission(this.permission) ) || (  ! this.isSelected && this.isSelectedPermissionsContainThisPermission(this.permission) ) && ! this.stopOnSelect ) {
          this.onSelect(this.permission, this.isSelected);
        }
        this.stopOnSelect = false;
      },
      factory: function() {
        return this.isSelectedPermissionsContainThisPermission(this.permission);
      }
    },
    {
      name: 'selectedPermissions'
    },
    'isSelectedPermissionsContainThisPermission',
    'onSelect',
    'search',
    {
      class: 'Boolean',
      name: 'show',
      value: true
    },
    {
      class: 'Boolean',
      name: 'stopOnSelect'
    },
    'onSearchChange'
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.search$.sub(function() {
        self.onSearchChange();
      });

      this.selectedPermissions$.sub(function() {
        if ( ! self.isSelected && self.isSelectedPermissionsContainThisPermission(self.permission) )
          self.isSelected = true;
        else if ( self.isSelected && ! self.isSelectedPermissionsContainThisPermission(self.permission) ) {
          self.isSelected = false;
        }
      });

      this
      .start()
        .show(this.show$)
        .addClass(this.myClass())
        .startContext({ data: this })
          .start()
            .addClass(this.myClass('left'))
            .start()
              .addClass(this.myClass('hide-text'))
              .add(this.permission)
            .end()
            .start()
              .show( this.permission && this.permission.length > 0 )
              .addClass(this.myClass('tooltip'))
              .addClass(this.myClass('tooltiptext'))
              .add(this.permission)
            .end()
          .end()
          .start()
            .addClass(this.myClass('less-left'))
            .start()
              .addClass(this.myClass('hide-text'))
              .add(this.description)
            .end()
            .start()
              .show( this.description && this.description.length > 0 )
              .addClass(this.myClass('tooltip'))
              .addClass(this.myClass('center-tooltiptext'))
              .add(this.description)
            .end()
          .end()
          .start()
            .addClass(this.myClass('right'))
            .tag(this.IS_SELECTED)
          .end()
        .endContext()
      .end();
    }
  ]
});
