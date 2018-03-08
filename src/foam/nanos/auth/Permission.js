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
       name: 'id',
       tableWidth: 400
     },
     {
       class: 'String',
       name: 'description',
       documentation: 'Description of the Group.'
     }
   ],

   methods: [
     function implies(permissionId) {
       if ( this.id.endsWith('*') ) {
         var prefix = this.id.substring(0, this.id.length-1);

         // Check that is a valid permission string (should be done as a property validator)
         if ( prefix.length && ! prefix.endsWith('.') ) return false;

         return permissionId.startsWith(prefix);
       }

       return permissionId == this.id;
     }
   ]
 });
