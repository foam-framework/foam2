/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.dig.drivers;

import foam.core.*;
import foam.dao.DAO;
import foam.lib.csv.CSVOutputter;
import foam.lib.json.OutputterMode;
import foam.nanos.boot.NSpec;
import foam.nanos.dig.*;
import foam.nanos.dig.exception.*;
import foam.nanos.http.*;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.util.SafetyUtil;

import java.io.PrintWriter;
import java.util.List;
import javax.servlet.http.HttpServletResponse;

public class DigJsonJDriver extends DigJsonDriver
{
  public DigJsonJDriver(X x) {
    super(x, Format.JSONJ);
  }

  @Override
  protected List parseFObjects(X x, DAO dao, String data) throws java.lang.Exception {
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
  }

  @Override
  protected void outputFObjects(X x, DAO dao, List fobjects) {
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
  }
}
