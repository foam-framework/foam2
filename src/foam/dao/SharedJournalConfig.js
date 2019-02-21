foam.CLASS({
  package: 'foam.dao',
  name: 'SharedJournalConfig',
  documentation: 'Configuration information for sharing a journal across multiple DAOs',
  properties: [
    {
      class: 'String',
      name: 'filename'
    },
    {
      class: 'Int',
      name: 'bufferSize',
      value: 16 * 1024
    },
    {
      class: 'Object',
      name: 'lock',
      transient: true,
      javaType: 'java.util.concurrent.locks.Lock',
      javaFactory: 'return new java.util.concurrent.locks.ReentrantLock();'
    },
    {
      class: 'Object',
      name: 'file',
      transient: true,
      javaType: 'java.io.File',
      javaFactory: `
        try {
          java.io.File file = getX().get(foam.nanos.fs.Storage.class).get(getFilename());
          if ( ! file.exists() ) {
            // if output journal does not exist, create one
            java.io.File dir = file.getAbsoluteFile().getParentFile();
            if ( ! dir.exists() ) {
              dir.mkdirs();
            }
            file.getAbsoluteFile().createNewFile();
          }
          return file;
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
     `
    },
    {
      class: 'Object',
      name: 'writer',
      transient: true,
      javaType: 'java.io.Writer',
      javaFactory: `
        try {
          return new java.io.BufferedWriter(new java.io.FileWriter(getFile(), true), getBufferSize());
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    }
  ],
  methods: [
    {
      name: 'makeFileJournal',
      documentation: 'Convenience method to build a FileJournal that writes to the shared log.',
      type: 'foam.dao.Journal',
      args: [
        { name: 'name', type: 'String', documentation: 'Should be unique amongst all journals that will write to the same log.' }
      ],
      javaCode: `return new foam.dao.FileJournal.Builder(getX()).
  setFile(getFile()).
  setFilename(getFilename()). // should only used for logging purposes
  setLock(getLock()).
  setWriter(getWriter()).
  setPrefix(name + ".").
  build();
`
    }
  ]
});
