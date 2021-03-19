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
    'foam.core.XLocator',
    'foam.i18n.TranslationService',
    'foam.util.SafetyUtil',
    'java.util.HashMap',
    'java.util.Map'
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
      documentation: 'Override in sub-classes for Java template parameter replacements.',
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
        // REVIEW: temporary - default/simple java template support not yet split out from EmailTemplateEngine.
        foam.nanos.notification.email.EmailTemplateEngine template = new foam.nanos.notification.email.EmailTemplateEngine();
        return template.renderTemplate(XLocator.get(), msg, getTemplateValues()).toString();
      }
      return EXCEPTION_MESSAGE;
      `
    },
    {
      documentation: 'Translate the exception message before template parameter replacement.',
      name: 'getTranslation',
      type: 'String',
      code: function() {
        return this.translationService.getTranslation(foam.locale, getOwnClassInfo().getId(), EXCEPTION_MESSAGE);
      },
      javaCode: `
      String locale = "en";

      // Java (server side) translation will most likely be for API calls, so the caller
      // can specify prefered language via HTTP header parameters.
      // Otherwise we must cross the foam core/nanos barrier to locate a User.
      javax.servlet.http.HttpServletRequest req = XLocator.get().get(javax.servlet.http.HttpServletRequest.class);
      if ( req != null ) {
        String acceptLanguage = req.getHeader("Accept-Language");
        if ( ! SafetyUtil.isEmpty(acceptLanguage) ) {
          String[] languages = acceptLanguage.split(",");
          locale = languages[0];
        }
      }

      TranslationService ts = (TranslationService) XLocator.get().get("translationService");
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
