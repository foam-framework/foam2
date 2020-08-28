/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.flow',
  name: 'DocumentationFolderDAO',
  requires: [
    'foam.flow.Document'
  ],
  javaImports: [
    'foam.nanos.fs.Storage',
    'java.nio.charset.StandardCharsets',
    'java.util.HashSet',
    'java.util.Set',
    'java.io.OutputStream'
  ],
  documentation: 'Loads/stores documentation models from a directory of HTML markup.  Useful for saving and editing documentation in a version control repository.',
  extends: 'foam.dao.AbstractDAO',
  properties: [
    {
      name: 'of',
      javaFactory: 'return foam.flow.Document.getOwnClassInfo();'
    },
    {
      name: 'delegate',
      javaFactory: 'return new foam.dao.MDAO.Builder(getX()).build();'
    },
    {
      class: 'Object',
      name: 'storage',
      javaType: 'foam.nanos.fs.Storage',
      javaFactory: `
return new foam.nanos.fs.FallbackStorage(
  new foam.nanos.fs.FileSystemStorage(System.getProperty("DOCUMENT_HOME")),
  new foam.nanos.fs.ResourceStorage("documents")
);`
    }
  ],
  methods: [
    {
      name: 'select_',
      javaCode: `
Storage storage = getStorage();

sink = prepareSink(sink);

foam.dao.Sink         decorated = decorateSink_(sink, skip, limit, order, predicate);
foam.dao.Subscription sub       = new foam.dao.Subscription();

Set<String> paths = null;
try {
  paths = storage.getAvailableFiles("", "*.flow");
} catch (Throwable t) {
  foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
  logger.warning(t.getMessage());
  paths = new HashSet<String>();
}

for ( String path : paths ) {
  if ( sub.getDetached() ) break;

  foam.flow.Document obj = new foam.flow.Document();
  String id = path.substring(0, path.lastIndexOf(".flow"));

  obj.setId(id);

  // TODO: We could parse the markup on the server to get the embedded title.

  obj.setMarkup(new String(storage.getBytes(path), StandardCharsets.UTF_8));
  decorated.put(obj, sub);
}

decorated.eof();

return sink;`
    },
    {
      name: 'verifyId',
      args: [ { name: 'id', type: 'String' } ],
      javaCode: `
// Very conservative allowable characters to avoid any possible filename shennanigans.

if ( ! id.matches("^[a-zA-Z0-9_-]+$") ) {
  throw new RuntimeException("Invalid primary key, must use only alphanumeric characters, _ and -.");
}
`
    },
    {
      name: 'put_',
      javaCode: `
Storage storage = getStorage();

String id = (String)getPK(obj);
verifyId(id);

OutputStream oStream = storage.getOutputStream(id + ".flow");

if ( oStream == null ) {
  return obj;
}

try {
  oStream.write(((foam.flow.Document)obj).getMarkup().getBytes(StandardCharsets.UTF_8));
} catch ( java.io.IOException e ) {
  throw new RuntimeException(e);
}

return obj;`
    },
    {
      name: 'remove_',
      javaCode: `throw new UnsupportedOperationException("Can't remove on DocumentationFolderDAO");`
    },
    {
      name: 'find_',
      javaCode: `
// TODO: Escape/sanitize file name
verifyId((String)id);

Storage storage = getStorage();
String path = (String)id + ".flow";

foam.flow.Document obj = new foam.flow.Document();
obj.setId((String)id);

// TODO: We could parse the markup on the server to get the embedded title.

obj.setMarkup(new String(storage.getBytes(path), StandardCharsets.UTF_8));

return obj;`
    }
  ]
});
