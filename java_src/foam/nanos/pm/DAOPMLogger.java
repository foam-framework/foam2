package foam.nanos.pm;

import foam.core.ContextAwareSupport;
import foam.dao.MapDAO;
import foam.nanos.NanoService;

/**
 * Created by nick on 17/05/17.
 */
public class DAOPMLogger extends ContextAwareSupport implements PMLogger, NanoService {

  @Override
  public void log(PM pm) {
    MapDAO dao = (MapDAO)getX().get("pminfodao");
    PMInfo pmi = new PMInfo()
            .setClsname(pm.getClassType().getName())
            .setPmname(pm.getName())
            .setMintime(pm.getTime())
            .setMaxtime(pm.getTime())
            .setTotaltime(pm.getTime())
            .setNumoccurrences(1);
    if(dao.find(pmi) == null) {
      dao.put(pmi);
    } else {
      PMInfo dpmi = (PMInfo) dao.find(pmi);
      if(pm.getTime() < dpmi.getMintime())
        dpmi.setMintime(pm.getTime());
      if(pm.getTime() > dpmi.getMaxtime())
        dpmi.setMaxtime(pm.getTime());
      dpmi.setNumoccurrences(dpmi.getNumoccurrences() + 1);
      dpmi.setTotaltime(dpmi.getTotaltime() + pm.getTime());
    }
  }

  @Override
  public void start() {
    MapDAO dao = new MapDAO();
    dao.setOf(PMInfo.getOwnClassInfo());
    dao.setX(getX());
    getX().put("pminfodao", dao);
  }
}
