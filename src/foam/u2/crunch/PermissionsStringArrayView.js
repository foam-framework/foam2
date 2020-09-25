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

  css: `
    .foam-u2-crunch-PermissionsStringArrayView-padding {
      padding-top: 8px;
    }
  `,

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
      readVisibility: foam.u2.DisplayMode.RW,
    },
    {
      name: 'views',
      class: 'Array',
      of: 'foam.u2.crunch.PermissionSelection',
      factory: function() {
        var self = this;
        this.permissionDAO.select(this.PROJECTION(this.Permission.ID, this.Permission.DESCRIPTION))
          .then(function(proj) {
            self.allPermissions = proj.projection.map(a => a[0]);
            self.preSetViewWithProjection(proj);
          });
      }
    },
    {
      name: 'allPermissions',
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

      this.start()
      .startContext({ data: this })
      .start()
          .tag(this.SEARCH)
        .end()
        .start()
          .addClass(this.myClass('padding'))
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
        this.views.push(this.PermissionSelection.create({
          permission: 'Select All',
          search$: this.search$,
          selectedPermissions$: this.data$,
          onSelect: this.onAllSelectedFunction.bind(this),
          isSelectedPermissionsContainThisPermission: this.isAllPermissionsSelected.bind(this),
          onSearchChange: this.onSearchChangedSelectAll
        }));
      proj.projection.forEach(a => {
        this.views.push(this.PermissionSelection.create({
          permission: a[0],
          search$: this.search$,
          description: a[1],
          selectedPermissions$: self.data$,
          onSelect: self.onSelectFunction.bind(self),
          isSelectedPermissionsContainThisPermission: self.isPermissionSelected.bind(self),
          onSearchChange: this.onSearchChanged
        }));
      });
    },
    function onSelectFunction(permission, isSelected) {
      var newArr =[];
      if ( isSelected ) {
        this.data.forEach(p => {
          newArr.push(p);
        });
        newArr.push(permission);
      } else {
        this.data.forEach(p => {
          if ( p !== permission )
            newArr.push(p);
        });
      }
      this.data = newArr;
    },
    function onAllSelectedFunction(_, isSelected) {
      var filteredPermissions = this.views.filter(v => v.show && v.permission !== 'Select All').map(v => v.permission);
      var newArr = [];
      if ( ! isSelected ) {
        if ( this.allPermissions.length !== filteredPermissions.length ) {
          for ( var p of this.data ) {
            if ( ! filteredPermissions.includes(p) ) {
              newArr.push(p);
            }
          }
        }
      } else {
        if ( filteredPermissions.length < this.data.length ) {
          for ( var p of this.data ) {
            newArr.push(p);
          }
          
        }
        for ( var p of filteredPermissions ) {
          if ( ! newArr.includes(p) ) {
            newArr.push(p);
          }
        }
      }
      this.data = newArr;
    },
    function isPermissionSelected(permission) {
      return this.data.includes(permission);
    },
    function isAllPermissionsSelected() {
      var filteredPermissions = this.views.filter(v => v.show && v.permission !== 'Select All').map(v => v.permission);
      if ( filteredPermissions.length < this.data.length ) {
        for ( var p of filteredPermissions ) {
          if ( ! this.data.includes(p) ) {
            return false;
          }
        }
        return true;
      }
      return this.data.length === filteredPermissions.length;
    },
    function onSearchChanged() {
      this.show = ! this.search || this.search.length === 0 || this.permission.toLowerCase().includes(this.search.toLowerCase() );
    },
    function onSearchChangedSelectAll() {
      this.stopOnSelect = true;
      this.isSelected = this.isSelectedPermissionsContainThisPermission(this.permission);
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
      name: 'selectedPermissions',
    },
    'isSelectedPermissionsContainThisPermission',
    'onSelect',
    'search',
    {
      name: 'show',
      class: 'Boolean',
      value: true
    },
    {
      name: 'stopOnSelect',
      class: 'Boolean',
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