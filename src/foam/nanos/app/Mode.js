/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.ENUM({
   package: 'foam.nanos.app',
   name: 'Mode',

   documentation: 'Represents what mode the app is running on.',

   values: [
     { name: 'DEVELOPMENT',  label: 'Development' },
     { name: 'STAGING',      label: 'Staging' },
     { name: 'PRODUCTION',   label: 'Production' },
     { name: 'DEMO',         label: 'Demo' },
     { name: 'TEST',         label: 'Test' }
   ]
 });
