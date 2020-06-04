/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig.drivers',
  name: 'DigHtmlDriver',
  extends: 'foam.nanos.dig.drivers.DigFormatDriver',
  flags: ['java'],

  javaImports: [
    'foam.core.*',
    'foam.dao.DAO',
    'foam.lib.csv.CSVOutputter',
    'foam.lib.json.OutputterMode',
    'foam.nanos.boot.NSpec',
    'foam.nanos.dig.*',
    'foam.nanos.dig.exception.*',
    'foam.nanos.http.*',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.util.SafetyUtil',
    'java.io.PrintWriter',
    'java.util.List',
    'javax.servlet.http.HttpServletResponse'
  ],

  properties: [
    {
      name: 'format',
      value: 'HTML'
    }
  ],

  methods: [
    {
      name: 'parseFObjects',
      javaCode: `
      DigUtil.outputException(x, new UnsupportException.Builder(x).setMessage("HTML put operation is not supported").build(), getFormat());
      return null;
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

      foam.lib.html.Outputter outputterHtml = new foam.lib.html.Outputter(cInfo, OutputterMode.NETWORK);
      outputterHtml.outputStartHtml();
      outputterHtml.outputStartTable();

      for ( int i = 0; i < fobjects.size(); i++ ) {
        if ( i == 0 ) {
          outputterHtml.outputHead( (FObject) fobjects.get(i) );
        }
        outputterHtml.put(fobjects.get(i), null);
      }
      outputterHtml.outputEndTable();
      outputterHtml.outputEndHtml();

      // Output the formatted data
      out.println(outputterHtml.toString());
      `
    }
  ]
});
