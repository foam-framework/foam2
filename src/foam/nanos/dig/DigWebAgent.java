/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.dig;

import foam.core.*;
import foam.core.PropertyInfo;
import foam.dao.AbstractSink;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.lib.csv.*;
import foam.lib.json.*;
import foam.lib.parse.*;
import foam.nanos.boot.NSpec;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import foam.util.SafetyUtil;
import java.io.*;
import java.nio.CharBuffer;
import java.util.*;
import java.util.Iterator;
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
    HttpServletRequest  req        = x.get(HttpServletRequest.class);
    HttpServletResponse resp       = x.get(HttpServletResponse.class);
    final PrintWriter   out        = x.get(PrintWriter.class);
    CharBuffer          buffer_    = CharBuffer.allocate(65535);
    String              accept     = req.getHeader("Accept");
    String              contentType = req.getHeader("Content-Type");
    String              data       = req.getParameter("data");
    Object              dataObj    = null;
    String              daoName    = req.getParameter("dao");
    String              command    = req.getParameter("cmd");
    String              format     = req.getParameter("format");
    String              id         = req.getParameter("id");
    String              methodName = req.getMethod();
    Logger              logger     = (Logger) x.get("logger");
    DAO                 nSpecDAO   = (DAO) x.get("nSpecDAO");
    String[]            email      = req.getParameterValues("email");
    boolean             emailSet   = email != null && email.length > 0 && ! SafetyUtil.isEmpty(email[0]);
    String              subject    = req.getParameter("subject");

    resp.setContentType("text/html");

    if ( SafetyUtil.isEmpty(command) && ! SafetyUtil.isEmpty(methodName) ) {
      command = methodName.toLowerCase();
    }

    if ( format == null ) {
      format = "json";
      if ( accept != null ) {
        String[] formats = accept.split(";");
        for ( int i = 0; i < formats.length; i++ ) {
          String f = formats[i].trim();
          if ( "application/json".equals(f) ) {
            format = "json";
            resp.setContentType("application/json");
            break;
          }
          if ( "application/xml".equals(f) ) {
            format = "xml";
            resp.setContentType("application/xml");
            break;
          }
        }
      }
    }

    //
    // When content-type is other than application/x-www-form-urlencoded, the
    // HttpServletRequest.reader stream must be processes manually to extract
    // parameters from the body.
    //
    // Future considerations for partial parameters in the POST URI
    // see examples: https://technologyconversations.com/2014/08/12/rest-api-with-json/
    //
    if ( "put".equals(command) || "post".equals(command) ) {
      try {
        if ( "application/x-www-form-urlencoded".equals(contentType) ) {
          // fallthrough - this is the dig website.
        } else if ( "application/json".equals(contentType) ) {
          StringBuffer buffer = new StringBuffer();
          BufferedReader reader = req.getReader();
          String line;
          while ( ( line = reader.readLine() ) != null ) {
            buffer.append(line);
          }
          logger.debug("reader data:", buffer.toString());
          JSONParser parser = new JSONParser();
          parser.setX(x);
          DigPostParameters parameters = (DigPostParameters) parser.parseString(buffer.toString(), DigPostParameters.class);
          if ( parameters != null ) {
            daoName = parameters.getDao();
            DAO dao = (DAO) x.get(daoName);
            // FIXME: this test for null is apparently not working. On an invalid
            // daoName we get a 'something went wrong response', even with the
            // catch Throwable below
            logger.debug("daoName", daoName, "dao", dao);
            if ( dao == null ) {
              resp.sendError(HttpServletResponse.SC_NOT_FOUND, "Unknown DAO: "+daoName);
              return;
            }
            dao = dao.inX(x);
            dataObj = parameters.getData();
            if ( dataObj != null ) {
              if ( dataObj instanceof Object[] ) {
                Object[] objs = (Object[]) dataObj;
                for ( int i = 0; i < objs.length; i++ ) {
                  FObject obj = (FObject) objs[i];
                  dao.put(obj);
                }
              } else {
                FObject obj = (FObject) dataObj;
                dao.put(obj);
              }
              resp.setStatus(HttpServletResponse.SC_OK);
              out.println("Success");
              return;
            }
          }
          // fallthrough to URI parameter validation
          logger.debug("fallthrough");
        } else {
          // TODO: XML, CSV - copy from below.
          logger.debug("unsupported content-type", contentType);
          resp.sendError(HttpServletResponse.SC_NOT_ACCEPTABLE, "Supported Content-Types: application/json");
          return;
        }
      } catch (java.io.IOException | IllegalStateException e) { // thrown by HttpServletResponse.sendError
        logger.error(e);
        return;
      } catch (Throwable t) {
        logger.error(t);
        return;
      }
    }

    logger.debug("method", methodName, "cmd", command, "accept", accept, "format", format, "dao", daoName, "id", id, "data", data);

    try {
      if ( "post".equals(command) && SafetyUtil.isEmpty(daoName) ) {
        out.println("<form method=post><span>DAO:</span>");
        out.println("<span><select name=dao id=dao style=margin-left:35 onchange=changeDao()>");

        // gets all ongoing nanopay services
        nSpecDAO.orderBy(NSpec.NAME).select(new AbstractSink() {
            @Override
            public void put(Object o, Detachable d) {
              NSpec s = (NSpec) o;
              if ( s.getServe() && s.getName().endsWith("DAO") ) {
                out.println("<option value=" + s.getName() + ">" + s.getName() + "</option>");
              }
            }
          });

        out.println("</select></span>");
        out.println("<br><br><span id=formatSpan>Format:<select name=format id=format onchange=changeFormat() style=margin-left:25><option value=csv>CSV</option><option value=xml>XML</option><option value=json selected>JSON</option><option value=html>HTML</option><option value=jsonj>JSON/J</option></select></span>");
        out.println("<br><br><span>Command:<select name=cmd id=cmd width=150 style=margin-left:5  onchange=changeCmd(this.value)><option value=put selected>PUT</option><option value=select>SELECT</option><option value=remove>REMOVE</option><option value=help>HELP</option></select></span>");
        out.println("<br><br><span id=emailSpan style=display:none;>Email:<input name=email style=margin-left:30;width:350></input></span>");
        out.println("<br><br><span id=subjectSpan style=display:none;>Subject:<input name=subject style=margin-left:20;width:350></input></span>");
        out.println("<br><br><span id=idSpan style=display:none;>ID:<input id=id name=id style=margin-left:52></input></span>");
        out.println("<br><br><span id=dataSpan>Data:<br><textarea rows=20 cols=120 name=data></textarea></span>");
        out.println("<br><span id=urlSpan style=display:none;> URL : </span>");
        out.println("<input id=builtUrl size=120 style=margin-left:20;display:none;/ >");
        out.println("<br><br><button type=submit >Submit</button></form>");
        out.println("<script>function changeCmd(cmdValue) { if ( cmdValue != 'put' ) {document.getElementById('dataSpan').style.cssText = 'display: none'; } else { document.getElementById('dataSpan').style.cssText = 'display: inline-block'; } if ( cmdValue == 'remove' ) { document.getElementById('idSpan').style.cssText = 'display: inline-block'; document.getElementById('formatSpan').style.cssText = 'display:none';} else { document.getElementById('idSpan').style.cssText = 'display: none'; document.getElementById('formatSpan').style.cssText = 'display: inline-block'; document.getElementById('id').value = '';} if ( cmdValue == 'select' ) {document.getElementById('emailSpan').style.cssText = 'display: inline-block'; document.getElementById('subjectSpan').style.cssText = 'display: inline-block'; document.getElementById('urlSpan').style.cssText = 'display: in≈ßline-block';document.getElementById('builtUrl').style.cssText = 'display: inline-block'; var vbuiltUrl = document.location.protocol + '//' + document.location.host + '/service/dig?dao=' + document.getElementById('dao').value + '&format=' + document.getElementById('format').options[document.getElementById('format').selectedIndex].value + '&cmd=' + document.getElementById('cmd').options[document.getElementById('cmd').selectedIndex].value + '&email='; document.getElementById('builtUrl').value=vbuiltUrl;}else {document.getElementById('emailSpan').style.cssText = 'display:none'; document.getElementById('subjectSpan').style.cssText ='display:none';document.getElementById('urlSpan').style.cssText = 'display:none';document.getElementById('builtUrl').style.cssText = 'display:none';}}</script>");

        out.println("<script>function changeDao() {var vbuiltUrl = document.location.protocol + '//' + document.location.host + '/service/dig?dao=' + document.getElementById('dao').value + '&format=' + document.getElementById('format').options[document.getElementById('format').selectedIndex].value + '&cmd=' + document.getElementById('cmd').options[document.getElementById('cmd').selectedIndex].value + '&email='; document.getElementById('builtUrl').value=vbuiltUrl;}</script>");
        out.println("<script>function changeFormat() {var vbuiltUrl = document.location.protocol + '//' + document.location.host + '/service/dig?dao=' + document.getElementById('dao').value + '&format=' + document.getElementById('format').options[document.getElementById('format').selectedIndex].value + '&cmd=' + document.getElementById('cmd').options[document.getElementById('cmd').selectedIndex].value + '&email='; document.getElementById('builtUrl').value=vbuiltUrl;}</script>");

        out.println();

        return;
      }

      if ( SafetyUtil.isEmpty(daoName) ) {
        throw new RuntimeException("Input DaoName");
      }

      DAO dao = (DAO) x.get(daoName);

      if ( dao == null ) {
        throw new RuntimeException("DAO not found");
      }

      dao = dao.inX(x);

      FObject   obj      = null;
      ClassInfo cInfo    = dao.getOf();
      Class     objClass = cInfo.getObjClass();

      if ( "put".equals(command) || "post".equals(command) ) {
        if ( "json".equals(format) ) {
          JSONParser jsonParser = new JSONParser();
          jsonParser.setX(x);

          //let FObjectArray parse first
          Object o = null;
          o = jsonParser.parseStringForArray(data, objClass);
          if ( o != null ) {
            Object[] objs = (Object[]) o;
            for ( int j = 0 ; j < objs.length ; j++ ) {
              obj = (FObject) objs[j];
              dao.put(obj);
            }
            out.println("Success");
            return;
          }

          String dataArray[] = data.split("\\{\"class\":\"" + cInfo.getId());

          for ( int i = 0 ; i < dataArray.length ; i++ ) {
            o = jsonParser.parseString(data, objClass);

            if ( o == null ) {
              out.println("Parse Error : ");

              String message = getParsingError(x, buffer_.toString());
              logger.error(message + ", input: " + buffer_.toString());
              out.println(message);
              out.flush();
              return;
            }
            obj = (FObject) o;
            dao.put(obj);
          }

        } else if ( "xml".equals(format) ) {
          XMLSupport      xmlSupport = new XMLSupport();
          XMLInputFactory factory    = XMLInputFactory.newInstance();
          StringReader    reader     = new StringReader(data);
          XMLStreamReader xmlReader  = factory.createXMLStreamReader(reader);
          List<FObject>   objList    = xmlSupport.fromXML(x, xmlReader, objClass);

          if ( objList.size() == 0 ) {
            out.println("Parse Error : ");

            String message = getParsingError(x, buffer_.toString());
            logger.error(message + ", input: " + buffer_.toString());
            out.println(message);
            out.flush();
            return;
          }

          Iterator i = objList.iterator();
          while ( i.hasNext() ) {
            obj = (FObject)i.next();
            obj = dao.put(obj);
          }
        } else if ( "csv".equals(format) ) {
          CSVSupport csvSupport = new CSVSupport();
          csvSupport.setX(x);

          // convert String into InputStream
          InputStream is = new ByteArrayInputStream(data.getBytes());

          ArraySink arraySink = new ArraySink();

          csvSupport.inputCSV(is, arraySink, cInfo);

          List list = arraySink.getArray();

          if ( list.size() == 0 ) {
            out.println("Parse Error : ");

            String message = getParsingError(x, buffer_.toString());
            logger.error(message + ", input: " + buffer_.toString());
            out.println(message);
            out.flush();
            return;
          }

          for ( int i = 0 ; i < list.size() ; i++ ) {
            dao.put((FObject) list.get(i));
          }
        } else if ( "html".equals(format) || "jsonj".equals(format) ) {
          out.println("Please pick the follwed format - CSV, JSON, XML when put.");
        }
        out.println("Success");
        // TODO
        //} else if ( "get".equals(command) && id != null ** ! "".equals(id) ) {
        // find
      } else if ( "select".equals(command) || "get".equals(command) ) {
        ArraySink sink = (ArraySink) dao.select(new ArraySink());
        System.err.println("objects selected: " + sink.getArray().size());

        if ( "json".equals(format) ) {
          foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(OutputterMode.NETWORK);
          outputterJson.setOutputDefaultValues(true);
          outputterJson.setOutputClassNames(false);
          outputterJson.output(sink.getArray().toArray());

          resp.setContentType("application/json");
          if ( emailSet ) {
            output(x, outputterJson.toString());
          } else {
            out.println(outputterJson.toString());
          }
        } else if ( "xml".equals(format) ) {
          XMLSupport xmlSupport = new XMLSupport();

          if ( emailSet ) {
            String xmlData = "<textarea style=\"width:700;height:400;\" rows=10 cols=120>" + xmlSupport.toXMLString(sink.getArray()) + "</textarea>";

            output(x, xmlData);
          } else {
            resp.setContentType("application/xml");
            out.println(xmlSupport.toXMLString(sink.getArray()));
          }
        } else if ( "csv".equals(format) ) {
          foam.lib.csv.Outputter outputterCsv = new foam.lib.csv.Outputter(OutputterMode.NETWORK);
          outputterCsv.output(sink.getArray().toArray());

          List a = sink.getArray();
          for ( int i = 0 ; i < a.size() ; i++ ) {
            outputterCsv.put((FObject) a.get(i), null);
          }

          resp.setContentType("text/plain");
          //if ( email.length != 0 && ! email[0].equals("")  && email[0] != null ) {
          if (emailSet) {
            output(x, outputterCsv.toString());
          } else {
            out.println(outputterCsv.toString());
          }
        } else if ( "html".equals(format) ) {
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
        }  else if ( "jsonj".equals(format) ) {
          foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(OutputterMode.NETWORK);
          List a = sink.getArray();
          String dataToString = "";

          resp.setContentType("application/json");
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
      } else if ( "help".equals(command) ) {
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
      } else if ( "remove".equals(command) || "delete".equals(command) ) {
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
        out.println("Unknown command: " + command);
      }

      if ( ! "put".equals(command) || ! "post".equals(command) ) {
        data = "";
      }

      if ( ! "remove".equals(command) || ! "delete".equals(command) ) {
        id = "";
      }

      out.println();
    } catch (Throwable t) {
      out.println("Error " + t);
      out.println("<pre>");
        t.printStackTrace(out);
      out.println("</pre>");
      t.printStackTrace();
    }
  }

  protected void output(X x, String data) {

    HttpServletRequest  req     = x.get(HttpServletRequest.class);
    String []           email   = req.getParameterValues("email");
    String              subject = req.getParameter("subject");

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
    //Parser        parser = new foam.lib.json.ExprParser();
    PStream       ps     = new StringPStream();
    ParserContext psx    = new ParserContextImpl();

    ((StringPStream) ps).setString(buffer);
    psx.set("X", x == null ? new ProxyX() : x);

    ErrorReportingPStream eps = new ErrorReportingPStream(ps);
    //ps = eps.apply(parser, psx);
    return eps.getMessage();
  }
}
