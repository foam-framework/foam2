/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.dig;

import foam.core.*;
import foam.dao.AbstractDAO;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import foam.nanos.http.*;
import foam.util.SafetyUtil;

import java.io.PrintWriter;
import java.util.List;
import javax.servlet.http.HttpServletResponse;

public class DigSelectOperation extends DigOperation
{
  public DigSelectOperation(X x) {
    super(x);
  }

  public void execute(X x) {
    HttpParameters p = x.get(HttpParameters.class);
    Command command = (Command) p.get(Command.class);
    Format format = (Format) p.get(Format.class);
    String id = p.getParameter("id");
    String q = p.getParameter("q");
    String limit = p.getParameter("limit");
    
    DAO dao = getDAO(x);
    if ( dao == null )
      return;

    ClassInfo cInfo = dao.getOf();
    Predicate pred = new WebAgentQueryParser(cInfo).parse(x, q);
    logger_.debug("predicate", pred.getClass(), pred.toString());
    dao = dao.where(pred);

    if ( ! SafetyUtil.isEmpty(limit) ) {
      long l = Long.valueOf(limit);
      if ( l != AbstractDAO.MAX_SAFE_INTEGER ) {
        dao = dao.limit(l);
      }
    }

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
}
