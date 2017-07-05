package foam.core;

import foam.lib.parse.Parser;
import java.util.Comparator;
import java.util.Map;
import javax.xml.stream.XMLStreamReader;
import javax.xml.stream.XMLStreamWriter;

// ???: Why is this interface mutable?
public interface PropertyInfo
  extends foam.mlang.Expr, Comparator
{
  public PropertyInfo setClassInfo(ClassInfo p);
  public ClassInfo getClassInfo();

  public boolean getTransient();
  public boolean getRequired();
  public String getName();
  public Object get(Object obj);
  public void set(Object obj, Object value);
  public Parser jsonParser();
  public void toJSON(foam.lib.json.Outputter outputter, StringBuilder out, Object value);
  public void diff(FObject o1, FObject o2, Map diff, PropertyInfo prop);
  public void setFromString(Object obj, String value);
  public Object fromXML(X x, XMLStreamReader reader);
  public void toXML(FObject obj, Document doc, Element objElement);
}
