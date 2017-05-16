package foam.dao;

import foam.core.FObject;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.pm.PMInfo;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by nick on 16/05/17.
 */
public class PMInfoDAO extends AbstractDAO {

  private Map<String, PMInfo> map_;

  public Map<String, PMInfo> getData() {
    if(map_ == null) {
      map_ = new HashMap<>();
    }
    return map_;
  }

  @Override
  public FObject put(FObject obj) {
    if(obj instanceof PMInfo) {
      PMInfo pmi = (PMInfo)obj;
      String key = pmi.getClsname()+":"+pmi.getPmname();
      if(getData().containsKey(key)) {
        PMInfo mappmi = getData().get(key);
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
        return map_.put(key, pmi);
      }
    } else {
      return null;
    }
  }

  @Override
  public FObject remove(FObject obj) {
    if(obj instanceof PMInfo) {
      String key = ((PMInfo)obj).getClsname() + ":" + ((PMInfo)obj).getPmname();
      return getData().remove(key);
    } else {
      return null;
    }
  }

  @Override
  public FObject find(Object id) {
    if(id instanceof PMInfo) {
      String key = ((PMInfo)id).getClsname() + ":" + ((PMInfo)id).getPmname();
      return getData().get(key);
    } else {
      return null;
    }
  }

  @Override
  public Sink select(Sink sink, Integer skip, Integer limit, Comparator order, Predicate predicate) {
    return null;
  }

  @Override
  public void removeAll(Integer skip, Integer limit, Comparator order, Predicate predicate) {
    map_.clear();
  }
}
