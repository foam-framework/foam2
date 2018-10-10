/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.doc.dao',
  name: 'PropertyPermissionCheckDecorator',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    DAO decorator to fill in the hasPermission property on foam.doc.Axioms put
    into a dao.
  `,
  requires: [
    'foam.doc.PropertyAxiom',
  ],
  imports: [
    'auth',
  ],
  methods: [
    function put_(x, o) {
      var self = this;
      if ( ! this.PropertyAxiom.isInstance(o) )
        return this.delegate.put_(x, o);
      return self.auth.check(x, `${o.parentId}.properties.permissioned`)
        .then(function(permitted) {
          if ( ! permitted ) return false;
          return self.auth.check(x, `${o.parentId}.property.${o.axiom.name}`)
      }).then(function(permitted) {
        o.hasPermission = permitted;
        return self.delegate.put_(x, o);
      });
    },
  ],
});
