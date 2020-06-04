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
import java.io.StringReader;
import java.util.List;
import javax.servlet.http.HttpServletResponse;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamReader;

public class DigXmlDriver extends DigFormatDriver
{
  public DigXmlDriver(X x) {
    super(x, Format.XML);
  }

  protected List parseFObjects(X x, DAO dao, String data) throws java.lang.Exception {
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
        format_);
      return null;
    }

    return objList;
  }

  protected void outputFObjects(X x, DAO dao, List fobjects) {
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
  }
}
