/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig.drivers',
  name: 'DigJsonDriver',
  extends: 'foam.nanos.dig.drivers.DigFormatDriver',
  flags: ['java'],

  javaImports: [
    'foam.core.*',
    'foam.dao.DAO',
    'foam.lib.csv.CSVOutputter',
    'foam.lib.json.OutputterMode',
    'foam.lib.json.JSONParser',
    'foam.nanos.boot.NSpec',
    'foam.nanos.dig.*',
    'foam.nanos.dig.exception.*',
    'foam.nanos.http.*',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.util.SafetyUtil',
    'java.io.PrintWriter',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.List',
    'javax.servlet.http.HttpServletResponse'
  ],

  properties: [
    {
      name: 'format',
      value: 'JSON'
    }
  ],

  methods: [
    {
      name: 'parseFObjects',
      javaCode: `
      JSONParser jsonParser = new JSONParser();
      jsonParser.setX(x);

      // Attempt to parse array
      ClassInfo cInfo = dao.getOf();
      Object o = jsonParser.parseStringForArray(data, cInfo.getObjClass());

      // Attempt to parse single object
      if ( o == null )
        o = jsonParser.parseString(data, cInfo.getObjClass());

      if ( o == null ) {
        DigUtil.outputException(x, 
          new ParsingErrorException.Builder(x)
            .setMessage("Invalid JSON Format").build(), 
          getFormat());
        return null;
      }

      List list = null;
      if ( o instanceof Object[] ) {
        Object[] objs = (Object[]) o;
        list = Arrays.asList(objs);
      } else {
        list = new ArrayList();
        list.add(o);
      }

      return list;
      `
    },
    {
      name: 'outputFObjects',
      javaCode: `
      PrintWriter out = x.get(PrintWriter.class);
      ClassInfo cInfo = dao.getOf();
      String output = null;
      
      if ( fobjects == null || fobjects.size() == 0 ) {
        out.println("[]");
        return;
      }

      foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(x)
        .setPropertyPredicate(
          new foam.lib.AndPropertyPredicate(x, 
            new foam.lib.PropertyPredicate[] {
              new foam.lib.NetworkPropertyPredicate(), 
              new foam.lib.PermissionedPropertyPredicate()}));

      outputterJson.setOutputDefaultValues(true);
      outputterJson.setOutputClassNames(true);
      outputterJson.setMultiLine(true);

      if ( fobjects.size() == 1 )
        outputterJson.output(fobjects.get(0));
      else
        outputterJson.output(fobjects.toArray());
      
      // Output the formatted data
      out.println(outputterJson.toString());
      `
    }
  ]
});
