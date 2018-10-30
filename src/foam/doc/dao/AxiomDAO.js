/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.doc.dao',
  name: 'AxiomDAO',
  extends: 'foam.dao.PromisedDAO',
  requires: [
    'foam.core.Method',
    'foam.core.Property',
    'foam.dao.ArrayDAO',
    'foam.dao.QuickSink',
    'foam.doc.MethodAxiom',
    'foam.doc.PropertyAxiom',
    'foam.doc.dao.PropertyPermissionCheckDecorator',
  ],
  properties: [
    {
      name: 'of',
      value: 'foam.doc.Axiom',
    },
    {
      name: 'modelIds',
    },
    {
      name: 'delegate',
      expression: function(of) { 
        return this.PropertyPermissionCheckDecorator.create({
          delegate: this.ArrayDAO.create({ of: of })
        });
      },
    },
    {
      name: 'promise',
      expression: function(modelIds, delegate) {
        var self = this;
        return Promise.all(modelIds.map(function(m) {
          return self.putCls_(foam.lookup(m));
        })).then(function() {
          return delegate;
        })
      },
    },
  ],
  methods: [
    function putCls_(m) {
      var ps = [];
      var self = this;
      while ( true ) {
        m.getOwnAxioms().forEach(function(a) {
          var cls =
            self.Property.isInstance(a) ?
              self.PropertyAxiom :
            self.Method.isInstance(a) ?
              self.MethodAxiom :
            null;
          if ( ! cls ) return;
          ps.push(self.delegate.put(cls.create({
            axiom: a,
            parentId: m.id
          })));
        });
        if ( m.id == 'foam.core.FObject' ) break;
        m = foam.lookup(m.model_.extends);
      }
      return Promise.all(ps);
    },
  ],
});

