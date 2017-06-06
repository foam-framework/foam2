package foam.nanos.pm;

import foam.dao.ProxyDAO;
import foam.nanos.NanoService;

/**
 * Created by nick on 06/06/17.
 */
public class PMDAO
  extends ProxyDAO
  implements NanoService
{

  public static final String ServiceName = "pmDAO";

  @Override
  public void start() {}
}
