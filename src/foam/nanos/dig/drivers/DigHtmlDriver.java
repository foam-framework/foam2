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

public class DigHtmlDriver extends DigFormatDriver
{
  public DigHtmlDriver(X x) {
    super(x, Format.HTML);
  }

  protected List parseFObjects(X x, DAO dao, String data) throws java.lang.Exception {
    DigUtil.outputException(x, new UnsupportException.Builder(x).setMessage("HTML put operation is not supported").build(), format_);
    return null;
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
  }
}
