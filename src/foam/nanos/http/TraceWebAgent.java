/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.*;
import foam.nanos.http.HttpParameters;
import foam.nanos.logger.Logger;

import java.io.PrintWriter;
import java.util.Enumeration;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

public class TraceWebAgent
  implements WebAgent
{
  public TraceWebAgent() {}

  public void execute(X x) {
    Logger              logger = (Logger) x.get("logger");

    try {
      PrintWriter        out = x.get(PrintWriter.class);
      HttpServletRequest req = x.get(HttpServletRequest.class);
      HttpParameters     params = x.get(HttpParameters.class);

      out.println("<HTML>\n" +
          "<HEAD><TITLE>trace</TITLE></HEAD>\n" +
          "<BODY BGCOLOR=\"#FDF5E6\">\n" +
          "<H1 ALIGN=\"CENTER\">trace</H1>\n" +
          "<B>Request Method: </B>" +
          req.getMethod() + "<BR>\n" +
          "<B>Request URI: </B>" +
          req.getRequestURI() + "<BR>\n" +
          "<B>Request Protocol: </B>" +
          req.getProtocol() + "<BR><BR>\n" +
          "<TABLE BORDER=1 ALIGN=\"CENTER\">\n" +
          "<TR BGCOLOR=\"#FFAD00\">\n" +
          "<TH>Header Name<TH>Header Value");

      Enumeration headerNames = req.getHeaderNames();
      while ( headerNames.hasMoreElements() ) {
        String headerName = (String) headerNames.nextElement();
        out.println("<TR><TD>" + headerName);
        out.println("    <TD>" + req.getHeader(headerName));
      }
      out.println("</TABLE>");

      out.println("<BR>\n" +
                  "<TABLE BORDER=1 ALIGN=\"CENTER\">\n" +
                  "<TR BGCOLOR=\"#FFAD00\">\n" +
                  "<TH>Parameter Name<TH>Parameter Value");
      Enumeration paramNames = req.getParameterNames();
      while ( paramNames.hasMoreElements() ) {
        String paramName = (String) paramNames.nextElement();
        out.println("<TR><TD>" + paramName);
        String[] paramValues = req.getParameterValues(paramName);
        if ( paramValues.length > 1 ) {
          out.println("    <TD>" + String.join(", ", paramValues));
        } else {
          out.println("    <TD>" + paramValues[0]);
        }
      }
      out.println("</TABLE>");

      out.println("<BR>\n" +
                  "<TABLE BORDER=1 ALIGN=\"CENTER\">\n" +
                  "<TR BGCOLOR=\"#FFAD00\">\n" +
                  "<TH>Nanopay Parameter Name<TH>Parameter Value");

      // Nanopay parameters
      if ( params != null ) {
        out.println("<TR><TD>Parameters");
        out.println("    <TD>" + params);
      }
      out.println("</TABLE>");

      out.println("</BODY></HTML>");

      try {
        Cookie[] cookies = req.getCookies();
        for ( Cookie cookie : cookies ) {
          out.println(cookie.toString());
        }
      } catch(NullPointerException e) {
         out.println("cookies are not supported");
      }
    } catch (Throwable t) {
      logger.error(t);
    }
  }
}
