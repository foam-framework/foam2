/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.ENUM({
   package: 'foam.nanos.ruler',
   name: 'ActionResult',

   values: [
     { name: 'PENDING', label: 'Pending' },
     { name: 'CONTINUE', label: 'Continue' },
     { name: 'STOP', label: 'Stop' }
   ]
 });