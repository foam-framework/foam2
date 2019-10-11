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
    Date now = new Date();

    List<Session> expiredSessions = ((ArraySink) localSessionDAO.select(new ArraySink())).getArray();

    for ( Session session : expiredSessions ) {
      // This happens when the server is restarted. We don't journal the
      // 'lastUsed' property since it would take up an unacceptable amount of
      // space. That means that our session expiry calculations can't be fully
      // correct since we lose the 'lastUsed' info when a restart happens.
      if ( session.getLastUsed() == null ) {
        // Mark the session as last used now so the session won't sit around in
        // sessionDAO forever if it doesn't get used again. This will lead to
        // sessions lasting longer than intended if a server restart happens,
        // but this is a known trade-off to save space.
        session.setLastUsed(now);
      }

      if ( session.getLastUsed().getTime() + session.getTtl() <= now.getTime() ) {
        logger.debug("Destroyed expired session : " + (String) session.getId());
        localSessionDAO.remove(session);
      }
    }
  }
}
