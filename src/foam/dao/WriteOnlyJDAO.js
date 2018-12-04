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
            setX(x);
            setOf(classInfo);
            setDelegate(new foam.dao.NullDAO());

            // create journal
            setJournal(new foam.dao.WriteOnlyFileJournal.Builder(x)
              .setFilename(filename)
              .setCreateFile(true)
              .setDao(new foam.dao.NullDAO())
              .setLogger(new foam.nanos.logger.StdoutLogger())
              .build());
          }
        `);
      }
    }
  ],
});
