/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.journal',
  name: 'FileAppendDAO',
  extends: 'foam.dao.AbstractDAO',
  properties: [
    {
      class: 'String',
      name: 'fileName',
    },
    {
      class: 'Object',
      name: 'file',
      javaType: 'java.io.File',
      javaFactory: `
return getX().get(foam.nanos.fs.Storage.class).get(getFileName());
      `
    },
    {
      class: 'Object',
      javaType: 'foam.lib.json.Outputter',
      name: 'outputter',
      javaFactory: `
return new foam.lib.json.Outputter(foam.lib.json.OutputterMode.STORAGE);
      `,
    },
    {
      class: 'Object',
      name: 'writer',
      javaType: 'java.io.BufferedWriter',
      javaFactory: `
try {
  java.io.BufferedWriter writer = new java.io.BufferedWriter(
    new java.io.FileWriter(getFile(), true), 16 * 1024);
  return writer;
} catch ( Throwable t ) {
  throw new RuntimeException(t);
}

      `
    }
  ],
  methods: [
    {
      name: 'select_',
      javaCode: `
try {
  sink = prepareSink(sink);
  foam.dao.Sink decorated = decorateSink_(sink, skip, limit, order, predicate);
  foam.dao.Subscription sub = new foam.dao.Subscription();

  java.io.BufferedReader r = new java.io.BufferedReader(new java.io.FileReader(getFile()));
  foam.lib.json.JSONParser parser = getX().create(foam.lib.json.JSONParser.class);

  for ( String line ; ( line = r.readLine() ) != null ; ) {
    if ( sub.getDetached() ) break;
    decorated.put(parser.parseString(line), sub);
  }
  decorated.eof();

} catch ( Throwable t ) {
  throw new RuntimeException(t);
}
return sink;
      `,
    },
    {
      name: 'find_',
      javaCode: `
throw new RuntimeException();
      `,
    },
    {
      name: 'remove_',
      javaCode: `
throw new RuntimeException();
      `,
    },
    {
      name: 'put_',
      synchronized: true,
      javaCode: `
try {
  java.io.BufferedWriter writer = getWriter();
  writer.write(getOutputter().stringify(obj));
  writer.newLine();
  writer.flush();
  return obj;
} catch ( Throwable t ) {
  throw new RuntimeException(t);
}
      `,
    },
  ],
});
