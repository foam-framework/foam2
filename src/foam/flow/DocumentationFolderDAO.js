foam.CLASS({
  package: 'foam.flow',
  name: 'DocumentationFolderDAO',
  requires: [
    'foam.flow.Document'
  ],
  documentation: 'Loads/stores documentation models from a directory of HTML markup.  Useful for saving and editing documentation in a version control repository.',
  extends: 'foam.dao.AbstractDAO',
  properties: [
    {
      class: 'String',
      name: 'dir'
    },
    {
      name: 'of',
      javaFactory: 'return foam.flow.Document.getOwnClassInfo();'
    },
    {
      name: 'delegate',
      javaFactory: 'return new foam.dao.MDAO.Builder(getX()).build();'
    }
  ],
  methods: [
    {
      name: 'select_',
      javaCode: `
sink = prepareSink(sink);

foam.dao.Sink         decorated = decorateSink_(sink, skip, limit, order, predicate);
foam.dao.Subscription sub       = new foam.dao.Subscription();

java.nio.file.FileSystem fs = java.nio.file.FileSystems.getDefault();
java.nio.file.DirectoryStream<java.nio.file.Path> contents;

try {
  contents = java.nio.file.Files.newDirectoryStream(fs.getPath(getDir()), "*.flow");
} catch ( java.io.IOException e ) {
  throw new RuntimeException(e);
}

for ( java.nio.file.Path path : contents ) {
  if ( sub.getDetached() ) break;


  foam.flow.Document obj = new foam.flow.Document();
  String id = path.getFileName().toString().substring(0, path.getFileName().toString().lastIndexOf(".flow"));

  obj.setId(id);

  // TODO: We could parse the markup on the server to get the embedded title.

  try {
    byte[] data = java.nio.file.Files.readAllBytes(path);
    obj.setMarkup(new String(data, java.nio.charset.Charset.forName("UTF-8")));
    decorated.put(obj, sub);
  } catch(java.io.IOException e) {
    e.printStackTrace();
  }
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
verifyId(((String)getPK(obj)));

java.nio.file.FileSystem fs = java.nio.file.FileSystems.getDefault();

try {
  java.nio.file.Path path = fs.getPath(getDir(), ((String)getPK(obj)) + ".flow");
  java.nio.file.Files.write(path, ((foam.flow.Document)obj).getMarkup().getBytes(java.nio.charset.Charset.forName("UTF-8")));
} catch ( java.io.IOException e ) {
  throw new RuntimeException(e);
}

return obj;`
    },
    {
      name: 'remove_',
      javaCode: `java.nio.file.FileSystem fs = java.nio.file.FileSystems.getDefault();
java.nio.file.Path path = fs.getPath(getDir(), ((String)getPK(obj)) + ".flow");
try {
  java.nio.file.Files.deleteIfExists(path);
} catch ( java.io.IOException e ) {
  throw new RuntimeException(e);
}

return obj;`
    },
    {
      name: 'find_',
      javaCode: `// TODO: Escape/sanitize file name
verifyId((String)id);

java.nio.file.FileSystem fs = java.nio.file.FileSystems.getDefault();
java.nio.file.Path path = fs.getPath(getDir(), ((String)id) + ".flow");
if ( ! java.nio.file.Files.isReadable(path) ) return null;

foam.flow.Document obj = new foam.flow.Document();
obj.setId((String)id);

// TODO: We could parse the markup on the server to get the embedded title.

try {
  byte[] data = java.nio.file.Files.readAllBytes(path);
  obj.setMarkup(new String(data, java.nio.charset.Charset.forName("UTF-8")));
} catch(java.io.IOException e) {
  e.printStackTrace();
  return null;
}


return obj;`
    }
  ]
});
