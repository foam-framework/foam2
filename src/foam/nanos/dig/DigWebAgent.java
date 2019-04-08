/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.dig;

import foam.core.*;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.lib.csv.CSVSupport;
import foam.lib.json.JSONParser;
import foam.lib.json.OutputterMode;
import foam.lib.parse.*;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import foam.nanos.dig.exception.*;
import foam.nanos.http.*;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import foam.nanos.pm.PM;
import foam.util.SafetyUtil;
import javax.servlet.http.HttpServletResponse;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamReader;
import java.io.*;
import java.lang.Exception;
import java.net.URL;
import java.nio.CharBuffer;
import java.util.Iterator;
import java.util.List;

public class DigWebAgent
  implements WebAgent
{
  public DigWebAgent() {}

  public void execute(X x) {
    Logger              logger   = (Logger) x.get("logger");
    HttpServletResponse resp     = x.get(HttpServletResponse.class);
    HttpParameters      p        = x.get(HttpParameters.class);
    PrintWriter         out      = x.get(PrintWriter.class);
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
    String              fileAddress = p.getParameter("fileaddress");

    //
    // FIXME/TODO: ensuring XML and CSV flows return proper response objects and codes has not been completed since the switch to HttpParameters.
    //
    PM pm = new PM(getClass(), command.getName()+'/'+format.getName());

    logger = new PrefixLogger(new Object[] { this.getClass().getSimpleName() }, logger);
    try {
      if ( SafetyUtil.isEmpty(daoName) ) {
        resp.setContentType("text/html");

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
        DigErrorMessage error = new DAONotFoundException.Builder(x)
                                      .setMessage("DAO not found: " + daoName)
                                      .build();
        outputException(x, resp, format, out, error);
        return;
      }

      dao = dao.inX(x);

      FObject   obj      = null;
      ClassInfo cInfo    = dao.getOf();
      Class     objClass = cInfo.getObjClass();

      Predicate pred = new WebAgentQueryParser(cInfo).parse(x, q);
      logger.debug("predicate", pred.getClass(), pred.toString());
      dao = dao.where(pred);

      if ( Command.put == command ) {
        String returnMessage = "success";

        if ( Format.JSON == format ) {
          JSONParser jsonParser = new JSONParser();
          jsonParser.setX(x);
          foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(OutputterMode.NETWORK);
          outputterJson.setOutputDefaultValues(true);
          outputterJson.setOutputClassNames(true);
          // let FObjectArray parse first
          if ( SafetyUtil.isEmpty(data) ) {
              DigErrorMessage error = new EmptyDataException.Builder(x).build();
              outputException(x, resp, format, out, error);
              return;
          }
          try {
            Object o = jsonParser.parseStringForArray(data, objClass);
            Object o1 = jsonParser.parseString(data, objClass);
            if ( o == null && o1 == null ) {
              DigErrorMessage error = new ParsingErrorException.Builder(x)
                                            .setMessage("Invalid JSON Format")
                                            .build();
              outputException(x, resp, format, out, error);
              return;
            }

            if ( o == null )
              o = o1;

            if ( o instanceof Object[] ) {
              Object[] objs = (Object[]) o;
              for ( int j = 0 ; j < objs.length ; j++ ) {
                obj = (FObject) objs[j];
                daoPut(dao, obj);
              }
              outputterJson.output(objs);
            } else {
              obj = (FObject) o;
              obj = daoPut(dao, obj);
              outputterJson.output(obj);
            }

            out.println(outputterJson);
            resp.setStatus(HttpServletResponse.SC_OK);
            return;

          } catch (Exception e) {
            logger.error(e);
            DigErrorMessage error = new DAOPutException.Builder(x)
                                          .setMessage(e.getMessage())
                                          .build();
            outputException(x, resp, format, out, error);
            return;
          }
        } else if ( Format.XML == format ) {
          XMLSupport      xmlSupport = new XMLSupport();
          XMLInputFactory factory    = XMLInputFactory.newInstance();

          if ( SafetyUtil.isEmpty(data) ) {
            DigErrorMessage error = new EmptyDataException.Builder(x)
              .build();
            outputException(x, resp, format, out, error);
            return;
          }

          StringReader    reader     = new StringReader(data.toString());
          XMLStreamReader xmlReader  = factory.createXMLStreamReader(reader);
          List<FObject>   objList    = xmlSupport.fromXML(x, xmlReader, objClass);

          if ( objList.size() == 0 ) {
            String message = getParsingError(x, buffer_.toString());
            logger.error(message + ", input: " + buffer_.toString());

            DigErrorMessage error = new ParsingErrorException.Builder(x)
                                      .setMessage("Invalid XML Format")
                                      .build();
            outputException(x, resp, format, out, error);
            return;
          }

          Iterator i = objList.iterator();
          while ( i.hasNext() ) {
            obj = (FObject)i.next();
            obj = daoPut(dao, obj);
          }

          //returnMessage = "<objects>" + success + "</objects>";
        } else if ( Format.CSV == format ) {
          if ( SafetyUtil.isEmpty(data) && SafetyUtil.isEmpty(fileAddress) ) {
            DigErrorMessage error = new EmptyDataException.Builder(x)
              .build();
            outputException(x, resp, format, out, error);
            return;
          }

          CSVSupport csvSupport = new CSVSupport();
          csvSupport.setX(x);

          ArraySink arraySink = new ArraySink();

          InputStream is = null;

          if ( ! SafetyUtil.isEmpty(data) ) {
            is = new ByteArrayInputStream(data.toString().getBytes());
          } else { //file Data
            try {
              is = new URL(fileAddress).openStream();
            } catch (Exception e) {
                DigErrorMessage error = new GeneralException.Builder(x)
                  .setMessage("File Not Found Exception")
                  .build();
                outputException(x, resp, format, out, error);
                return;
            }
          }

          csvSupport.inputCSV(is, arraySink, cInfo);

          List list = arraySink.getArray();

          if ( list.size() == 0 ) {
            String message = getParsingError(x, buffer_.toString());
            logger.error(message + ", input: " + buffer_.toString());

            DigErrorMessage error = new ParsingErrorException.Builder(x)
              .setMessage("Invalid CSV Format")
              .build();
            outputException(x, resp, format, out, error);
            return;
          }

          for ( int i = 0 ; i < list.size() ; i++ ) {
            daoPut(dao, (FObject) list.get(i));
          }
        } else if ( Format.HTML == format ) {
          DigErrorMessage error = new UnsupportException.Builder(x)
                                        .setMessage("Unsupported Format: " + format)
                                        .build();
          outputException(x, resp, format, out, error);

          return;
        } else if (Format.JSONJ == format ) {
          String dataJson = "[";
          String dataJsonJ[] = data.split("\\r?\\n");
          for (String i:dataJsonJ){
            i = i.trim();
            if (i.startsWith("p(")) {
              dataJson += i.substring(2, i.length()-1) + ',';
            }
          }
          dataJson += "]";

          // JSON part from above
          JSONParser jsonParser = new JSONParser();
          jsonParser.setX(x);
          foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(OutputterMode.NETWORK);
          outputterJson.setOutputDefaultValues(true);
          outputterJson.setOutputClassNames(true);
          // let FObjectArray parse first
          if ( SafetyUtil.isEmpty(dataJson) ) {
              DigErrorMessage error = new EmptyDataException.Builder(x)
                                            .build();
              outputException(x, resp, format, out, error);
              return;
          }
          try {
            Object o = jsonParser.parseStringForArray(dataJson, objClass);
            Object o1 = jsonParser.parseString(dataJson, objClass);
            if ( o == null && o1 == null ) {
              DigErrorMessage error = new ParsingErrorException.Builder(x)
                                            .setMessage("Invalid JSONJ Format")
                                            .build();
              outputException(x, resp, format, out, error);
              return;
            }

            if ( o == null )
              o = o1;

            if ( o instanceof Object[] ) {
              Object[] objs = (Object[]) o;
              for ( int j = 0 ; j < objs.length ; j++ ) {
                obj = (FObject) objs[j];
                daoPut(dao, obj);
              }
            } else {
              obj = (FObject) o;
              obj = daoPut(dao, obj);
            }
            outputterJson.output(o);
            out.println(outputterJson);
            resp.setStatus(HttpServletResponse.SC_OK);
            return;

          } catch (Exception e) {
            logger.error(e);
            DigErrorMessage error = new DAOPutException.Builder(x)
                                          .setMessage(e.getMessage())
                                          .build();
            outputException(x, resp, format, out, error);
            return;
          }
        }
        out.println(returnMessage);
      } else if ( Command.select == command ) {
        PropertyInfo idProp = (PropertyInfo) cInfo.getAxiomByName("id");
        ArraySink sink = (ArraySink) ( ! SafetyUtil.isEmpty(id) ?
          dao.where(MLang.EQ(idProp, id)).select(new ArraySink()) :
          dao.select(new ArraySink()));

        if ( sink != null ) {
          if ( sink.getArray().size() == 0 ) {
            if (Format.XML == format) {
              resp.setContentType("text/html");
            }
            out.println("[]");
            resp.setStatus(HttpServletResponse.SC_OK);
            return;
          }
          logger.debug(this.getClass().getSimpleName(), "objects selected: " + sink.getArray().size());

          if ( Format.JSON == format ) {
            foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(OutputterMode.NETWORK);
            outputterJson.setOutputDefaultValues(true);
            outputterJson.setOutputClassNames(true);
            outputterJson.output(sink.getArray().toArray());

            //resp.setContentType("application/json");
            if ( emailSet ) {
              output(x, outputterJson.toString());
            } else {
              out.println(outputterJson.toString());
            }
          } else if ( Format.XML == format ) {
            foam.lib.xml.Outputter outputterXml = new foam.lib.xml.Outputter(OutputterMode.NETWORK);
            outputterXml.output(sink.getArray().toArray());

            resp.setContentType("application/xml");
            if ( emailSet ) {
              output(x, "<textarea style=\"width:700;height:400;\" rows=10 cols=120>" + outputterXml.toString() + "</textarea>");
            } else {
              String simpleName = cInfo.getObjClass().getSimpleName().toString();
              out.println("<" + simpleName + "s>"+ outputterXml.toString() + "</" + simpleName + "s>");
            }
          } else if ( Format.CSV == format ) {
            foam.lib.csv.Outputter outputterCsv = new foam.lib.csv.Outputter(OutputterMode.NETWORK);
            outputterCsv.output(sink.getArray().toArray());

            List a = sink.getArray();
            for ( int i = 0; i < a.size(); i++ ) {
              outputterCsv.put((FObject) a.get(i), null);
            }

            //resp.setContentType("text/plain");
            //if ( email.length != 0 && ! email[0].equals("")  && email[0] != null ) {
            if ( emailSet ) {
              output(x, outputterCsv.toString());
            } else {
              out.println(outputterCsv.toString());
            }
          } else if ( Format.HTML == format ) {
            foam.lib.html.Outputter outputterHtml = new foam.lib.html.Outputter(OutputterMode.NETWORK);

            outputterHtml.outputStartHtml();
            outputterHtml.outputStartTable();
            List a = sink.getArray();

            for ( int i = 0; i < a.size(); i++ ) {
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
          } else if ( Format.JSONJ == format ) {
            foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(OutputterMode.STORAGE);
            List a = sink.getArray();
            String dataToString = "";

            //resp.setContentType("application/json");
            for ( int i = 0 ; i < a.size() ; i++ )
              outputterJson.outputJSONJFObject((FObject) a.get(i));

            if ( emailSet ) {
              output(x, dataToString);
            } else {
              out.println(outputterJson.toString());
            }
          }
        } else {
          if ( Format.XML == format ) {
            resp.setContentType("text/html");
          }

          DigErrorMessage error = new ParsingErrorException.Builder(x)
            .setMessage("Unsupported DAO : " + daoName)
            .build();
          outputException(x, resp, format, out, error);

          return;
        }
      } else if ( Command.remove == command ) {
        PropertyInfo idProp     = (PropertyInfo) cInfo.getAxiomByName("id");
        Object       idObj      = idProp.fromString(id);
        FObject      targetFobj = dao.find(idObj);

        if ( targetFobj == null ) {
          DigErrorMessage error = new UnknownIdException.Builder(x)
            .build();
          outputException(x, resp, format, out, error);

          return;
        } else {
          dao.remove(targetFobj);

          DigErrorMessage error = new DigSuccessMessage.Builder(x)
            .setMessage("Success")
            .build();
          outputException(x, resp, format, out, error);
          return;
        }
      } else {
        DigErrorMessage error = new ParsingErrorException.Builder(x)
                                  .setMessage("Unsupported method: "+command)
                                  .build();
        outputException(x, resp, format, out, error);
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
    HttpParameters p            = x.get(HttpParameters.class);
    String         emailParam   = p.getParameter("email");
    String         subject      = p.getParameter("subject");

    if (  SafetyUtil.isEmpty(emailParam) ) {
      PrintWriter out = x.get(PrintWriter.class);

      out.print(data);
    } else {
      EmailService emailService = (EmailService) x.get("email");
      EmailMessage message      = new EmailMessage();

      // For multiple receiver
      String[]  email = emailParam.split(",");

      if ( email.length > 0 ) message.setTo(email);

      message.setSubject(subject);

      String newData = data;

      message.setBody(newData);

      emailService.sendEmail(x, message);
    }
  }

  /**
   * Put an FObject to the DAO, but merge with current object stored in DAO
   * if it exists.
   * TODO: improve synchronization
   */
  protected synchronized FObject daoPut(DAO dao, FObject obj)
    throws Exception
  {
    FObject oldObj = dao.find(obj);
    return dao.put(oldObj == null ? obj : oldObj.copyFrom(obj));
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

  protected void outputException(X x, HttpServletResponse resp, Format format, PrintWriter out, DigErrorMessage error) {
    resp.setStatus(Integer.parseInt(error.getStatus()));
    if ( format == Format.JSON ) {
      //output error in json format

      JSONParser jsonParser = new JSONParser();
      jsonParser.setX(x);
      foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(OutputterMode.NETWORK);
      outputterJson.setOutputDefaultValues(true);
      outputterJson.setOutputClassNames(true);
      outputterJson.output(error);
      out.println(outputterJson.toString());

    } else if ( format == Format.XML )  {
      //output error in xml format

      foam.lib.xml.Outputter outputterXml = new foam.lib.xml.Outputter(OutputterMode.NETWORK);
      outputterXml.output(error);
      out.println(outputterXml.toString());

    } else if ( format == Format.CSV )  {
      //output error in csv format

      foam.lib.csv.Outputter outputterCsv = new foam.lib.csv.Outputter(OutputterMode.NETWORK);
      outputterCsv.put(error, null);
      out.println(outputterCsv.toString());

    } else if ( format == Format.HTML ) {
      foam.lib.html.Outputter outputterHtml = new foam.lib.html.Outputter(OutputterMode.NETWORK);

      outputterHtml.outputStartHtml();
      outputterHtml.outputStartTable();
      outputterHtml.outputHead(error);
      outputterHtml.put(error, null);
      outputterHtml.outputEndTable();
      outputterHtml.outputEndHtml();
      out.println(outputterHtml.toString());
    } else if ( format == Format.JSONJ ) {
      //output error in jsonJ format

      JSONParser jsonParser = new JSONParser();
      jsonParser.setX(x);
      foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(OutputterMode.STORAGE);
      outputterJson.setOutputDefaultValues(true);
      outputterJson.setOutputClassNames(true);
      outputterJson.outputJSONJFObject(error);
      out.println(outputterJson.toString());

    } else {
      // TODO
    }
  }
}
