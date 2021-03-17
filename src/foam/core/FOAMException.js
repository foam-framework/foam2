/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'FOAMException',
  package: 'foam.core',
  implements: [ 'foam.core.Exception' ],
  javaExtends: 'RuntimeException',
  javaGenerateConvenienceConstructor: false,

  javaImports: [
    'foam.core.X',
    'foam.i18n.TranslationService',
    'foam.nanos.auth.Subject'
  ],
  
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public FOAMException(String message) {
    super(message);
    setMessage_(message);
    getHostname();
  }

  public FOAMException(Throwable cause) {
    super(cause);
    setMessage_(cause.getMessage());
    getHostname();
  }

  public FOAMException(String message, Throwable cause) {
    super(message, cause);
    setMessage_(message);
    getHostname();
  }

  public FOAMException(X x, String message) {
    super(message);
    String translation_message = getTranslation(x, message);
    setMessage_(translation_message);
    getHostname();
  }

  public FOAMException(X x, String message, Throwable cause ) {
    super(message, cause);
    String translation_message = getTranslation(x, message);
    setMessage_(translation_message);
    getHostname();
  }
        `);
      }
    }
  ],

  properties: [
    {
      name: 'javaGenerateConvenienceConstructor',
      value: false,
      transient: true,
      visibility: 'HIDDEN'
    },
    {
      name: 'message_',
      class: 'String',
      visibility: 'RO'
    },
    {
      name: 'hostname',
      class: 'String',
      javaFactory: 'return System.getProperty("hostname", "localhost");',
      visibilty: 'RO'
    }
  ],
  
  methods: [
    {
      name: 'getMessage',
      type: 'String',
      javaCode: `
      String msg = getMessage_();
      if ( foam.util.SafetyUtil.isEmpty(msg) ) {
        return super.getMessage();
      }
      return msg;
      `
    },
    {
      name: 'getTranslation',
      type: 'String',
      args: [
        { name: 'x',      type: 'Context' },
        { name: 'message', type: 'String' },
      ],
      javaCode: `
      TranslationService ts = (TranslationService) foam.core.XLocator.get().get("translationService");
      Subject subject = (foam.nanos.auth.Subject) foam.core.XLocator.get().get("subject");
      if (subject.getRealUser() == null) {
        return message;
      }
      String locale = ((foam.nanos.auth.User) subject.getRealUser()).getLanguage().getCode().toString();
      String t_msg = ts.getTranslation(locale, getClassInfo().getId(), message);
      return t_msg;
      `
    },
    {
      name: 'toString',
      type: 'String',
      javaCode: `
      return "["+getHostname()+"],"+this.getClass().getName()+","+super.getMessage();
      `
    }
  ]
});
