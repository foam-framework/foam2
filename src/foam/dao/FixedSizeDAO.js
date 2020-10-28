/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'FixedSizeDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    Manages the size of a dao by purging on each put. Elements that match
    the predicate are removed.
    NOTE: this DAO must delegate to an MDAO so the remove operations only
    affect memory.  Install via EasyDAO to it is installed in the correct
    place.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.sink.Count'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.order.Comparator',
      name: 'comparator'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate'
    },
    {
      class: 'Int',
      name: 'size'
    },
    {
      class: 'Long',
      name: 'purgePercent',
      value: 10
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        obj = getDelegate().put_(x, obj);
        Count count = new Count();
        count = (Count) this.getDelegate().select(count);
        if ( count.getValue() > getSize() + getSize() * getPurgePercent() / 100 ) {
          DAO delegate = this.getDelegate()
            .where(getPredicate())
            .skip(getSize());

          if ( getComparator() != null ) {
            delegate = delegate.orderBy(getComparator());
          }

          delegate.removeAll();
        }
        return obj;
      `
    },
  ]
});
