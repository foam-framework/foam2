package foam.mlang;

import foam.util.StringUtil;
import java.lang.reflect.Method;

public class ReferenceExpressionHelper {
  public static Boolean isPropertyAReference(foam.core.PropertyInfo prop) {
    if ( prop instanceof foam.core.AbstractFObjectPropertyInfo )
      return false;
    
    return getFinderMethod(prop) != null;
  }

  public static  Method getFinderMethod(foam.core.PropertyInfo prop) {
    try {
      return prop.getClassInfo().getObjClass().getMethod("find" + StringUtil.capitalize(prop.getName()), foam.core.X.class);
    } catch( Throwable t ) {
      return null;
    }
  }
}