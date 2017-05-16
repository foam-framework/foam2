package foam.nanos.pm;

import foam.core.ContextAwareSupport;
import foam.dao.DAO;
import foam.dao.MapDAO;
import foam.nanos.NanoService;
import sun.misc.Perf;

/**
 * Created by nick on 15/05/17.
 */
public interface PerformanceLogger extends NanoService {

  void log(PerformanceMonitor pm);

}
