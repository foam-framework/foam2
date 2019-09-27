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

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.order.Comparator',
      name: 'comparator'
    },
    {
      //class: 'foam.mlang.predicate.PredicateProperty',
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate'
    },
    {
      class: 'Int',
      name: 'size'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        obj = getDelegate().put_(x, obj);
        this.getDelegate()
          .where(getPredicate())
          .orderBy(getComparator())
          .skip(getSize())
          .removeAll();
        return obj;
      `
    },
  ]
});
