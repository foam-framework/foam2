/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'RoutingJournal',
  extends: 'foam.dao.FileJournal',

  documentation:
    `Journal interface that also adds the DAO name to the journal entry so that one may use
    a single journal file and still be able to put the entry into the correct DAO`,

  methods: [
    {
      name: 'put',
      javaCode: `
        try {
          foam.core.FObject old = null;
          Object id = obj.getProperty("id");
          String service = (String) x.get("service");
          foam.dao.DAO dao = (foam.dao.DAO) x.get(service);

          String record = ( getOutputDiff() && ( old = dao.find(id) ) != null ) ?
            getOutputter().stringifyDelta(old, obj) :
            getOutputter().stringify(obj);

          if ( ! foam.util.SafetyUtil.isEmpty(record) ) {
            writeComment_(x, obj);
            write_(sb.get()
              .append(service)
              .append(".p(")
              .append(record)
              .append(")")
              .toString());
          }
        } catch ( Throwable t ) {
          getLogger().error("Failed to write put entry to journal", t);
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'remove',
      javaCode: `
        try {
          String service = (String) x.get("service");
          foam.core.FObject toWrite = (foam.core.FObject) obj.getClassInfo().newInstance();
          toWrite.setProperty("id", obj.getProperty("id"));
          String record = getOutputter().stringify(toWrite);

          if ( ! foam.util.SafetyUtil.isEmpty(record) ) {
            writeComment_(x, obj);
            write_(sb.get()
              .append(service)
              .append(".r(")
              .append(record)
              .append(")")
              .toString());
          }
        } catch ( Throwable t ) {
          getLogger().error("Failed to write remove entry to journal", t);
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'replay',
      javaCode: `
        return;
      `
    }
  ]
});
