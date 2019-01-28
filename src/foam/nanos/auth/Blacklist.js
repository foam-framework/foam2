/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.nanos.auth',
   name: 'Blacklist',
   extends: 'foam.nanos.auth.Group',

   documentation: 'Blacklist entity associated to a users group',

   properties: [
     {
       class: 'Long',
       name: 'id',
       documentation: 'Blacklist Id'
     },
     {
       class: 'String',
       name: 'name',
       documentation: 'Name of blacklist permission'
     }
   ]
 });
