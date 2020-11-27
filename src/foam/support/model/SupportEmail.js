/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.support.model',
  name: 'SupportEmail',

  properties:[
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'email'
    },
    {
      class: 'Password',
      name: 'password'
    },
    {
      class: 'String',
      name: 'status',
      value: 'Pending'
    },
    {
      class: 'DateTime',
      name: 'connectedTime'
    }
  ]
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'foam.support.model.SupportEmail',
  forwardName: 'supportEmails',
  inverseName: 'user',
  sourceProperty: { section: 'administrative' }
});
