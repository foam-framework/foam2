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
      var self = this;

      this.search$.sub(function() {
        if ( self.search ) {
          self.permissionDAO.where(self.CONTAINS_IC(self.Permission.ID, self.search)).select(self.PROJECTION(self.Permission.ID))
            .then(function(proj) {
              self.preSetViewWithProjection(proj);
            });
        } else {
          self.permissionDAO.select(self.PROJECTION(self.Permission.ID))
            .then(function(proj) {
              self.preSetViewWithProjection(proj);
            });
        }
      });
        
      this.SUPER();

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
      this.allPermissions = [];
      if ( proj.projection.length > 0 )
        this.views.push(this.PermissionSelection.create({permission: 'Select All', isSelected: this.data.length === proj.projection.length, onSelectedFunction: this.onAllSelectedFunction.bind(this)}));
      proj.projection.forEach(a => {
        this.views.push(this.PermissionSelection.create({permission: a[0], isSelected: this.data.includes(a[0]), selectedPermissions$: this.data$ }));
        this.allPermissions.push(a[0]);
      });
    },
    function onAllSelectedFunction(_, isSelected) {
      if ( ! isSelected ) {
        this.data = [];
      }
      if ( isSelected ) {
        var newArr = [];
        for ( var p of this.allPermissions ) {

          newArr.push(p);
        }

        this.data = newArr;
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
      name: 'isSelected',
      class: 'Boolean',
      view: {
        class: 'foam.u2.CheckBox',
        showLabel: false
      },
      postSet: function() {
        if ( this.onSelectedFunction)
          this.onSelectedFunction(this.permission, this.isSelected);
        else {
          if ( this.isSelected && ! this.selectedPermissions.includes(this.permission)) {
            this.selectedPermissions.push(this.permission);
          }
          if ( ! this.isSelected && this.selectedPermissions.includes(this.permission)) {
            this.selectedPermissions.splice(this.selectedPermissions.indexOf(this.permission), 1);
          }
        }
      }
    },
    {
      name: 'selectedPermissions',
      class: 'StringArray'
    },
    'selectionChangeFunction',
    'onSelectedFunction'
  ],
  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.selectedPermissions$.sub(function() {
        if ( ! self.isSelected && self.selectedPermissions.includes(self.permission)  )
          self.isSelected = true;
        if ( self.isSelected && ! self.selectedPermissions.includes(self.permission)) {
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