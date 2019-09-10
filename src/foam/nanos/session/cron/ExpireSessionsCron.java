package foam.nanos.session.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.logger.Logger;
import java.util.List;
import java.util.Date;
import foam.nanos.session.Session;

import static foam.mlang.MLang.*;

public class ExpireSessionsCron implements ContextAgent {

  private Logger logger;
  private DAO localSessionDAO;

  @Override
  public void execute(X x) {

    logger = (Logger) x.get("logger");
    localSessionDAO = (DAO) x.get("localSessionDAO");

    List<Session> expiredSessions = ((ArraySink) localSessionDAO.where(GT(Session.TTL, 0)).select(new ArraySink())).getArray();

    for ( Session session : expiredSessions ) {
      if ( session.getLastUsed() != null && session.getLastUsed().getTime() + Math.max(session.getTtl(), 0L) <= (new Date()).getTime() ) {
        logger.debug("Destroyed expired session : " + (String) session.getId());
        localSessionDAO.remove(session);
      }
    }
  }
}
