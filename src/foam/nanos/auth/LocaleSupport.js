/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'LocaleSupport',

  documentation: 'Support methods for Locales',

  javaImports: [
    'foam.nanos.auth.LanguageId',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'javax.servlet.http.HttpServletRequest'
  ],

  axioms: [
    foam.pattern.Singleton.create(),
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  private final static LocaleSupport instance__ = new LocaleSupport();
  public static LocaleSupport instance() { return instance__; }
          `
        }));
      }
    }
  ],

  methods: [
    {
      documentation: 'Attempt to determine a language locale',
      name: 'findLanguageLocale',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'String',
      javaCode: `
      // User
      Subject subject = (Subject) x.get("subject");
      if ( subject != null ) {
        User user = subject.getRealUser();
        if ( user != null ) {
          user.getLanguage().getCode();
        }
      }

      // HttpRequest Header
      HttpServletRequest req = x.get(HttpServletRequest.class);
      if ( req != null ) {
        String acceptLanguage = req.getHeader("Accept-Language");
        if ( ! SafetyUtil.isEmpty(acceptLanguage) ) {
          String[] languages = acceptLanguage.split(",");
          return languages[0];
        }
      }

      return "en";
      `
    }
  ]
});
