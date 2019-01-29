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
       class: 'String',
       name: 'id',
       tableWidth: 400
     },
     {
       class: 'String',
       name: 'description',
       documentation: 'Description of the Blacklist'
     }
   ]
 });
