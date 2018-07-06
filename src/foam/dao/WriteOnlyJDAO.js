/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'WriteOnlyJDAO',
  extends: 'foam.dao.JDAO',
  
  javaImports: [
    'foam.core.ClassInfo',
    'foam.core.FObject',
    'foam.core.X'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          public WriteOnlyJDAO(X x, ClassInfo classInfo, String filename) {
            setX(x);
            setOf(classInfo);
            setDelegate(new foam.dao.NullDAO());

            // create journal
            journal_ = new WriteOnlyFileJournal.Builder(getX())
              .setFilename(filename)
              .setCreateFile(true)
              .setDao(new foam.dao.NullDAO())
              .setLogger(new foam.nanos.logger.StdoutLogger())
              .build();
          }
        `);
      }
    }
  ],
});
