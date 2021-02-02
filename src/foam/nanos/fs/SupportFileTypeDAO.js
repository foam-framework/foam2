/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'SupportFileTypeDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: 'A fileDAO decorator use to store the file type',

  javaImports: [
    'foam.comics.v2.userfeedback.UserFeedback',
    'foam.comics.v2.userfeedback.UserFeedbackException',
    'foam.comics.v2.userfeedback.UserFeedbackStatus',
    'foam.core.X',
    'foam.dao.*',
    'foam.nanos.fs.File',
    'foam.nanos.fs.FileType',
    'static foam.mlang.MLang.AND',
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

  messages: [
    { name: 'FILE_TYPE_NOT_SUPPORT', message: 'File type not supported' }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      if ( ! (obj instanceof File) ) {
        return obj;
      }

      File     file        = (File) obj;
      DAO     fileTypeDAO = (DAO) x.get("fileTypeDAO");
      FileType fileType = (FileType) fileTypeDAO.find(file.getMimeType());
      if ( fileType == null ) {
        String[] parts = file.getMimeType().split("/");
        if ( parts.length > 1 ) {
          fileType = (FileType) fileTypeDAO.find(
                        AND(
                          EQ(FileType.TYPE, parts[0]),
                          EQ(FileType.SUB_TYPE, parts[1])
                        ));
          if ( fileType != null ) {
            file.setMimeType(fileType.getId());
          }
        }
      }

      if ( fileType == null ) {
        ((foam.nanos.logger.Logger) x.get("logger")).warning("FileType not support", file.getMimeType());

        throw new UserFeedbackException.Builder(x)
          .setUserFeedback(new UserFeedback.Builder(x)
          .setStatus(UserFeedbackStatus.ERROR)
          .setMessage(FILE_TYPE_NOT_SUPPORT)
          .build()
        ).build();
      }

      return super.put_(x, obj);
      `
    }
  ]
});
