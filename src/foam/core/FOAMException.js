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
      name: 'getMessage',
      type: 'String',
      code: function() {
        return this.toMessage();
      },
      javaCode: `
      String msg = getTranslation();
System.out.println("FOAMException,msg,translation,"+msg);
      if ( ! SafetyUtil.isEmpty(msg) ) {
        // REVIEW: temporary - default/simple java template support not yet split out from EmailTemplateEngine.
        foam.nanos.notification.email.EmailTemplateEngine template = new foam.nanos.notification.email.EmailTemplateEngine();
        msg = template.renderTemplate(XLocator.get(), msg, getTemplateValues()).toString().trim();
System.out.println("FOAMException,msg,templated,"+msg);
        return msg;
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
    try {
      String locale = (String) XLocator.get().get("locale.language");
      if ( SafetyUtil.isEmpty(locale) ) {
        locale = "en";
      }
      TranslationService ts = (TranslationService) XLocator.get().get("translationService");
      return ts.getTranslation(locale, getClassInfo().getId(), EXCEPTION_MESSAGE);
    } catch (NullPointerException e) {
System.err.println("FOAMException,XLocator.get,null");
      // REVIEW: XLocator.get().get(...) NPE in test mode.
    }
    return null;
      `
    },
    {
      documentation: 'Build map of template parameter replacements',
      name: 'getTemplateValues',
      type: 'Map',
      javaCode: `
      Map map = new HashMap();
      var props = getClassInfo().getAxiomsByClass(foam.core.PropertyInfo.class);
      var i     = props.iterator();
      while ( i.hasNext() ) {
        foam.core.PropertyInfo prop = i.next();
        Object value = prop.get(this);
        if ( value != null ) {
          map.put(prop.getName(), String.valueOf(value));
        }
      }
      return map;
      `
    },
    {
      name: 'toString',
      type: 'String',
      code: function() {
        return '['+this.hostname+'],'+this.getOwnClassInfo().getId()+','+getMessage();
      },
      javaCode: `
      return "["+getHostname()+"],"+this.getClass().getName()+","+getMessage();
      `
    }
  ]
});
