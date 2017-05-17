package foam.nanos.pm;

import foam.nanos.NanoService;

/**
 * Created by nick on 15/05/17.
 */
public interface PerformanceLogger extends NanoService {

  void log(PerformanceMonitor pm);

}
