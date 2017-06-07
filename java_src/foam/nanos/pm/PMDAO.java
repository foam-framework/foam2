package foam.nanos.pm;

import foam.dao.MapDAO;
import foam.dao.ProxyDAO;
import foam.nanos.NanoService;

/**
 * Created by nick on 06/06/17.
 */
public class PMDAO
  extends    ProxyDAO
  implements NanoService
{
  public static final String ServiceName = "pmInfoDAO";

  @Override
  public void start() {
    MapDAO mpd = new MapDAO();
    mpd.setOf(PMInfo.getOwnClassInfo());
    mpd.setX(getX());
    setDelegate(mpd);
  }
}
