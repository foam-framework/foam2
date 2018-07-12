foam.CLASS({
  package: 'foam.dao',
  name: 'FilteredDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.mlang.predicate.And'
  ],

  properties: [
    {
      // TODO: FObjectProperty of Predicate. Doing this currently breaks java.
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      swiftType: 'foam_mlang_predicate_Predicate',
      name: 'predicate'
    }
  ],

  methods: [
    {
      name: 'find_',
      code: function find_(x, key) {
        var predicate = this.predicate;
        return this.delegate.find_(x, key).then(function(o) {
          return predicate.f(o) ? o : null;
        });
      },
      javaCode: `foam.core.FObject ret = super.find_(x, id);
if ( ret != null && getPredicate().f(ret) ) return ret;
return null;`
    },

    
    {
      name: 'select_',
      code: function(x, sink, skip, limit, order, predicate) {
        return this.delegate.select_(
          x, sink, skip, limit, order,
          predicate ?
            this.And.create({ args: [this.predicate, predicate] }) :
            this.predicate);
      },
      swiftCode: function() {/*
return try delegate.select_(
  x, sink, skip, limit, order,
  predicate != nil ?
    And_create(["args": [self.predicate, predicate!] ]) :
    self.predicate)
                             */},
      javaCode: 'return super.select_(x, sink, skip, limit, order, predicate == null ? getPredicate() : foam.mlang.MLang.AND(getPredicate(), predicate));'
    },

    {
      name: 'removeAll_',
      code: function removeAll_(x, skip, limit, order, predicate) {
        return this.delegate.removeAll_(
          x, skip, limit, order,
          predicate ?
            this.And.create({ args: [this.predicate, predicate] }) :
          this.predicate);
      },
      javaCode: 'super.removeAll_(x, skip, limit, order, predicate == null ? getPredicate() : foam.mlang.MLang.AND(getPredicate(), predicate));'
    },

    {
      name: 'listen_',
      code: function listen_(x, sink, predicate) {
        return this.delegate.listen_(
          x, sink,
          predicate ?
            this.And.create({ args: [this.predicate, predicate] }) :
            this.predicate);
      },
      swiftCode: `
return try delegate.listen_(
  x, sink,
  predicate != nil ?
    And_create(["args": [self.predicate, predicate]]) :
    predicate)
      `,
      javaCode: 'super.listen_(x, sink, predicate == null ? getPredicate() : foam.mlang.MLang.AND(getPredicate(), predicate));'
    },
  ]
});
