/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'PermissionsStringArrayView',
  extends: 'foam.u2.Controller',

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
      }
    },
    {
      name: 'views',
      class: 'Array',
      of: 'foam.mlang.Expressions',
      factory: function() {
        var self = this;
        this.permissionDAO.select(this.PROJECTION(this.Permission.ID))
          .then(function(proj) {
            self.views =  proj.projection.map(a => self.PermissionSelection.create({permission: a[0], isSelected: self.data$.value.includes(a[0]), onSelectedFunction: self.onSelectedFunction.bind(self)}));
          });
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;

      this.search$.sub(function() {
        if ( self.search ) {
          self.permissionDAO.where(self.CONTAINS_IC(self.Permission.ID, self.search)).select(self.PROJECTION(self.Permission.ID))
            .then(function(proj) {
              self.views = proj.projection.map(a => self.PermissionSelection.create({permission: a[0], isSelected: self.data$.value.includes(a[0]), onSelectedFunction: self.onSelectedFunction.bind(self)}));
            });
        } else {
          self.permissionDAO.select(self.PROJECTION(self.Permission.ID))
            .then(function(proj) {
              self.views = proj.projection.map(a => self.PermissionSelection.create({permission: a[0], isSelected: self.data$.value.includes(a[0]), onSelectedFunction: self.onSelectedFunction.bind(self)}));
            });
        }
      });
        
      this.SUPER();

      this.start()
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
      .end();
    },
    function onSelectedFunction(permission, isSelected) {
      if ( this.data$.value.includes(permission) && ! isSelected ) {
        this.data$.value.splice(this.data$.value.indexOf(permission), 1);
      }
      if ( ! this.data$.value.includes(permission) && isSelected ) {
        this.data$.value.push(permission);
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
      }
    },
    'onSelectedFunction'
  ],
  methods: [
    function initE() {
      this.SUPER();

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