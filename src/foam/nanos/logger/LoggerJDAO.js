/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'LoggerJDAO',
  extends: 'foam.dao.java.JDAO',

  documentation: `Only write to underlying JDAO if not PRODUCTION mode`,
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          public LoggerJDAO(foam.core.X x, foam.dao.DAO delegate, foam.core.ClassInfo classInfo, String filename) {
            setX(x);
            setOf(classInfo);
            setDelegate(delegate);

            // create journal
            setJournal(new foam.nanos.logger.LoggerJournal.Builder(x)
              .setFilename(filename)
              .setCreateFile(true)
              .setDao(getDelegate())
              .setLogger(new foam.nanos.logger.PrefixLogger(new Object[] { "[JDAO]", filename }, new foam.nanos.logger.StdoutLogger()))
              .build());
          }
        `);
      }
    }
  ]
});
