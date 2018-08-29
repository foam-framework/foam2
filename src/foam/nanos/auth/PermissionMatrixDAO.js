foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PermissionMatrixDAO',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'foam.dao.EasyDAO'
  ],
  imports: [
    'permissionDAO',
    'groupDAO'
  ],
  methods: [
    function init() {
      this.SUPER();
      Promise.all([
        this.permissionDAO.select(),
        this.groupDAO.select()
      ]).then(this.buildData_.bind(this));
    },
    function put_(x, obj) {
      // TODO: Make appropriate updates to real permissionDAO/groupDAO.
      return Promise.reject('Unsupported.');
    },
    function remove_(x, obj) {
      return Promise.reject('Unsupported.');
    },
    function removeAll_(x, predicate) {
      return Promise.reject('Unsupported.');
    },
    function buildData_(v) {
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

      this.delegate = dao;
    }
  ],
  listeners: [
  ]
});
