/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'WriteOnlyFileJournal',
  extends: 'foam.dao.FileJournal',

  properties: [
    {
      name: 'outputClassNames',
      class: 'Boolean',
      value: false
    },
    {
      name: 'outputter',
      javaFactory: `
        return new foam.lib.json.Outputter(getX())
          .setPropertyPredicate(new foam.lib.StoragePropertyPredicate())
          .setOutputClassNames(getOutputClassNames());
      `
    }
  ],

  methods: [
    {
      name: 'put',
      javaCode: `
        getLine().enqueue(new foam.util.concurrent.AbstractAssembly() {
          String record_ = null;

          public void executeJob() {
            try {
              dao.put_(x, obj);
              record_ = getOutputter().stringify(obj);
            } catch (Throwable t) {
              getLogger().error("Failed to write put entry to journal", t);
            }
          }

          public void endJob(boolean isLast) {
            if ( foam.util.SafetyUtil.isEmpty(record_) ) return;

            try {
              writeComment_(x, obj);
              writePut_(
                x,
                record_,
                getMultiLineOutput() ? "\\n" : "",
                "");

                if ( isLast ) getWriter().flush();
            } catch (Throwable t) {
              getLogger().error("Failed to write put entry to journal", t);
            }
          }
        });

        return obj;
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
