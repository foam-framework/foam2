/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'NotificationProfileDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Populate notification with profile settings, like a template.
The caller only has to know the profile name and does not need to be aware how
the notification will be handled. `,

  implements: [
    'foam.mlang.Expressions'
  ],

  javaImports: [
    'foam.dao.Sink',
    'foam.dao.ArraySink',
    'java.util.List'
  ],

  methods: [
    {
      name: 'put_',
      code: function(x, obj) {
        if ( obj.profile != null ) {
          return this.delegate.where(this.EQ(Notification.PROFILE, obj.profile))
            .limit(1).select().then(function(sink) {
              var profile = obj;
              if ( sink.array.size == 1 ) {
                profile = sink.array[0];
                profile.copyFrom(obj);
                return this.delegate.put_(x, profile);
              } else {
                console.err('Notification profile '+obj.profile+' not found.');
                return obj;
              }
            }).bind(this);
        }
        return this.delegate.put_(x, obj);
      },
      javaCode: `
        Notification notification = (Notification) obj;
        Notification profile = notification;
System.out.println("NotificationProfileDAO profile: "+notification.getProfile());
        if ( notification.getProfile() != null ) {
          Sink sink = getDelegate().where(foam.mlang.MLang.EQ(Notification.PROFILE, notification.getProfile())).select(null);
          List profiles = ((ArraySink) sink).getArray();
          if ( profiles.size() > 1 ) {
            System.err.println("Multiple Notification profiles for "+notification.getProfile()+" found.");
            return notification;
          } else if ( profiles.size() == 1 ) {
            profile = (Notification) profiles.get(0);
            // REVIEW/FIXME: no copyFrom in our java
            profile.setBody(notification.getBody());
          } else {
            System.err.println("Notification profile "+notification.getProfile()+" not found.");
            return notification;
          }
        }
        return getDelegate().put_(x, profile);
      `
    }
  ]
});
