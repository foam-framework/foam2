/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.dig.drivers;

import foam.core.*;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.lib.csv.CSVOutputter;
import foam.lib.csv.CSVSupport;
import foam.lib.json.OutputterMode;
import foam.nanos.boot.NSpec;
import foam.nanos.dig.*;
import foam.nanos.dig.exception.*;
import foam.nanos.http.*;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.util.SafetyUtil;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import javax.servlet.http.HttpServletResponse;

public class DigCsvDriver extends DigFormatDriver
{
  public DigCsvDriver(X x) {
    super(x, Format.CSV);
  }

  protected List parseFObjects(X x, DAO dao, String data) throws java.lang.Exception {
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
        format_);
      return null;
    }

    return list;
  }

  protected void outputFObjects(X x, DAO dao, List fobjects) {
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
  }
}
