/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'SupportFileTypeDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: ` A fileDAO decorator use to store the file type`,

  javaImports: [
    'foam.core.X',
    'foam.dao.*',
    'foam.nanos.fs.File',
    'foam.nanos.fs.FileType',
    'static foam.mlang.MLang.EQ'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public SupportFileTypeDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
          }  
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      if (!(obj instanceof File)) {
        return super.put_(x, obj);
      }

      File file = (File) obj;
      DAO supportFileTypeDAO = (DAO) x.get("supportFileTypeDAO");
      FileType fileType = (FileType) supportFileTypeDAO.find(
        EQ(FileType.MIME, file.getMimeType())
      );

      // if fileType not store in supportFileTypeDAO, create new one and store it
      if ( fileType == null ) {
        fileType = new FileType.Builder(x)
          .setMime(file.getMimeType())
          .build();
          supportFileTypeDAO.put(fileType);
      }
      return file;
      `
    }
  ]
});