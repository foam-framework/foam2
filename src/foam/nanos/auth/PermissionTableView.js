foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PermissionTableView',
  extends: 'foam.u2.Element',

  imports: [
    'groupDAO',
    'permissionDAO',
    'auth'
  ],

  css: `
    ^ .net-nanopay-ui-ActionView{
      width: 95.5%;
      height: 40px;
      background: #59aadd;
      margin-bottom: 15px;
    }
  `,

  actions: [
    {
      name: 'save',
      label: 'Save',
      code: function(X) {
        X.dao.put(this);
        X.stack.push({class: 'foam.nanos.auth.permissionDAO'});
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start().addClass('button-row')
          .start(this.SAVE).addClass('float-right').end()
        .end()
      this.start('table')
        .start('tr')
          .tag('td')
          .select(this.groupDAO, function(g) {
            this.start('th').add(g.id).end();
          })
        .end()
        .select(this.permissionDAO, function(p) {
          this.start('tr')
            .start('th').add(p.id).end()
            .select(self.groupDAO, function(g) {
              this.start('td').tag({class: 'foam.u2.CheckBox', data: self.checkPermissionForGroup(p.id, g)}).end();
            })
          .end()
        })
      .end()
      .end();
    },

    function checkPermissionForGroup(permission, group) {
      for ( i = 0 ; i < group.permissions.length ; i++ ) {
        if ( permission == group.permissions[i].id ) {
          return true;
        }
      }
    },

    function SavePermissionForGroup() {

    }

  ]
});
