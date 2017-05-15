/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.nanos.auth',
   name: 'Region',

   documentation: 'Region (province/state) information.',

   ids: [ 'countryId', 'code' ],

   properties: [
     {
       class: 'String',
       name: 'countryId'
     },
     {
       class: 'String',
       name: 'code'
     },
     {
       class: 'String',
       name: 'name'
     }
   ]
 });
