package foam.lib.xml;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.lib.json.OutputterMode;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Date;
import java.util.List;
import java.util.function.Predicate;
import java.util.stream.Collectors;

public class Outputter
  implements foam.lib.Outputter
{
  protected PrintWriter   writer_;
  protected OutputterMode mode_;
  protected StringWriter  stringWriter_ = null;
  protected boolean       outputShortNames_ = false;
  protected boolean       outputDefaultValues_ = false;

  public Outputter(OutputterMode mode) {

  }

  protected void initWriter() {
    if ( stringWriter_ == null ) {
      stringWriter_ = new StringWriter();
      writer_ = new PrintWriter(stringWriter_);
    }
    stringWriter_.getBuffer().setLength(0);
  }

  @Override
  public String stringify(FObject obj) {
    initWriter();
    outputFObject(obj);
    return this.toString();
  }

  @Override
  public void output(Object value) {
    if ( value instanceof String ) {
      outputString((String) value);
    } else if ( value instanceof FObject ) {
      outputFObject((FObject) value);
    } else if ( value instanceof Number ) {
      outputNumber((Number) value);
    } else if ( value instanceof Boolean ) {
      outputBoolean((Boolean) value);
    } else if ( value instanceof java.util.Date ) {
      outputDate((java.util.Date) value);
    } else if ( value instanceof Enum<?> ) {
      outputEnum((Enum<?>) value);
    }
  }

  protected boolean isArray(Object value) {
    return ( value != null ) &&
      ( value.getClass() != null ) &&
      value.getClass().isArray();
  }

  protected void outputString(String s) {

  }

  protected void outputFObject(FObject o) {
    ClassInfo info = o.getClassInfo();
    List<PropertyInfo> properties = info.getAxiomsByClass(PropertyInfo.class);
    List<PropertyInfo> attributes = properties.stream()
      .filter(prop -> prop.getXMLAttribute() && prop.get(o) != null)
      .collect(Collectors.toList());

    writer_.append("<")
      .append(info.getClass().getSimpleName());

    // output attributes
    for ( PropertyInfo prop : attributes ) {
      Object attr = prop.get(o);
      writer_.append(" ")
        .append(prop.getName())
        .append("=\"")
        .append(attr.toString())
        .append("\"");
    }
    writer_.append(">");
  }

  protected void outputNumber(Number value) {

  }

  protected void outputBoolean(Boolean value) {

  }

  protected void outputDate(Date value) {

  }

  protected void outputEnum(Enum<?> value) {

  }

  @Override
  public void close() throws IOException {

  }

  @Override
  public void flush() throws IOException {

  }
}
