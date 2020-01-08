package foam.u2.filter;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import java.util.*;

/*
  AccumulatorFilterService for StringFilterView to make all dao calls and filtering on the server side
*/
public class AccumulatorFilterService
  implements AccumulatorFilter {

    @Override
    public List<Object> fetchDAOContents(X x, String serviceName, PropertyInfo propertyInfo) {
      String daoKey = serviceName.split("/")[1];
      DAO dao = (DAO) x.get(daoKey);
      ArraySink sink = (ArraySink) dao.limit(100000).select(new ArraySink());

      // filter out duplicates and return first 100 distinct objects
      HashSet<Object> set = new HashSet<>();
      for ( int i = 0; i < sink.getArray().size(); i++ ) {
        FObject obj = (FObject) sink.getArray().get(i);
        set.add(obj.getProperty(propertyInfo.getName()));
      }

      List<Object> distinctList = new ArrayList<>(set);
      if ( distinctList.size() > 100 ) {
        return distinctList.subList(0, 100);
      }
      return distinctList;
    }
}
