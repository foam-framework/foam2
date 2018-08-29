foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PermissionMatrixView',
  extends: 'foam.u2.Controller',
  requires: [
    'foam.dao.EasyDAO',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Permission',
    'foam.nanos.auth.PermissionMatrixDAO',
    'foam.u2.view.TableView'
  ],
  imports: [
    'permissionDAO',
    'groupDAO'
  ],
  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      view: { class: 'foam.u2.view.TableView' },
      factory: function() {
        return null;
      }
    }
  ],
  methods: [
    function initE() {
      // TODO: We do a bunch of weird juggling here because the
      // TableView is not currently reactive enough.  It doesn't
      // handle the 'of' of the DAO being changed after the fact, so
      // we need to not render the TableView until we're done
      // computing the model.
      this.daoFactory();

      var view = this;
      this.add(this.slot(function(dao) {
        return dao ? view.TableView.create({ editableRows: true, data: view.dao }) : this.E();
      }));
    },
    function daoFactory() {
      return Promise.all([
        this.permissionDAO.select(),
        this.groupDAO.select()
      ]).then(function(v) {
        var permissions = v[0].array;
        var groups = v[1].array;
        var model = foam.core.Model.create({
          name: 'PermissionMatrix',
          properties: [
            {
              class: 'String',
              name: 'id'
            }
          ]
        });

        for ( var i = 0, group ; group = groups[i] ; i++ ) {
          model.axioms_.push(foam.core.Boolean.create({
            name: group.id,
            tableCellFormatter: function(value, obj, axiom) {
              this.tag(foam.u2.md.CheckBox, { data$: obj.slot(axiom.name) });
            }
          }));
        }

        var cls = model.buildClass();
        var dao = this.EasyDAO.create({
          daoType: 'MDAO',
          of: cls
        });

        for ( var i = 0 ; i < permissions.length ; i++ ) {
          var permission = permissions[i];

          var obj = cls.create({
            id: permission.id
          });

          for ( var j = 0 ; j < groups.length ; j++ ) {
            var group = groups[j];

            obj[group.id] = group.permissions.some(function(p) {
              return p.id === permission.id;
            });
          }

          dao.put(obj);
        }

        dao = this.PermissionMatrixDAO.create({ delegate: dao });

        this.dao = dao;
        return dao;
      }.bind(this));
    }
  ]
});
