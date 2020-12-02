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
      DAO      fileTypeDAO = (DAO) x.get("fileTypeDAO");
      String   mimeType    = file.getMimeType();
      String   subType     = mimeType.substring(mimeType.indexOf("/") + 1);
      FileType fileType    = (FileType) fileTypeDAO.find(EQ(FileType.SUB_TYPE, subType));

      if ( fileType == null ) {
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
