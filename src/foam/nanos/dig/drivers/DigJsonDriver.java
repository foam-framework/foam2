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
import foam.lib.json.JSONParser;
import foam.nanos.boot.NSpec;
import foam.nanos.dig.*;
import foam.nanos.dig.exception.*;
import foam.nanos.http.*;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.util.SafetyUtil;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import javax.servlet.http.HttpServletResponse;

public class DigJsonDriver extends DigFormatDriver
{
  public DigJsonDriver(X x) {
    super(x, Format.JSON);
  }

  protected DigJsonDriver(X x, Format format) {
    super(x, format);
  }

  protected List parseFObjects(X x, DAO dao, String data) throws java.lang.Exception {
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
        format_);
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
  }

  protected void outputFObjects(X x, DAO dao, List fobjects) {
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
  }
}
