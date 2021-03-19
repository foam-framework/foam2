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
  javaGenerateDefaultConstructor: false,

  imports: [
    'translationService'
  ],

  javaImports: [
    'foam.i18n.TranslationService',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.notification.email.EmailTemplateEngine',
    'foam.util.SafetyUtil',
    'java.util.HashMap',
    'java.util.Map',
  ],
  
  messages: [
    {
      name: 'EXCEPTION_MESSAGE',
      message: '{{message_}}'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public FOAMException() {
    getHostname();
  }

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
        `);
      }
    }
  ],

  properties: [
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

  templates: [
    {
      name: 'toMessage',
      template: function() {
      /* <%= translation %> */
      }
    }
  ],

  methods: [
    {
      documentation: 'Override in sub-classes',
      name: 'getTemplateValues',
      type: 'Map',
      javaCode: `
      Map map = new HashMap();
      map.put("message_", getMessage_());
      return map;
      `
    },
    {
      name: 'getMessage',
      type: 'String',
      code: function() {
        return this.toMessage();
      },
      javaCode: `
      String msg = getTranslation();
      if ( ! SafetyUtil.isEmpty(msg) ) {
        EmailTemplateEngine template = new EmailTemplateEngine();
        return template.renderTemplate(foam.core.XLocator.get(), msg, getTemplateValues()).toString();
      }
      return toString();
      `
    },
    {
      name: 'getTranslation',
      type: 'String',
      code: function() {
        return this.translationService.getTranslation(foam.locale, getOwnClassInfo().getId(), EXCEPTION_MESSAGE);
      },
      javaCode: `
      String locale = "pt";
      Subject subject = (foam.nanos.auth.Subject) foam.core.XLocator.get().get("subject");
      if ( subject != null ) {
        User realUser = (User) subject.getRealUser();
        if ( realUser != null ) {
          locale = realUser.getLanguage().getCode().toString();
        }
      }
      TranslationService ts = (TranslationService) foam.core.XLocator.get().get("translationService");
      return ts.getTranslation(locale, getClassInfo().getId(), EXCEPTION_MESSAGE);
      `
    },
    {
      name: 'toString',
      type: 'String',
      code: function() {
        return '['+this.hostname+'],'+this.getOwnClassInfo().getId()+','+EXCEPTION_MESSAGE+','+this.message_;
      },
      javaCode: `
      return "["+getHostname()+"],"+this.getClass().getName()+","+EXCEPTION_MESSAGE+","+getMessage_();
      `
    }
  ]
});
