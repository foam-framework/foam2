/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'WriteOnlyJDAO',
  extends: 'foam.dao.java.JDAO',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          public WriteOnlyJDAO(foam.core.X x, foam.core.ClassInfo classInfo, String filename) {
            this(x, new foam.dao.NullDAO(), classInfo, filename);
          }

          public WriteOnlyJDAO(foam.core.X x, foam.dao.DAO delegate, foam.core.ClassInfo classInfo, String filename) {
            setX(x);
            setOf(classInfo);
            setDelegate(delegate);

            // create journal
            setJournal(new foam.dao.WriteOnlyF3FileJournal.Builder(x)
              .setFilename(filename)
              .setCreateFile(true)
              .setDao(getDelegate())
              .setLogger(new foam.nanos.logger.PrefixLogger(new Object[] { "[JDAO]", filename }, new foam.nanos.logger.StdoutLogger()))
              .build());
          }
        `);
      }
    }
  ],
});
