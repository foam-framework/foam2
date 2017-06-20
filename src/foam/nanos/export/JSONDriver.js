/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.nanos.export',
   name: 'JSONDriver',
   implements: [ 'foam.nanos.export.ExportDriver' ],

   properties: [
     {
       class: 'FObjectProperty',
       of: 'foam.json.Outputer',
       name: 'outputer',
       factory: function() { return foam.json.PrettyStrict; }
     }
   ],

   methods: [
     function exportDAO(X, dao) {
       return dao.select().then(function (sink) {
         return outputer.stringify(sink.array);
       });
     }
   ]
 });
