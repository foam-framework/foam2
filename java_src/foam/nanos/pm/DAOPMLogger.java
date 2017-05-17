package foam.nanos.pm;

import foam.core.ContextAwareSupport;
import foam.core.FObject;
import foam.dao.PMInfoDAO;

import java.util.Map;

/**
 * Created by nick on 17/05/17.
 */
public class DAOPMLogger extends ContextAwareSupport implements PerformanceLogger {

  private PMInfoDAO dao_;

  public PMInfoDAO getPMDAO() {
    return dao_;
  }

  @Override
  public void log(PerformanceMonitor pm) {
    PMInfo pmi = new PMInfo();
    pmi.setClsname(pm.getClassType().getName())
            .setPmname(pm.getName())
            .setMintime(pm.getTime())
            .setMaxtime(pm.getTime())
            .setTotaltime(pm.getTime())
            .setNumoccurrences(1);
    dao_.put(pmi);
  }

  @Override
  public void start() {
    dao_ = new PMInfoDAO();
    dao_.setX(getX());
  }
}
