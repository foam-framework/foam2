/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'KeyValueDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: 'DAO that only responds to put/find',
  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.sink.Projection',
    'foam.nanos.fs.File',
    'foam.core.FObject',
    'foam.dao.Sink',
    'foam.mlang.Expr',
    'foam.mlang.sink.Count',
    'java.util.*',
  ],
  methods: [
    {
      name: 'put_',
      javaCode:`
        DAO fileDAO = (DAO) x.get("fileDAO");
        String id = ((File) obj).getId();
        if ( fileDAO.find(id) != null ) {
          throw new RuntimeException("Duplicate entry");
        } else {
          return super.put_(x, obj);
        }
      `
    },
    {
      name: 'remove_',
      code: function(obj) {
        return Promise.resolve(obj);
      },
      javaCode: 'return obj;'
    },
//    {
//      name: 'select_',
//      javaCode: `
//        Sink result = null;
//        if ( ! (((ProxySink) sink).getDelegate() instanceof Projection) ){
//          Expr[] expr = new Expr[]{File.ID, File.FILESIZE, File.MIME_TYPE, File.ADDRESS};
//          Projection projection = new Projection.Builder(x)
//            .setExprs(expr)
//            .build();
////         ((ProxySink) sink).setDelegate(projection);
//         sink = this.getDelegate().select_(x, sink, skip, limit, order, predicate);
//         List<File> files = ((foam.dao.ArraySink)((ProxySink) sink).getDelegate()).getArray();
//         for (var file: files){
//          projection.put(file, foam.dao.MDAO.DetachSelect.instance());
//         }
//          return projection;
////          return sink;
//        }
//        return this.getDelegate().select_(x, sink, skip, limit, order, predicate);
//      `
//    },
    {
      name: 'removeAll_',
      code: function() {
        return Promise.resolve();
      },
      javaCode: '//noop'
    }
  ]
});
