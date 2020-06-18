/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig.drivers',
  name: 'DigCsvDriver',
  extends: 'foam.nanos.dig.drivers.DigFormatDriver',
  flags: ['java'],

  javaImports: [
    'foam.core.*',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.lib.csv.CSVOutputter',
    'foam.lib.csv.CSVSupport',
    'foam.lib.json.OutputterMode',
    'foam.nanos.boot.NSpec',
    'foam.nanos.dig.*',
    'foam.nanos.dig.exception.*',
    'foam.nanos.http.*',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.util.SafetyUtil',
    'java.io.ByteArrayInputStream',
    'java.io.InputStream',
    'java.io.PrintWriter',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.List',
    'javax.servlet.http.HttpServletResponse'
  ],

  properties: [
    {
      name: 'format',
      value: 'CSV'
    }
  ],

  methods: [
    {
      name: 'parseFObjects',
      javaCode: `
      ArraySink arraySink = new ArraySink();
      InputStream is = new ByteArrayInputStream(data.toString().getBytes());;

      ClassInfo cInfo = dao.getOf();
      CSVSupport csvSupport = new CSVSupport();
      csvSupport.setX(x);
      csvSupport.inputCSV(is, arraySink, cInfo);

      List list = arraySink.getArray();

      if ( list == null || list.size() == 0 ) {
        DigUtil.outputException(x, 
          new ParsingErrorException.Builder(x)
            .setMessage("Invalid CSV Format").build(), 
          getFormat());
        return null;
      }

      return list;
      `
    },
    {
      name: 'outputFObjects',
      javaCode: `
      HttpServletResponse resp = x.get(HttpServletResponse.class);
      PrintWriter out = x.get(PrintWriter.class);
      ClassInfo cInfo = dao.getOf();
      String output = null;
      
      if ( fobjects == null || fobjects.size() == 0 ) {
        out.println("[]");
        return;
      }

      CSVOutputter outputterCsv = new foam.lib.csv.CSVOutputterImpl.Builder(x)
        .setOf(cInfo)
        .build();

      for ( Object o : fobjects ) {
        FObject fobj = (FObject) o;
        outputterCsv.outputFObject(x, fobj);
      }

      // Output the formatted data
      out.println(outputterCsv.toString());
      `
    }
  ]
});
