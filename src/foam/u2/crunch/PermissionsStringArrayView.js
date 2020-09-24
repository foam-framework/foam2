/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'PermissionsStringArrayView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'permissionDAO'
  ],

  requires: [
    'foam.nanos.auth.Permission',
    'foam.u2.crunch.PermissionSelection',
    'foam.u2.TextField'
  ],

  properties: [
    {
      name: 'search',
      class: 'String',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'capability search',
        onKey: true
      },
      readVisibility: foam.u2.DisplayMode.RW,//would like it to be accessible even in DAOSummaryView to serch for permissions, but is there any legit way to do that?
    },
    {
      name: 'views',
      class: 'Array',
      of: 'foam.u2.crunch.PermissionSelection',
      factory: function() {
        var self = this;
        this.permissionDAO.select(this.PROJECTION(this.Permission.ID))
          .then(function(proj) {
            self.allPermissions = proj.projection.map(a => a[0]);
            self.filteredPermissions = self.allPermissions;
            self.preSetViewWithProjection(proj);
          });
      }
    },
    {
      name: 'allPermissions',
      class: 'StringArray'
    },
    {
      name: 'filteredPermissions',
      class: 'StringArray'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      
      this.data$.sub(function() {
        console.log('data change');
      });

      this.search$.sub(function() {
        if ( self.search ) {
          self.permissionDAO.select(self.COUNT()).then(c => {
            self.permissionDAO.where(self.CONTAINS_IC(self.Permission.ID, self.search)).select(self.PROJECTION(self.Permission.ID))
            .then(function(proj) {
              self.filteredPermissions = proj.projection.map(a => a[0]);
              self.preSetViewWithProjection(proj);
            });
          });
        } else {
          self.permissionDAO.select(self.PROJECTION(self.Permission.ID))
            .then(function(proj) {
              self.allPermissions = proj.projection.map(a => a[0]);
              self.filteredPermissions = self.allPermissions;
              self.preSetViewWithProjection(proj);
            });
        }
      });
        

      this.start()
        .startContext({ data: this })
        .start()
          .tag(this.SEARCH)
        .end()
        .start()
          .add(this.slot(function(views) {
            if ( views ) {
              return this.E().forEach(views, function(v) {
                this.start()
                  .add(v)
                .end();
              });
            }
          }))
        .end()
        .endContext()
      .end();
    },
    function preSetViewWithProjection(proj) {
      this.views = [];
      var self = this;
      if ( proj.projection.length > 0 )
        this.views.push(this.PermissionSelection.create({ permission: 'Select All', selectedPermissions$: this.data$, onSelect: this.onAllSelectedFunction.bind(this), isSelectedPermissionsContainThisPermission: this.isAllPermissionsSelected.bind(this) }));
      proj.projection.forEach(a => {
        this.views.push(this.PermissionSelection.create({ permission: a[0], selectedPermissions$: self.data$, onSelect: self.onSelectFunction.bind(self),  isSelectedPermissionsContainThisPermission: self.isPermissionSelected.bind(self) }));
      });
    },
    function onSelectFunction(permission, isSelected) {
      if ( isSelected) {
        var newArr =[];
        this.data.forEach(p => {
          newArr.push(p);
        });
        newArr.push(permission);
        this.data = newArr;
      }
      if ( ! isSelected ) {
        var newArr = [];
        this.data.forEach(p => {
          if ( p !== permission )
            newArr.push(p);
        });
        this.data = newArr;
      }
    },
    function onAllSelectedFunction(_, isSelected) {
      if ( ! isSelected ) {
        this.data = [];
      }
      if ( isSelected ) {
        if ( this.filteredPermissions.length < this.data.length ) {
          var isJustFilteredWithoutUnselect = true;
          for ( var p of this.filteredPermissions ) {
            if ( ! this.data.includes(p) ) {
              isJustFilteredWithoutUnselect = false;
              break;
            }
            return;
          }
        }
        if ( this.filteredPermissions.length === this.data.length )
          return;
        var newArr = []; 
        for ( var p of this.filteredPermissions ) {
          newArr.push(p);
        }

        this.data = newArr;
      }
    },
    function isPermissionSelected(permission) {
      return this.data.includes(permission);
    },
    function isAllPermissionsSelected() {
      if ( this.filteredPermissions.length < this.data.length ) {
        for ( var p of this.filteredPermissions ) {
          if ( ! this.data.includes(p) ) {
            return false;
          }
          return true;
        }
      }
      return this.data.length ===  this.filteredPermissions.length;
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
      width: 80%;
      height: 16px;
      float: left;
    }

    .foam-u2-crunch-PermissionSelection-right {
      width: 20%;
      height: 16px;
      float: right;
    }

    .property-isSelected {
      margin: 1.5px 0;
    }
  `,
  properties: [
    {
      name: 'permission',
      class: 'String'
    },
    {
      name: 'description'
    },
    {
      name: 'isSelected',
      class: 'Boolean',
      view: {
        class: 'foam.u2.CheckBox',
        showLabel: false
      },
      postSet: function() {
        if ( ( this.isSelected && ! this.isSelectedPermissionsContainThisPermission(this.permission) ) || (  ! this.isSelected && this.isSelectedPermissionsContainThisPermission(this.permission) ) ) {
          this.onSelect(this.permission, this.isSelected);
        }
      },
      factory: function() {
        return this.isSelectedPermissionsContainThisPermission(this.permission);
      }
    },
    {
      name: 'selectedPermissions',
      // class: 'StringArray'
    },
    'isSelectedPermissionsContainThisPermission',
    'onSelect',
  ],
  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.selectedPermissions$.sub(function() {
        if ( ! self.isSelected && self.isSelectedPermissionsContainThisPermission(self.permission)  )
          self.isSelected = true;
        else if ( self.isSelected && ! self.isSelectedPermissionsContainThisPermission(self.permission)) {
          self.isSelected = false;
        }
      });

      this
        .addClass(this.myClass())
        .startContext({ data: this })
          .start()
            .addClass(this.myClass('left'))
            .add(this.permission)
          .end()
          .start()
            .addClass(this.myClass('right'))
            .tag(this.IS_SELECTED)
          .end()
        .endContext();
    }
  ]
});