package foam.dao;

import foam.core.FObject;
import foam.nanos.pm.PMInfo;

import java.util.Map;

/**
 * Created by nick on 16/05/17.
 */
public class PMInfoDAO extends MapDAO {

  @Override
  public FObject put(FObject obj) {
    if(obj instanceof PMInfo) {
      PMInfo pmi = (PMInfo)obj;
      String key = pmi.getClsname()+":"+pmi.getPmname();
      if(getData().containsKey(key)) {
        PMInfo mappmi = (PMInfo) getData().get(key);
        if(pmi.getMintime() < mappmi.getMintime()) {
          mappmi.setMintime(pmi.getMintime());
        }
        if(pmi.getMaxtime() > mappmi.getMaxtime()) {
          mappmi.setMaxtime(pmi.getMaxtime());
        }
        mappmi.setNumoccurrences(pmi.getNumoccurrences() + mappmi.getNumoccurrences());
        mappmi.setTotaltime(pmi.getTotaltime() + mappmi.getTotaltime());
        return mappmi;
      } else {
        System.out.println("Inserting new pminfo on " + key);
        return getData().put(key, pmi);
      }
    } else {
      return null;
    }
  }

}
