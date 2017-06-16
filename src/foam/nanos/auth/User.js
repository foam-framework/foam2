/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.nanos.auth',
   name: 'User',

   implements: [
     'foam.nanos.auth.EnabledAware',
     'foam.nanos.auth.LastModifiedAware',
     'foam.nanos.auth.LastModifiedByAware'
   ],

   documentation: '',

   tableColumns: [
     'id', 'enabled', 'firstName', 'lastName', 'organization', 'lastModified'
   ],

   properties: [
     {
       class: 'String',
       name: 'id',
       displayWidth: 30,
       width: 100
     },
     {
       class: 'String',
       // class: 'SPID',
       label: 'Service Provider',
       name: 'spid',
       documentation: "User's service provider."
     },
     {
       class: 'DateTime',
       name: 'lastLogin'
     },
     {
       class: 'String',
       name: 'firstName'
     },
     {
       class: 'String',
       name: 'middleName'
     },
     {
       class: 'String',
       name: 'lastName'
     },
     {
       class: 'String',
       name: 'organization'
     },
     {
       class: 'String',
       name: 'department'
     },
     {
       class: 'String',
       // class: 'Email',
       name: 'email'
     },
     {
       class: 'String',
       // class: 'Phone',
       name: 'phone'
     },
     {
       class: 'String',
       // class: 'Phone',
       name: 'mobile'
     },
     {
       class: 'Reference',
       name: 'language',
       of: 'foam.nanos.auth.Language',
       value: 'en'
     },
     {
       class: 'String',
       name: 'timeZone'
       // TODO: create custom view or DAO
     },
     {
       class: 'Password',
       name: 'password',
       displayWidth: 30,
       width: 100
     },
     {
       class: 'Password',
       name: 'previousPassword',
       displayWidth: 30,
       width: 100
     },
     {
       class: 'DateTime',
       name: 'passwordLastModified'
     },
     // TODO: startDate, endDate,
     // TODO: do we want to replace 'note' with a simple ticket system?
     {
       class: 'String',
       name: 'note',
       displayWidth: 70,
       displayHeight: 10
     }
   ]
 });
