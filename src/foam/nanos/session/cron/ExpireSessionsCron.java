package foam.nanos.session.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.logger.Logger;
import java.util.List;

import static foam.mlang.MLang.*;

public class ExpireSessionsCron implements ContextAgent {
  private Logger logger;

  @Override
  public void execute(X x) {
    logger = (Logger) x.get("logger");
    localSessionDAO = (DAO) x.get("localSessionDAO");
  }
}
