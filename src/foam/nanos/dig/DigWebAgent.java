/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.dig;

import foam.core.ClassInfo;
import foam.core.Detachable;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.ProxyX;
import foam.core.EmptyX;
import foam.core.X;
import foam.core.XMLSupport;
import foam.dao.AbstractSink;
import foam.dao.ArraySink;
import foam.dao.AuthenticatedDAO;
import foam.dao.DAO;
import foam.lib.csv.*;
import foam.lib.json.*;
import foam.lib.parse.ErrorReportingPStream;
import foam.lib.parse.PStream;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ParserContextImpl;
import foam.lib.parse.StringPStream;
import foam.mlang.predicate.Nary;
import foam.mlang.predicate.Predicate;
import foam.nanos.boot.NSpec;
import foam.nanos.http.Command;
import foam.nanos.http.Format;
import foam.nanos.http.WebAgent;
import foam.nanos.http.HttpParameters;
import foam.nanos.http.WebAgentQueryParser;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import foam.nanos.pm.PM;
import foam.util.SafetyUtil;
import java.io.*;
import java.nio.CharBuffer;
import java.util.Iterator;
import java.util.List;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamReader;

public class DigWebAgent
  implements WebAgent
{
  public DigWebAgent() {}

  public void execute(X x) {
    Logger              logger   = (Logger) x.get("logger");
    HttpServletResponse resp     = x.get(HttpServletResponse.class);
    HttpParameters      p        = x.get(HttpParameters.class);
    final PrintWriter   out      = x.get(PrintWriter.class);
    CharBuffer          buffer_  = CharBuffer.allocate(65535);
    String              data     = p.getParameter("data");
    String              daoName  = p.getParameter("dao");
    Command             command  = (Command) p.get(Command.class);
    Format              format   = (Format) p.get(Format.class);
    String              id       = p.getParameter("id");
    String              q        = p.getParameter("q");
    DAO                 nSpecDAO = (DAO) x.get("AuthenticatedNSpecDAO");
    String[]            email    = p.getParameterValues("email");
    boolean             emailSet = email != null && email.length > 0 && ! SafetyUtil.isEmpty(email[0]);
    String              subject  = p.getParameter("subject");

    //
    // FIXME/TODO: ensuring XML and CSV flows return proper response objects and codes has not been completed since the switch to HttpParameters.
    //
    PM pm = new PM(getClass(), command.getName()+'/'+format.getName());

    logger = new PrefixLogger(new Object[] { this.getClass().getSimpleName() }, logger);
    try {
      if ( SafetyUtil.isEmpty(daoName) ) {
        resp.setContentType("text/html");
        outputPage(x);
        // FIXME: Presently the dig UI doesn't have any way to submit/send a request.
        //   String url = "/#dig";
        //   try {
        //     resp.sendRedirect(url);
        //   } catch ( java.io.IOException e ) {
        //     logger.error("Failed to redirect to", url, e);
        //   }
        return;
      }

      DAO dao = (DAO) x.get(daoName);

      if ( dao == null ) {
        resp.sendError(HttpServletResponse.SC_NOT_FOUND, "Unknown DAO: "+daoName);
        throw new RuntimeException("DAO not found");
      }

      dao = dao.inX(x);

      FObject   obj      = null;
      ClassInfo cInfo    = dao.getOf();
      Class     objClass = cInfo.getObjClass();

      Predicate pred = new WebAgentQueryParser(cInfo).parse(x, q);
      logger.debug("predicate", pred.getClass(), pred.toString());
      dao = dao.where(pred);

      if ( Command.put == command ) {
        if ( Format.JSON == format ) {
          JSONParser jsonParser = new JSONParser();
          jsonParser.setX(x);
          foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(OutputterMode.NETWORK);
          outputterJson.setOutputDefaultValues(true);
          outputterJson.setOutputClassNames(false);
          // let FObjectArray parse first
          if ( SafetyUtil.isEmpty(data) ) {
              resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "PUT|POST expecting data, non received.");
              return;
          }
          try {
            Object o = jsonParser.parseStringForArray(data, objClass);
            if ( o != null && o instanceof Object[] ) {
              Object[] objs = (Object[]) o;
              for ( int j = 0 ; j < objs.length ; j++ ) {
                obj = (FObject) objs[j];
                dao.put(obj);
              }
              outputterJson.output(objs);
              out.println(outputterJson);
              resp.setStatus(HttpServletResponse.SC_OK);
              return;
            }

            o = jsonParser.parseString(data, objClass);
            if ( o != null ) {
              obj = (FObject) o;
              obj = dao.put(obj);
              outputterJson.output(obj);
              out.println(outputterJson);
              resp.setStatus(HttpServletResponse.SC_OK);
              return;
            }

            String dataArray[] = data.split("\\{\"class\":\"" + cInfo.getId());
            if ( dataArray.length > 0 ) {
              Object[] results = new Object[dataArray.length];
              for ( int i = 0 ; i < dataArray.length ; i++ ) {
                o = jsonParser.parseString(data, objClass);

                if ( o == null ) {
                  String message = getParsingError(x, buffer_.toString());
                  logger.error(message + ", input: " + buffer_.toString());
                  resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
                  return;
                }
                obj = (FObject) o;
                obj = dao.put(obj);
                results[i] = obj;
              }
              outputterJson.output(results);
              out.println(outputterJson);
              resp.setStatus(HttpServletResponse.SC_OK);
              return;
            }
            String message = getParsingError(x, data);
            logger.error(message + ", input: " + data);
            // TODO: add all validation errors.
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
            return;
          } catch (Exception e) {
            logger.error(e);
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
            return;
          }
        } else if ( Format.XML == format ) {
          XMLSupport      xmlSupport = new XMLSupport();
          XMLInputFactory factory    = XMLInputFactory.newInstance();
          StringReader    reader     = new StringReader(data.toString());
          XMLStreamReader xmlReader  = factory.createXMLStreamReader(reader);
          List<FObject>   objList    = xmlSupport.fromXML(x, xmlReader, objClass);

          if ( objList.size() == 0 ) {
            String message = getParsingError(x, buffer_.toString());
            logger.error(message + ", input: " + buffer_.toString());
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
            return;
          }

          Iterator i = objList.iterator();
          while ( i.hasNext() ) {
            obj = (FObject)i.next();
            obj = dao.put(obj);
          }
        } else if ( Format.CSV == format ) {
          CSVSupport csvSupport = new CSVSupport();
          csvSupport.setX(x);

          // convert String into InputStream
          InputStream is = new ByteArrayInputStream(data.toString().getBytes());

          ArraySink arraySink = new ArraySink();

          csvSupport.inputCSV(is, arraySink, cInfo);

          List list = arraySink.getArray();

          if ( list.size() == 0 ) {
            String message = getParsingError(x, buffer_.toString());
            logger.error(message + ", input: " + buffer_.toString());
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
            return;
          }

          for ( int i = 0 ; i < list.size() ; i++ ) {
            dao.put((FObject) list.get(i));
          }
        } else if ( Format.HTML == format ) {
          resp.sendError(HttpServletResponse.SC_NOT_ACCEPTABLE, "Unsupported Accept");
          return;
        }
        out.println("Success");
      } else if ( Command.select == command ) {
        ArraySink sink = (ArraySink) dao.select(new ArraySink());
        if ( sink.getArray().size() == 0 ) {
          out.println("No data");
          resp.setStatus(HttpServletResponse.SC_OK);
          return;
        }
        logger.debug(this.getClass().getSimpleName(), "objects selected: " + sink.getArray().size());

        if ( Format.JSON == format ) {
          foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(OutputterMode.NETWORK);
          outputterJson.setOutputDefaultValues(true);
          outputterJson.setOutputClassNames(false);
          outputterJson.output(sink.getArray().toArray());

          //resp.setContentType("application/json");
          if ( emailSet ) {
            output(x, outputterJson.toString());
          } else {
            out.println(outputterJson.toString());
          }
        } else if ( Format.XML == format ) {
          XMLSupport xmlSupport = new XMLSupport();

          if ( emailSet ) {
            String xmlData = "<textarea style=\"width:700;height:400;\" rows=10 cols=120>" + xmlSupport.toXMLString(sink.getArray()) + "</textarea>";

            output(x, xmlData);
          } else {
            //resp.setContentType("application/xml");
            out.println(xmlSupport.toXMLString(sink.getArray()));
          }
        } else if ( Format.CSV == format) {
          foam.lib.csv.Outputter outputterCsv = new foam.lib.csv.Outputter(OutputterMode.NETWORK);
          outputterCsv.output(sink.getArray().toArray());

          List a = sink.getArray();
          for ( int i = 0 ; i < a.size() ; i++ ) {
            outputterCsv.put((FObject) a.get(i), null);
          }

          //resp.setContentType("text/plain");
          //if ( email.length != 0 && ! email[0].equals("")  && email[0] != null ) {
          if (emailSet) {
            output(x, outputterCsv.toString());
          } else {
            out.println(outputterCsv.toString());
          }
        } else if ( Format.HTML == format ) {
          foam.lib.html.Outputter outputterHtml = new foam.lib.html.Outputter(OutputterMode.NETWORK);

          outputterHtml.outputStartHtml();
          outputterHtml.outputStartTable();
          List a = sink.getArray();
          for ( int i = 0 ; i < a.size() ; i++ ) {
            if ( i == 0 ) {
              outputterHtml.outputHead((FObject) a.get(i));
            }
            outputterHtml.put((FObject) a.get(i), null);
          }
          outputterHtml.outputEndTable();
          outputterHtml.outputEndHtml();

          if ( emailSet ) {
            output(x, outputterHtml.toString());
          } else {
            out.println(outputterHtml.toString());
          }
        }  else if ( Format.JSONJ == format) {
          foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(OutputterMode.NETWORK);
          List a = sink.getArray();
          String dataToString = "";

          //resp.setContentType("application/json");
          for ( int i = 0 ; i < a.size() ; i++ ) {
              outputterJson.output(a.get(i));
          }
          String dataArray[] = outputterJson.toString().split("\\{\"class\":\"" + cInfo.getId());
          for ( int k = 1 ; k < dataArray.length; k++ ) {
            dataToString += "p({\"class\":\"" + cInfo.getId() + dataArray[k] + ")\n";
          }

          if ( emailSet ) {
            output(x, dataToString);
          } else {
            out.println(dataToString);
          }
        }
      } else if ( Command.help == command) {
        out.println("Help: <br><br>" );
        /*List<PropertyInfo> props = cInfo.getAxiomsByClass(PropertyInfo.class);
        out.println(daoName + "<br><br>");
        out.println("<table>");
        for( PropertyInfo pi : props ) {
          out.println("<tr>");
          out.println("<td width=200>" + pi.getName() + "</td>");
          out.println("<td width=200>" + pi.getValueClass().getSimpleName() + "</td>");
          out.println("</tr>");
        }
        out.println("</table>");*/

        out.println("<input type=hidden id=classInfo style=margin-left:30;width:350 value=" + cInfo.getId() + "></input>");
        out.println("<script>var vurl = document.location.protocol + '//' + document.location.host + '/?path=' + document.getElementById('classInfo').value + '#docs'; window.open(vurl, '_self'); </script>");
      } else if ( Command.remove == command ) {
        PropertyInfo idProp     = (PropertyInfo) cInfo.getAxiomByName("id");
        Object       idObj      = idProp.fromString(id);
        FObject      targetFobj = dao.find(idObj);

        if ( targetFobj == null ) {
          throw new RuntimeException("Unknown ID");
        } else {
          dao.remove(targetFobj);
          out.println("Success");
        }
      } else {
        //out.println("Unknown command: " + command);
        resp.sendError(HttpServletResponse.SC_NOT_FOUND, "Unsupported method: "+command);
        return;
      }

      out.println();
      out.flush();
      logger.debug(this.getClass().getSimpleName(), "success");
      resp.setStatus(HttpServletResponse.SC_OK);
    } catch (Throwable t) {
      out.println("Error " + t);
      out.println("<pre>");
      t.printStackTrace(out);
      out.println("</pre>");
      t.printStackTrace();
      logger.error(t);
      try {
        resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, t.toString());
      } catch ( java.io.IOException e ) {
        logger.error("Failed to send HttpServletResponse CODE", e);
      }
    } finally {
      pm.log(x);
    }
  }

  protected void output(X x, String data) {
    HttpParameters p       = x.get(HttpParameters.class);
    String[]       email   = p.getParameterValues("email");
    String         subject = p.getParameter("subject");

    if ( email.length == 0 ) {
      PrintWriter out = x.get(PrintWriter.class);

      out.print(data);
    } else {
      EmailService emailService = (EmailService) x.get("email");
      EmailMessage message      = new EmailMessage();
      message.setTo(email);
      message.setSubject(subject);

      String newData = data;

      message.setBody(newData);

      emailService.sendEmail(message);
    }
  }

  /**
   * Gets the result of a failing parsing of a buffer
   * @param buffer the buffer that failed to be parsed
   * @return the error message
   */
  protected String getParsingError(X x, String buffer) {
    Parser        parser = new foam.lib.json.ExprParser();
    PStream       ps     = new StringPStream();
    ParserContext psx    = new ParserContextImpl();

    ((StringPStream) ps).setString(buffer);
    psx.set("X", x == null ? new ProxyX() : x);

    ErrorReportingPStream eps = new ErrorReportingPStream(ps);
    ps = eps.apply(parser, psx);
    return eps.getMessage();
  }

  protected void outputPage(X x) {
    final PrintWriter out      = x.get(PrintWriter.class);
    DAO               nSpecDAO = (DAO) x.get("AuthenticatedNSpecDAO");
    Logger            logger   = (Logger) x.get("logger");

    out.println("<form method=post><span>DAO:</span>");
    out.println("<span><select name=dao id=dao style=margin-left:35 onchange=changeUrl()>");
    // gets all ongoing nanopay services
    nSpecDAO.inX(x).orderBy(NSpec.NAME).select(new AbstractSink() {
        @Override
        public void put(Object o, Detachable d) {
          NSpec s = (NSpec) o;
          if ( s.getServe() && s.getName().endsWith("DAO") ) {
            out.println("<option value=" + s.getName() + ">" + s.getName() + "</option>");
          }
        }
      });
    out.println("</select></span>");
    out.println("<br><br><span id=formatSpan>Format:<select name=format id=format onchange=changeUrl() style=margin-left:25><option value=csv>CSV</option><option value=xml>XML</option><option value=json selected>JSON</option><option value=html>HTML</option><option value=jsonj>JSON/J</option></select></span>");
    out.println("<br><br><span>Command:<select name=cmd id=cmd width=150 style=margin-left:5  onchange=changeCmd(this.value)><option value=put selected>PUT</option><option value=select>SELECT</option><option value=remove>REMOVE</option><option value=help>HELP</option></select></span>");
    out.println("<br><br><span id=qSpan style=display:none;>Query:<input id=q name=q style=margin-left:30;width:350 onchange=changeUrl() onkeyup=changeUrl()></input></span>");
    out.println("<br><br><span id=emailSpan style=display:none;>Email:<input id=email name=email style=margin-left:30;width:350 onkeyup=changeUrl() onchange=changeUrl()></input></span>");
    out.println("<br><br><span id=subjectSpan style=display:none;>Subject:<input id=subject name=subject style=margin-left:20;width:350 onkeyup=changeUrl() onchange=changeUrl()></input></span>");
    out.println("<br><br><span id=idSpan style=display:none;>ID:<input id=id name=id style=margin-left:52 onkeyup=changeUrl() onchange=changeUrl()></input></span>");
    out.println("<br><br><span id=dataSpan>Data:<br><textarea rows=20 cols=120 name=data></textarea></span>");
    out.println("<br><span id=urlSpan style=display:none;> URL : </span>");
    out.println("<input id=builtUrl size=120 style=margin-left:20;display:none;/ >");
    out.println("<br><br><button type=submit >Submit</button></form>");
    out.println("<script>function changeCmd(cmdValue) { if ( cmdValue != 'put' ) {document.getElementById('dataSpan').style.cssText = 'display: none'; } else { document.getElementById('dataSpan').style.cssText = 'display: inline-block'; } if ( cmdValue == 'remove' ) { document.getElementById('idSpan').style.cssText = 'display: inline-block'; document.getElementById('formatSpan').style.cssText = 'display:none';} else { document.getElementById('idSpan').style.cssText = 'display: none'; document.getElementById('formatSpan').style.cssText = 'display: inline-block'; document.getElementById('id').value = '';} if ( cmdValue == 'select' ) {document.getElementById('qSpan').style.cssText = 'display: inline-block'; document.getElementById('emailSpan').style.cssText = 'display: inline-block'; document.getElementById('subjectSpan').style.cssText = 'display: inline-block'; document.getElementById('urlSpan').style.cssText = 'display: inline-block';document.getElementById('builtUrl').style.cssText = 'display: inline-block'; var vbuiltUrl = document.location.protocol + '//' + document.location.host + '/service/dig?dao=' + document.getElementById('dao').value + '&format=' + document.getElementById('format').options[document.getElementById('format').selectedIndex].value + '&cmd=' + document.getElementById('cmd').options[document.getElementById('cmd').selectedIndex].value + '&email='; document.getElementById('builtUrl').value=vbuiltUrl;}else {document.getElementById('qSpan').style.cssText = 'display:none'; document.getElementById('emailSpan').style.cssText = 'display:none'; document.getElementById('subjectSpan').style.cssText ='display:none';document.getElementById('urlSpan').style.cssText = 'display:none';document.getElementById('builtUrl').style.cssText = 'display:none';}}</script>");

    out.println("<script>function changeUrl() {var vbuiltUrl = document.location.protocol + '//' + document.location.host + '/service/dig?dao=' + document.getElementById('dao').value + '&format=' + document.getElementById('format').options[document.getElementById('format').selectedIndex].value + '&cmd=' + document.getElementById('cmd').options[document.getElementById('cmd').selectedIndex].value + '&email=' + document.getElementById('email').value + '&q=' + document.getElementById('q').value; document.getElementById('builtUrl').value=vbuiltUrl;}</script>");

    out.println();
  }
}
