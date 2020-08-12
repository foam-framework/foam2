/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.nanos.auth',
   name: 'Language',

   documentation: 'Language codes.',

   ids: [ 'code' ],

   properties: [
     {
       class: "String",
       name: "code"
     },
     {
       class: "String",
       name: "name"
     },
     {
       class: 'String',
       name: 'flagImage',
       documentation: `The flag image used in relation to currencies from countries currently
         supported by the platform.`,
     },
   ]
 });
