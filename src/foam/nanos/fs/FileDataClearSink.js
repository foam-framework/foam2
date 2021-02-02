/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'FileDataClearSink',
  extends: 'foam.dao.ProxySink',

  documentation: `Strip File 'data' to support File table views`,

  javaImports: [
    'foam.core.FObject'
  ],

  methods: [
    {
      name: 'put',
      args: [
        {
          name: 'obj',
          type: 'Object'
        },
        {
          name: 'sub',
          type: 'foam.core.Detachable'
        }
      ],
      javaCode: `
      File file = (File) ((FObject) obj).fclone();
      File.DATA.clear(file);
      File.DATA_STRING.clear(file);
      getDelegate().put(file, sub);
      `
    },
    {
      name: 'remove',
      javaCode: `//nop`
    },
    {
      name: 'eof',
      javaCode: `// nop`
    },
    {
      name: 'reset',
      javaCode: `//nop`
    }
  ]
});
