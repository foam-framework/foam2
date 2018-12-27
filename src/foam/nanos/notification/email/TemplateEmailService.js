/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'TemplateEmailService',
  extends: 'foam.nanos.notification.email.ProxyEmailService',

  documentation: `
    Processes the EmailMessage such that the placeholders in the template are
    replaced with the appropriate values.
  `,

  javaImports: [
    'foam.util.SafetyUtil',
    'java.nio.charset.StandardCharsets',
    'org.jtwig.environment.EnvironmentConfiguration',
    'org.jtwig.environment.EnvironmentConfigurationBuilder',
    'org.jtwig.JtwigModel',
    'org.jtwig.JtwigTemplate',
    'org.jtwig.resource.loader.TypedResourceLoader'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
            protected EnvironmentConfiguration config_ = null;
          `
        }));
      }
    }
  ],

  methods: [
    {
      name: 'getConfig',
      javaReturns: 'EnvironmentConfiguration',
      args: [
        {
          name: 'group',
          javaType: 'String'
        }
      ],
      javaCode: `
        if ( config_ == null ) {
          config_ = EnvironmentConfigurationBuilder
            .configuration()
            .resources()
              .resourceLoaders()
                .add(new TypedResourceLoader("dao", new DAOResourceLoader(getX(), group)))
              .and()
            .and()
          .build();
        }
        return config_;
      `
    },
    {
      name: 'sendEmailFromTemplate',
      javaCode: `
        String group = user != null ? (String) user.getGroup() : null;
        EmailTemplate emailTemplate = DAOResourceLoader.findTemplate(getX(), name, group);
        
        if ( emailMessage == null ) return;

        for ( String key : templateArgs.keySet() ) {
          Object value = templateArgs.get(key);
          if ( value instanceof String ) {
            String s = (String) value;
            templateArgs.put(key, new String(s.getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8));
          }
        }

        EnvironmentConfiguration config = getConfig(group);
        JtwigModel model = JtwigModel.newModel(templateArgs);
        emailMessage = (EmailMessage) emailMessage.fclone();

        JtwigTemplate templateBody =    JtwigTemplate.inlineTemplate(emailTemplate.getBody(), config);
        emailMessage.setBody(templateBody.render(model));

        // If subject has already provided, then we don't want to use template subject.
        if ( SafetyUtil.isEmpty(emailMessage.getSubject()) ) {
          JtwigTemplate templateSubject = JtwigTemplate.inlineTemplate(emailTemplate.getSubject(), config);
          emailMessage.setSubject(templateSubject.render(model));
        }

        // If the displayName doesn't set in the message and the displayName provided in
        // the template, use the displayName from template.
        if (
          SafetyUtil.isEmpty(emailMessage.getDisplayName()) &&
          ! SafetyUtil.isEmpty(emailTemplate.getDisplayName())
        ) {
          JtwigTemplate templateDisplayName = JtwigTemplate.inlineTemplate(emailTemplate.getDisplayName(), config);
          emailMessage.setDisplayName(templateDisplayName.render(model));
        }

        sendEmail(x, emailMessage);
      `
    }
  ]
});
