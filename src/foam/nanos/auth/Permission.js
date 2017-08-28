/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.nanos.auth',
   name: 'Permission',

   documentation: 'A permission represent access to system resources.',

   properties: [
     {
       class: 'String',
       name: 'id'
     },
     {
       class: 'String',
       name: 'description',
       documentation: 'Description of the Group.'
     }
   ]
 });
