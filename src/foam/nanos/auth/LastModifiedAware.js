/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.nanos.auth',
   name: 'LastModifiedAware',

   properties: [
     {
       class: 'DateTime',
       name: 'lastModified',
       factory: function() { new Date(); }
     }
   ]
 });

 // TODO: create a LastModifiedAwareDAO
