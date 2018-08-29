foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PermissionMatrixView',
  extends: 'foam.u2.Controller',
  requires: [
    'foam.u2.view.TableView',
    'foam.nanos.auth.PermissionMatrixDAO'
  ],
  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      view: { class: 'foam.u2.view.TableView' },
      factory: function() {
        return this.PermissionMatrixDAO.create();
      }
    }
  ],
  methods: [
    function initE() {
      this.add(this.DAO);
    }
  ]
});
