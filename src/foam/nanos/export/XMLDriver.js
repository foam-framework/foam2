/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.nanos.export',
   name: 'XMLDriver',
   implements: [ 'foam.nanos.export.ExportDriver' ],
   documentation: 'Class for exporting data from a DAO to XML',
   
   properties: [
     {
       class: 'FObjectProperty',
       of: 'foam.xml.Outputter',
       name: 'outputter',
       factory: function() { return foam.xml.Compact; }
     }
   ],
   
   methods: [
     function exportDAO(X, dao) {
       return dao.select().then(function (sink) {
         return outputter.stringify(sink.array);
       });
     }
   ]
 });
