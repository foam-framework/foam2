/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.RELATIONSHIP({
  cardinality: '*:*',
  sourceModel: 'foam.nanos.auth.Group',
  targetModel: 'foam.nanos.auth.Permission',
  forwardName: 'permissions',
  inverseName: 'groups',
  junctionDAOKey: 'groupPermissionJunctionDAO'
});

/*
foam.RELATIONSHIP({
  cardinality: '*:*',
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'foam.nanos.auth.Group',
  forwardName: 'groups',
  inverseName: 'users',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    hidden: true
  }
});
*/

foam.RELATIONSHIP({
  cardinality: '1:*',
  sourceModel: 'foam.nanos.auth.UserUserJunction',
  targetModel: 'foam.nanos.notification.NotificationSetting',
  forwardName: 'notificationSettingsForUserUsers',
  inverseName: 'userJunction',
  sourceProperty: {
    hidden: true
  },
  targetDAOKey: 'notificationSettingDAO',
  unauthorizedTargetDAOKey: 'localNotificationSettingDAO'
});

foam.RELATIONSHIP({
  cardinality: '1:*',
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'foam.nanos.notification.NotificationSetting',
  forwardName: 'notificationSettings',
  inverseName: 'owner',
  sourceProperty: {
    hidden: true
  },
  targetDAOKey: 'notificationSettingDAO',
  unauthorizedTargetDAOKey: 'localNotificationSettingDAO'
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'foam.nanos.approval.ApprovalRequest',
  forwardName: 'approvalRequests',
  inverseName: 'entityId',
  cardinality: '1:*',
  sourceDAOKey: 'userDAO',
  unauthorizedSourceDAOKey: 'localUserDAO',
  targetDAOKey: 'approvalRequestDAO',
  targetProperty: {
    visibility: function(entityId) {
      return entityId ?
        foam.u2.DisplayMode.RO :
        foam.u2.DisplayMode.HIDDEN;
    }
  },
  sourceProperty: {
    readPermissionRequired: true,
    section: 'administrative',
    visibility: function(approvalRequests) {
      return approvalRequests ?
        foam.u2.DisplayMode.RO :
        foam.u2.DisplayMode.HIDDEN;
    }
  }
});
