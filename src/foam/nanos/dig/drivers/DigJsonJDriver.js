/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig.drivers',
  name: 'DigJsonJDriver',
  extends: 'foam.nanos.dig.drivers.DigJsonDriver',
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
      value: 'JSONJ'
    }
  ],

  methods: [
    {
      name: 'parseFObjects',
      javaCode: `
      String dataJson = "[";
      String dataJsonJ[] = data.split("\\r?\\n");
      for (String i:dataJsonJ){
        i = i.trim();
        if (i.startsWith("p(")) {
          dataJson += i.substring(2, i.length()-1) + ',';
        }
      }
      dataJson += "]";

      return super.parseFObjects(x, dao, dataJson);
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

      foam.lib.json.Outputter outputterJsonJ = new foam.lib.json.Outputter(x)
        .setPropertyPredicate(
          new foam.lib.AndPropertyPredicate(x, 
            new foam.lib.PropertyPredicate[] {
              new foam.lib.NetworkPropertyPredicate(), 
              new foam.lib.PermissionedPropertyPredicate()}));

      outputterJsonJ.setMultiLine(true);

      if ( fobjects.size() == 1 )
        outputterJsonJ.outputJSONJFObject((FObject) fobjects.get(0));
      else
      {
        for (Object obj : fobjects) {
          FObject fobj = (FObject) obj;
          outputterJsonJ.outputJSONJFObject(fobj);
        }
      }

      // Output the formatted data
      out.println(outputterJsonJ.toString());
      `
    }
  ]
});
