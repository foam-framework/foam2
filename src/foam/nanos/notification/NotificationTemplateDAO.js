/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'NotificationTemplateDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Populate notification with template values.
The caller only has to know the template name and does not need to be aware how
the notification will be handled. `,

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'notificationTemplateDAO'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'java.util.List'
  ],

  methods: [
    {
      name: 'put_',
      code: function(x, obj) {
        if ( obj.template != null && '' != obj.template ) {
          return this.notificationTemplateDAO.where(this.EQ(Notification.TEMPLATE, obj.template))
            .select().then(function(sink) {
              var template = obj;
              if ( sink.array.size == 1 ) {
                template = sink.array[0];
                template.copyFrom(obj);
                return this.delegate.put_(x, template);
              } else {
                console.err('Notification template '+obj.template+' not found.');
                return obj;
              }
            }).bind(this);
        }
        return this.delegate.put_(x, obj);
      },
      javaCode: `
        Logger logger = (Logger) x.get("logger");  
        Notification notification = (Notification) obj;
        Notification template = notification;

        if ( ! foam.util.SafetyUtil.isEmpty(notification.getTemplate()) ) {
          List templates = ((ArraySink) ((DAO) x.get("notificationTemplateDAO"))
            .where(foam.mlang.MLang.EQ(Notification.TEMPLATE, notification.getTemplate()))
            .select(new ArraySink()))
            .getArray();

          if ( templates.size() > 1 ) {
            logger.error("Multiple Notification templates for " + notification.getTemplate() + " found.");
            return notification;
          } else if ( templates.size() == 1 ) {
            template = (Notification) ((FObject)templates.get(0)).fclone();
            template.setId(notification.getId());
            template.setBody(notification.getBody());
            template.setRead(notification.getRead());
            template.clearTemplate();

            // Notify a user directly
            DAO userDAO = (DAO) x.get("localUserDAO");
            User user = (User) userDAO.find(template.getUserId());
            if ( user != null ) {
              user.doNotify(x, template);
              return notification;
            }
          } else {
            logger.error("Notification template " + notification.getTemplate() + " not found.");
            return notification;
          }
        }

        return getDelegate().put_(x, template);
      `
    }
  ]
});
