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
   sourceProperty: {
     hidden: true
   }
 });

 foam.RELATIONSHIP({
   cardinality: '*:*',
   sourceModel: 'foam.nanos.auth.User',
   targetModel: 'foam.nanos.auth.Group',
   forwardName: 'groups',
   inverseName: 'users',
   sourceProperty: {
     hidden: true
   }
 });
