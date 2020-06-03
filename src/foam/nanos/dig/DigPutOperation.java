/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.dig;

import foam.core.*;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.lib.csv.CSVSupport;
import foam.lib.json.JSONParser;
import foam.nanos.dig.exception.*;
import foam.nanos.http.*;
import foam.util.SafetyUtil;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.PrintWriter;
import java.io.StringReader;
import java.lang.Exception;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.http.HttpServletResponse;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamReader;

public class DigPutOperation extends DigOperation
{
  public DigPutOperation(X x) {
    super(x);
  }

  public void execute(X x) {
    try {
      HttpParameters p = x.get(HttpParameters.class);
      Command command = (Command) p.get(Command.class);
      Format format = (Format) p.get(Format.class);
      
      DAO dao = getDAO(x);
      if ( dao == null )
        return;

      List fobjects = parseFObjects(x, dao);
      if ( fobjects == null )
        return;

      for (int i = 0; i < fobjects.size(); i++)
      {
        fobjects.set(i, daoPut(dao, (FObject) fobjects.get(i)));
      }
      
      outputFObjects(x, dao, fobjects);

      PrintWriter out = x.get(PrintWriter.class);
      out.println();
      out.flush();
      logger_.debug(this.getClass().getSimpleName(), "success");
      
      HttpServletResponse resp = x.get(HttpServletResponse.class);
      resp.setStatus(HttpServletResponse.SC_OK);
    }
    catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  private List parseFObjects(X x, DAO dao)
    throws Exception
  {
    HttpParameters p = x.get(HttpParameters.class);
    Format format = (Format) p.get(Format.class);
    String data = p.getParameter("data");
    ClassInfo cInfo = dao.getOf();

    // let FObjectArray parse first
    if ( SafetyUtil.isEmpty(data) ) {
      DigUtil.outputException(x, new EmptyDataException.Builder(x).build(), format);
      return null;
    }

    List list = null;
    switch ( format ) {
      case JSONJ:
      {
        String dataJson = "[";
        String dataJsonJ[] = data.split("\\r?\\n");
        for (String i:dataJsonJ){
          i = i.trim();
          if (i.startsWith("p(")) {
            dataJson += i.substring(2, i.length()-1) + ',';
          }
        }
        dataJson += "]";
        data = dataJson;
        
        // fall thru to JSON case
      }
      case JSON: 
      {
        JSONParser jsonParser = new JSONParser();
        jsonParser.setX(x);

        // Attempt to parse array
        Object o = jsonParser.parseStringForArray(data, cInfo.getObjClass());

        // Attempt to parse single object
        if ( o == null )
          o = jsonParser.parseString(data, cInfo.getObjClass());

        if ( o == null ) {
          DigUtil.outputException(x, 
            new ParsingErrorException.Builder(x)
              .setMessage("Invalid JSON Format").build(), 
            format);
          return null;
        }

        if ( o instanceof Object[] ) {
          Object[] objs = (Object[]) o;
          list = Arrays.asList(objs);
        } else {
          list = new ArrayList();
          list.add(o);
        }
        break;
      }
      case XML:
      {
        StringReader reader = new StringReader(data);
        XMLSupport xmlSupport = new XMLSupport();
        XMLInputFactory factory = XMLInputFactory.newInstance();
        factory.setProperty(XMLInputFactory.SUPPORT_DTD, false);
        XMLStreamReader xmlReader = factory.createXMLStreamReader(reader);

        List<FObject> objList = xmlSupport.fromXML(x, xmlReader, cInfo.getObjClass());
  
        if ( objList.size() == 0 ) {
          DigUtil.outputException(x, 
            new ParsingErrorException.Builder(x)
              .setMessage("Invalid XML Format").build(), 
            format);
          return null;
        }

        list = (List) objList;
        break;
      }
      case CSV:
      {
        ArraySink arraySink = new ArraySink();
        InputStream is = new ByteArrayInputStream(data.toString().getBytes());;

        CSVSupport csvSupport = new CSVSupport();
        csvSupport.setX(x);
        csvSupport.inputCSV(is, arraySink, cInfo);

        list = arraySink.getArray();

        if ( list == null || list.size() == 0 ) {
          DigUtil.outputException(x, 
            new ParsingErrorException.Builder(x)
              .setMessage("Invalid CSV Format").build(), 
            format);
          return null;
        }
        break;
      }
      default:
      {
        DigUtil.outputException(x, 
          new UnsupportException.Builder(x)
            .setMessage("Unsupported Format: " + format).build(), 
          format);
        return null;
      }
    }

    return list;
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
}
