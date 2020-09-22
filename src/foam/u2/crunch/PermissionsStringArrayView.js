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
      name: 'permissions',//remove as there will be data?
      class: 'StringArray'
    },
    {
      name: 'search',
      class: 'String'
      // view: {
      //  class: 'foam.u2.TextField',
      //  type: 'search',
      //  onKey: true
      // }
    },
    {
      name: 'dao',
      expression: function(search) {
        if ( search )
          return this.permissionDAO.where(this.KEYWORD(search));
        return this.permissionDAO;
      },
      factory: function() {
        return this.permissionDAO;
      }
    },
    {
      name: 'views',
      class: 'Array',
      of: 'foam.mlang.Expressions',
      expression: function(dao, permissions) {
        dao.select(this.PROJECTION(this.Permission.ID))
          .then(function(proj) {
            return proj.projection.map(a => this.PermissionSelection.create({permission: a[0], isSelected: permissions.includes(a[0]), onSelectedFunction: this.onSelectedFunction}));
          });
      },
      factory: function() {
        var self = this;
        this.dao.select(this.PROJECTION(this.Permission.ID))
          .then(function(proj) {
            self.views =  proj.projection.map(a => self.PermissionSelection.create({permission: a[0], isSelected: self.permissions.includes(a[0]), onSelectedFunction: self.onSelectedFunction.bind(self)}));
          });
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.start()
        .start()
          .add(this.SEARCH.clone().copyFrom({
            class: 'foam.u2.TextField',
            type: 'search',
            onKey: true
          }))
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
      .end();
    },
    function onSelectedFunction(permission, isSelected) {
      if ( this.permissions.includes(permission) && ! isSelected ) {
        this.permissions.splice(this.permissions.indexOf(permission), 1);
        return;
      }
      if ( ! this.permissions.includes(permission) && isSelected ) {
        this.permissions.push(permission);
      }
    }
  ]

});


foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'PermissionSelection',
  extends: 'foam.u2.View',
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
      }
    },
    'onSelectedFunction'
  ],
  methods: [
    function initE() {
      this.SUPER();

      this.start()
        .startContext({data: this})
          .add(this.permission)
          .tag(this.IS_SELECTED)
        .endContext()
      .end();
    }
  ]
});