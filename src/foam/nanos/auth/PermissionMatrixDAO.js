foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PermissionMatrixDAO',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'foam.nanos.auth.Permission',
    'foam.nanos.auth.Group'
  ],
  imports: [
    'permissionDAO',
    'groupDAO'
  ],
  methods: [
    function init() {
      this.SUPER();
    },
    function put_(x, obj) {
      var self = this;
      var existing;
      return this.delegate.find(obj.id).then(function(e) {
        existing = e;
        var props = existing.cls_.getAxiomsByClass(foam.core.Boolean);

        var added = props.filter(function(prop) {
          return obj[prop.name] && ! existing[prop.name];
        }).map(function(added) {
          return self.groupDAO.find(added.name).then(function(group) {
            group = group.clone();
            group.permissions = group.permissions.concat(self.Permission.create({ id: existing.id }));
            return self.groupDAO.put(group);
          })
        });

        var removed = props.filter(function(prop) {
          return ! obj[prop.name] && existing[prop.name];
        }).map(function(removed) {
          return self.groupDAO.find(removed.name).then(function(group) {
            group = group.clone();
            group.permissions = group.permissions.filter(function(perm) { return perm.id != existing.id; });
            return self.groupDAO.put(group);
          });
        });
        return Promise.all(
          added.concat(removed));
      });
    },
    function remove_(x, obj) {
      return Promise.reject('Unsupported.');
    },
    function removeAll_(x, predicate) {
      return Promise.reject('Unsupported.');
    }
  ]
});
