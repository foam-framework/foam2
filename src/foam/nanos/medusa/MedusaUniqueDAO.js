/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaUniqueDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Enforce unique indexes on nodes.  Since nodes don't use MDAO, remember the last many nodes and check for duplicates.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.UniqueConstraintException',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.Iterator',
    'java.util.Set',
    'java.util.TreeSet'
  ],

  properties: [
    {
      name: 'retain',
      class: 'Long',
      value: 10000,
    },
    {
      name: 'indexLimit',
      class: 'Long',
      value: 20000
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
    TreeSet indexes_ = new TreeSet();
        `);
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;
      if ( indexes_.contains(entry.getIndex()) ) {
        Alarm alarm = new Alarm.Builder(x)
          .setName("Medusa Duplicate Index")
          .setIsActive(true)
          .setNote(entry.toString())
          .build();
        ((DAO) x.get("alarmDAO")).put(alarm);
        throw new UniqueConstraintException("Medusa Duplicate Index: "+entry.getIndex());
      }

      indexes_.add(entry.getIndex());
      if ( indexes_.size() > getIndexLimit() ) {
        long last = (long) indexes_.last();
        Iterator<Long> iter = indexes_.headSet(last - getRetain()).iterator();
        while( iter.hasNext() ) {
          iter.next();
          iter.remove();
        } 
      }

      return getDelegate().put_(x, entry);
      `
    }
  ]
});
