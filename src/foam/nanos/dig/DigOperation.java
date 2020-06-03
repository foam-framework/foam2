/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.dig;

import foam.core.*;
import foam.dao.DAO;
import foam.lib.csv.CSVOutputter;
import foam.lib.json.OutputterMode;
import foam.nanos.boot.NSpec;
import foam.nanos.dig.exception.*;
import foam.nanos.http.*;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.util.SafetyUtil;

import java.io.PrintWriter;
import java.util.List;
import javax.servlet.http.HttpServletResponse;

public abstract class DigOperation extends ContextAwareAgent
{
  protected Logger logger_;

  protected DigOperation(X x) {
    setX(x);

    logger_ = new PrefixLogger(new Object[] { this.getClass().getSimpleName() }, (Logger) x.get("logger"));
  }

  protected DAO getDAO(X x)
  {
    HttpParameters p = x.get(HttpParameters.class);
    String daoName = p.getParameter("dao");
    Format format = (Format) p.get(Format.class);

    if ( SafetyUtil.isEmpty(daoName) ) {
      DigUtil.outputException(x, 
        new GeneralException.Builder(x)
          .setMessage("DAO name is required.").build(), 
        format);
      return null;
    }

    DAO nSpecDAO = (DAO) x.get("AuthenticatedNSpecDAO");
    NSpec nspec = (NSpec) nSpecDAO.find(daoName);
    if ( nspec == null || ! nspec.getServe() ) {
      DigUtil.outputException(x, 
        new DAONotFoundException.Builder(x)
          .setMessage("DAO not found: " + daoName).build(), 
        format);
      return null;
    }

    // Check if the user is authorized to access the DAO.
    try {
      nspec.checkAuthorization(x);
    } catch (foam.nanos.auth.AuthorizationException e) {
      DigUtil.outputException(x,
        new foam.nanos.dig.exception.AuthorizationException.Builder(x)
          .setMessage(e.getMessage())
          .build(),
        format);
      return null;
    }

    DAO dao = (DAO) x.get(daoName);
    if ( dao == null ) {
      DigUtil.outputException(x, 
        new DAONotFoundException.Builder(x)
          .setMessage("DAO not found: " + daoName).build(), 
        format);
      return null;
    }

    return dao.inX(x);
  }

  protected void outputFObjects(X x, DAO dao, List fobjects)
  {
    HttpParameters p = x.get(HttpParameters.class);
    Format format = (Format) p.get(Format.class);
    PrintWriter out = x.get(PrintWriter.class);
    ClassInfo cInfo = dao.getOf();
    String output = null;
    
    if ( fobjects == null || fobjects.size() == 0 ) {
      if (Format.XML == format) {
        HttpServletResponse resp = x.get(HttpServletResponse.class);
        resp.setContentType("text/html");
      }
      out.println("[]");
      return;
    }

    switch (format) {
      case JSON:
      {
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
        
        output = outputterJson.toString();
        break;
      }
      case JSONJ:
      {
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
        
        output = outputterJsonJ.toString();
        break;
      }
      case XML:
      {
        HttpServletResponse resp = x.get(HttpServletResponse.class);
        resp.setContentType("application/xml");

        foam.lib.xml.Outputter outputterXml = new foam.lib.xml.Outputter(OutputterMode.NETWORK);
        outputterXml.output(fobjects.toArray());

        String simpleName = cInfo.getObjClass().getSimpleName().toString();
        output = "<" + simpleName + "s>"+ outputterXml.toString() + "</" + simpleName + "s>";
        break;
      }
      case CSV:
      {
        CSVOutputter outputterCsv = new foam.lib.csv.CSVOutputterImpl.Builder(x)
          .setOf(cInfo)
          .build();

        for ( Object o : fobjects ) {
          FObject fobj = (FObject) o;
          outputterCsv.outputFObject(x, fobj);
        }

        output = outputterCsv.toString();
        break;
      }
      case HTML:
      {
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

        output = outputterHtml.toString();
        break;
      }
    }

    out.println(output);
  }
}
