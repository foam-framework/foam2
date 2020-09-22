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
    'foam.nanos.auth.Permission'
  ],

  properties: [
    {
      name: 'permissions',//remove as there will be data?
      class: 'StringArray'
    },
    {
      name: 'search',
      class: 'String',
      view: {
       class: 'foam.u2.TextField',
       type: 'search',
       onKey: true
      }
    },
    {
      name: 'dao',
      expression: function(searchTerm) {
        if ( searchTerm )
          return this.permissionDAO.where(this.KEYWORD(searchTerm));
        return this.permissionDAO;
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.start()
        .add(this.slot(function(dao) {
          this.dao.select(this.PROJECTION(this.Permission.ID))
            .then(function(proj) {
              this.forEach(proj.projection, function(arr) {
                return this.start()
                  .add(arr[0])
                  .start()

                  .end()
                .end();
              })
            });
        }))
      .end();

    }
  ]

});


foam.CLASS({
  name: 'PermissionSelection',
  package: 'foam.u2.crunch',
  extends: 'foam.u2.View',
  properties: [
    {
      name: 'permission',
      class: 'String'
    },
    {
      name: 'isSelected',
      class: 'Boolean'
    }
  ],
  methods: [
    function initE() {
      this.SUPER();

      this.start()
        .start()
          .tag(this.PERMISSION)
        .end()
        .start()
          .tag(this.IS_SELECTED)
        .end()
      .end();
    }
  ]
});