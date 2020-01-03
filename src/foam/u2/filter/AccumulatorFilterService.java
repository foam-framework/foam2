package foam.u2.filter;

import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import java.util.List;
import java.util.stream.Collectors;

public class AccumulatorFilterService
  implements AccumulatorFilter 
{
  @Override
  public List<Object> fetchDAOContents(X x, DAO dao, PropertyInfo propertyInfo) {
    ArraySink sink = (ArraySink) dao.select(new ArraySink());
    List<Object> daoContents = sink.getArray();
    return daoContents.stream().distinct().collect(Collectors.toList());
  }
}
