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

  messages: [
    {
      name: 'EXCEPTION_MESSAGE',
      message: '{{message_}}'
    },
  ],

  properties: [
    {
      name: 'message_',
      class: 'String',
      visibility: 'RO'
    },
    {
      documentation: 'java message template',
      name: 'javaExceptionMessage',
      class: 'String',
      value: '{{message_}}',
      transient: true
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
    try {
System.out.println("FOAMException,translation-before,"+getJavaExceptionMessage());
      String msg = getTranslation();
System.out.println("FOAMException,translation-after,"+msg);
      if ( ! SafetyUtil.isEmpty(msg) ) {
        // REVIEW: temporary - default/simple java template support not yet split out from EmailTemplateEngine.
        foam.nanos.notification.email.EmailTemplateEngine template = new foam.nanos.notification.email.EmailTemplateEngine();
        msg = template.renderTemplate(XLocator.get(), msg, getTemplateValues()).toString().trim();
System.out.println("FOAMException,templated,"+msg);
        return msg;
      }
    } catch (NullPointerException e) {
      // REVIEW: XLocator.get().get(...) NPE in test mode.
      System.out.println("FOAMException,XLocator,null");
    }
    return getJavaExceptionMessage();
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
      String locale = (String) XLocator.get().get("locale.language");
      if ( SafetyUtil.isEmpty(locale) ) {
        locale = "en";
      }
      TranslationService ts = (TranslationService) XLocator.get().get("translationService");
      return ts.getTranslation(locale, getClassInfo().getId(), getJavaExceptionMessage());
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
        if ( ! prop.getNetworkTransient() ) {
          Object value = prop.get(this);
          if ( value != null ) {
            map.put(prop.getName(), String.valueOf(value));
          }
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
