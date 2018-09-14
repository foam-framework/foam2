package foam.lib.xml;

import foam.core.*;
import foam.lib.json.OutputterMode;
import net.nanopay.iso20022.CreditTransferTransaction25;
import net.nanopay.iso20022.FIToFICustomerCreditTransferV06;
import net.nanopay.iso20022.GroupHeader70;
import net.nanopay.iso20022.Pacs00800106;
import org.apache.commons.io.IOUtils;

import java.io.*;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

public class Outputter
  implements foam.lib.Outputter
{
  protected PrintWriter   writer_;
  protected OutputterMode mode_;
  protected StringWriter  stringWriter_ = null;
  protected boolean       outputShortNames_ = false;
  protected boolean       outputDefaultValues_ = false;

  public Outputter() {
    this(OutputterMode.FULL);
  }

  public Outputter(OutputterMode mode) {
    this((PrintWriter) null, mode);
  }

  public Outputter(File file, OutputterMode mode) throws FileNotFoundException {
    this(new PrintWriter(file), mode);
  }

  public Outputter(PrintWriter writer, OutputterMode mode) {
    if ( writer == null ) {
      stringWriter_ = new StringWriter();
      writer = new PrintWriter(stringWriter_);
    }

    this.mode_   = mode;
    this.writer_ = writer;
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
    writer_.append(s);
  }

  protected void outputFObject(FObject o) {
    ClassInfo info = o.getClassInfo();
    List<PropertyInfo> properties = info.getAxiomsByClass(PropertyInfo.class).stream()
      .filter(propertyInfo -> ! propertyInfo.getXMLAttribute())
      .collect(Collectors.toList());

    List<PropertyInfo> attributes = info.getAxiomsByClass(PropertyInfo.class).stream()
      .filter(propertyInfo -> propertyInfo.getXMLAttribute())
      .collect(Collectors.toList());

    writer_.append("<")
      .append(o.getClass().getSimpleName());

    // output attributes
    for ( PropertyInfo prop : attributes ) {
      Object attr = prop.get(o);
      if ( attr == null ) continue;
      writer_.append(" ")
        .append(prop.getName())
        .append("=\"")
        .append(attr.toString())
        .append("\"");
    }
    writer_.append(">");

    // output properties
    for ( PropertyInfo prop : properties ) {
      outputProperty_(o, prop);
    }

    writer_.append("</")
      .append(o.getClass().getSimpleName())
      .append(">");
  }

  protected void outputNumber(Number value) {
    writer_.append(value.toString());
  }

  protected void outputBoolean(Boolean value) {
    writer_.append( value ? "true" : "false");
  }

  protected void outputDate(Date value) {

  }

  protected void outputEnum(Enum<?> value) {
    writer_.append(value.name());
  }

  protected void outputProperty_(FObject obj, PropertyInfo prop) {
    if ( mode_ == OutputterMode.NETWORK && prop.getNetworkTransient() ) return;
    if ( mode_ == OutputterMode.STORAGE && prop.getStorageTransient() ) return;
    if ( ! outputDefaultValues_ && ! prop.isSet(obj) ) return;

    Object value = prop.get(obj);
    if ( value == null || isArray(value) && ((Object[]) value).length == 0 ) {
      return;
    }

    outputProperty(value, prop);
  }

  protected void outputProperty(Object value, PropertyInfo prop) {
    if ( value instanceof FObject[] ) {
      FObject[] array = (FObject[]) value;
      for ( int i = 0 ; i < array.length ; i++ ) {
        prop.toXML(this, array[i]);
      }
    } else if ( value instanceof FObject ) {
      prop.toXML(this, value);
    } else {
      outputPrimitive(value, prop);
    }
  }

  protected void outputFObjectProperty(FObject value, PropertyInfo prop) {
    
  }

  protected void outputPrimitive(Object value, PropertyInfo prop) {
    String name = ! outputShortNames_ ? prop.getName() : prop.getShortName();
    writer_.append("<").append(name).append(">");
    prop.toXML(this, value);
    writer_.append("</").append(name).append(">");
  }

  public Outputter setOutputShortNames(boolean outputShortNames) {
    outputShortNames_ = outputShortNames;
    return this;
  }

  @Override
  public void close() throws IOException {
    IOUtils.closeQuietly(stringWriter_);
    IOUtils.closeQuietly(writer_);
  }

  @Override
  public void flush() throws IOException {
    if ( stringWriter_ != null ) stringWriter_.flush();
    if ( writer_ != null ) writer_.flush();
  }

  @Override
  public String toString() {
    return ( stringWriter_ != null ) ? stringWriter_.toString() : null;
  }

  public static void main(String[] args) {
    X x = EmptyX.instance();

    Outputter outputter = new Outputter(OutputterMode.STORAGE)
      .setOutputShortNames(true);

    Pacs00800106 pacs008 = new Pacs00800106.Builder(x)
      .setFIToFICstmrCdtTrf(new FIToFICustomerCreditTransferV06.Builder(x)
        .setGroupHeader(new GroupHeader70.Builder(x)
          .setCreationDateTime(new Date())
          .setControlSum(100.0)
          .setBatchBooking(true)
          .setNumberOfTransactions("2")
          .build())
        .setCreditTransferTransactionInformation(new CreditTransferTransaction25[]{
          new CreditTransferTransaction25.Builder(x)
            .setAcceptanceDateTime(new Date())
            .setExchangeRate(100.0)
            .build(),
          new CreditTransferTransaction25.Builder(x)
            .setAcceptanceDateTime(new Date())
            .setExchangeRate(125.0)
            .build()
        })
        .build())
      .build();

    System.out.println(outputter.stringify(pacs008));
  }
}
