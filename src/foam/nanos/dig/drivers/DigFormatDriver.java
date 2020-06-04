/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.dig.drivers;

import foam.core.*;
import foam.dao.AbstractDAO;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.lib.csv.CSVOutputter;
import foam.lib.json.OutputterMode;
import foam.nanos.boot.NSpec;
import foam.nanos.dig.*;
import foam.nanos.dig.exception.*;
import foam.nanos.http.*;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import foam.util.SafetyUtil;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import javax.servlet.http.HttpServletResponse;

public abstract class DigFormatDriver extends ContextAwareSupport
{
  public static final long MAX_PAGE_SIZE = 1000;

  protected Logger logger_;
  protected Format format_;

  protected DigFormatDriver(X x, Format format) {
    setX(x);

    logger_ = new PrefixLogger(new Object[] { this.getClass().getSimpleName() }, (Logger) x.get("logger"));
    format_ = format;
  }

  // Parse data according to the given format_
  protected abstract List parseFObjects(X x, DAO dao, String data) throws java.lang.Exception;

  // Output the FObjects according to the given format_
  protected abstract void outputFObjects(X x, DAO dao, List fobjects);

  public void put(X x) {
    try {
      DAO dao = getDAO(x);
      if ( dao == null )
        return;

      HttpParameters p = x.get(HttpParameters.class);
      String data = p.getParameter("data");

      // Check if the data is empty
      if ( SafetyUtil.isEmpty(data) ) {
        DigUtil.outputException(x, new EmptyDataException.Builder(x).build(), format_);
        return;
      }

      List fobjects = parseFObjects(x, dao, data);
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
    catch (java.lang.Exception e) {
      throw new RuntimeException(e);
    }
  }

  public void select(X x) {
    HttpParameters p = x.get(HttpParameters.class);
    Command command = (Command) p.get(Command.class);
    Format format_ = (Format) p.get(Format.class);
    String id = p.getParameter("id");
    String q = p.getParameter("q");
    String limit = p.getParameter("limit");
    String skip = p.getParameter("skip");
    
    DAO dao = getDAO(x);
    if ( dao == null )
      return;

    ClassInfo cInfo = dao.getOf();
    Predicate pred = new WebAgentQueryParser(cInfo).parse(x, q);
    logger_.debug("predicate", pred.getClass(), pred.toString());
    dao = dao.where(pred);

    if ( ! SafetyUtil.isEmpty(skip) ) {
      long s = Long.valueOf(skip);
      if ( s > 0 && s != AbstractDAO.MAX_SAFE_INTEGER ) {
        dao = dao.skip(s);
      }
    }

    long pageSize = DigFormatDriver.MAX_PAGE_SIZE;
    if ( ! SafetyUtil.isEmpty(limit) ) {
      long l = Long.valueOf(limit);
      if ( l != AbstractDAO.MAX_SAFE_INTEGER && l < pageSize) {
        pageSize = l;
      }
    }
    dao = dao.limit(pageSize);

    PropertyInfo idProp = (PropertyInfo) cInfo.getAxiomByName("id");
    ArraySink sink = (ArraySink) ( ! SafetyUtil.isEmpty(id) ?
      dao.where(MLang.EQ(idProp, id)).select(new ArraySink()) :
      dao.select(new ArraySink()));

    List fobjects = sink.getArray();
    logger_.debug(this.getClass().getSimpleName(), "Number of FObjects selected: " + fobjects.size());
    
    outputFObjects(x, dao, fobjects);

    PrintWriter out = x.get(PrintWriter.class);
    out.println();
    out.flush();
    logger_.debug(this.getClass().getSimpleName(), "success");
    
    HttpServletResponse resp = x.get(HttpServletResponse.class);
    resp.setStatus(HttpServletResponse.SC_OK);
  }

  public void remove(X x) {
    HttpParameters p = x.get(HttpParameters.class);
    Format format_ = (Format) p.get(Format.class);
    String id = p.getParameter("id");
    
    DAO dao = getDAO(x);
    if ( dao == null )
      return;
    
    if ( SafetyUtil.isEmpty(id) ) {
      DigUtil.outputException(x, new UnknownIdException.Builder(x).build(), format_);
      return;
    }

    ClassInfo cInfo = dao.getOf();
    PropertyInfo idProp = (PropertyInfo) cInfo.getAxiomByName("id");
    Object idObj = idProp.fromString(id);
    FObject targetFobj = dao.find(idObj);

    if ( targetFobj == null ) {
      DigUtil.outputException(x, new UnknownIdException.Builder(x).build(), format_);
      return;
    } 

    dao.remove(targetFobj);
    DigUtil.outputException(x, new DigSuccessMessage.Builder(x).setMessage("Success").build(), format_);

    logger_.debug(this.getClass().getSimpleName(), "success");
  }

  protected DAO getDAO(X x) {
    HttpParameters p = x.get(HttpParameters.class);
    String daoName = p.getParameter("dao");
    Format format_ = (Format) p.get(Format.class);

    if ( SafetyUtil.isEmpty(daoName) ) {
      DigUtil.outputException(x, 
        new GeneralException.Builder(x)
          .setMessage("DAO name is required.").build(), 
        format_);
      return null;
    }

    DAO nSpecDAO = (DAO) x.get("AuthenticatedNSpecDAO");
    NSpec nspec = (NSpec) nSpecDAO.find(daoName);
    if ( nspec == null || ! nspec.getServe() ) {
      DigUtil.outputException(x, 
        new DAONotFoundException.Builder(x)
          .setMessage("DAO not found: " + daoName).build(), 
        format_);
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
        format_);
      return null;
    }

    DAO dao = (DAO) x.get(daoName);
    if ( dao == null ) {
      DigUtil.outputException(x, 
        new DAONotFoundException.Builder(x)
          .setMessage("DAO not found: " + daoName).build(), 
        format_);
      return null;
    }

    return dao.inX(x);
  }

  /**
   * Put an FObject to the DAO, but merge with current object stored in DAO
   * if it exists.
   * TODO: improve synchronization
   */
  protected synchronized FObject daoPut(DAO dao, FObject obj)
    throws java.lang.Exception
  {
    FObject oldObj = dao.find(obj);
    return dao.put(oldObj == null ? obj : oldObj.copyFrom(obj));
  }
}
