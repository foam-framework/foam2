/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.nanos.export',
   name: 'CSVDriver',
   implements: [ 'foam.nanos.export.ExportDriver' ],
   documentation: 'Class for exporting data from a DAO to CSV',
   methods: [
     function export(X, dao) {
       // TODO: add CSV exporting when ready
       return Promise.resolve();
     }
   ]
 });
