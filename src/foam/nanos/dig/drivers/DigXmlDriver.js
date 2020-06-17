/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig.drivers',
  name: 'DigXmlDriver',
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
    'java.io.StringReader',
    'java.util.List',
    'javax.servlet.http.HttpServletResponse',
    'javax.xml.stream.XMLInputFactory',
    'javax.xml.stream.XMLStreamReader'
  ],

  properties: [
    {
      name: 'format',
      value: 'XML'
    }
  ],

  methods: [
    {
      name: 'parseFObjects',
      javaCode: `
      StringReader reader = new StringReader(data);
      XMLSupport xmlSupport = new XMLSupport();
      
      XMLInputFactory factory = XMLInputFactory.newInstance();
      factory.setProperty(XMLInputFactory.SUPPORT_DTD, false);

      ClassInfo cInfo = dao.getOf();
      List<FObject> objList = xmlSupport.fromXML(x, factory.createXMLStreamReader(reader), cInfo.getObjClass());

      if ( objList.size() == 0 ) {
        DigUtil.outputException(x, 
          new ParsingErrorException.Builder(x)
            .setMessage("Invalid XML Format").build(), 
          getFormat());
        return null;
      }

      return objList;
      `
    },
    {
      name: 'outputFObjects',
      javaCode: `
      HttpServletResponse resp = x.get(HttpServletResponse.class);
      PrintWriter out = x.get(PrintWriter.class);
      ClassInfo cInfo = dao.getOf();
      
      if ( fobjects == null || fobjects.size() == 0 ) {
        resp.setContentType("text/html");
        out.println("[]");
        return;
      }

      resp.setContentType("application/xml");

      foam.lib.xml.Outputter outputterXml = new foam.lib.xml.Outputter(OutputterMode.NETWORK);
      outputterXml.output(fobjects.toArray());

      String simpleName = cInfo.getObjClass().getSimpleName().toString();
      String output = "<" + simpleName + "s>"+ outputterXml.toString() + "</" + simpleName + "s>";

      // Output the formatted data
      out.println(output);
      `
    }
  ]
});
