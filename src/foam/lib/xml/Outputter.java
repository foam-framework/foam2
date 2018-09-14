package foam.lib.xml;

import foam.core.*;
import foam.lib.json.OutputterMode;
import net.nanopay.iso20022.*;
import org.apache.commons.io.IOUtils;

import java.io.*;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.function.Predicate;
import java.util.stream.Collectors;

public class Outputter
  implements foam.lib.Outputter
{
  protected static ThreadLocal<SimpleDateFormat> sdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
      df.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
      return df;
    }
  };

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
    output(obj);
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

    // output properties
    for ( PropertyInfo prop : properties ) {
      outputProperty_(o, prop);
    }
  }

  protected void outputNumber(Number value) {
    writer_.append(value.toString());
  }

  protected void outputBoolean(Boolean value) {
    writer_.append( value ? "true" : "false");
  }

  protected void outputDate(Date value) {
    writer_.append(sdf.get().format(value));
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
    if ( value instanceof Object[] ) {
      outputArrayProperty((Object[]) value, prop);
    } else if ( value instanceof FObject ) {
      outputFObjectProperty((FObject) value, prop);
    } else {
      outputPrimitiveProperty(value, prop);
    }
  }

  protected void outputArrayProperty(Object[] values, PropertyInfo prop) {
    for ( Object value : values ) {
      outputProperty(value, prop);
    }
  }

  protected void outputFObjectProperty(FObject value, PropertyInfo prop) {
    Object xmlValue;
    if ( ( xmlValue = value.getProperty("xmlValue") ) == null ) {
      writer_.append("<").append(getPropertyName(prop)).append(">");
      prop.toXML(this, value);
      writer_.append("</").append(getPropertyName(prop)).append(">");
      return;
    }

    // write property name and attributes
    writer_.append("<").append(getPropertyName(prop));
    outputAttributes(value);
    writer_.append(">");

    if ( xmlValue instanceof FObject ) {
      prop.toXML(this, value);
    } else {
      prop.toXML(this, xmlValue);
    }

    writer_.append("</").append(getPropertyName(prop)).append(">");
  }

  protected void outputPrimitiveProperty(Object value, PropertyInfo prop) {
    writer_.append("<").append(getPropertyName(prop)).append(">");
    prop.toXML(this, value);
    writer_.append("</").append(getPropertyName(prop)).append(">");
  }

  protected void outputAttributes(FObject obj) {
    List<PropertyInfo> attributes = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class)
      .stream().filter(PropertyInfo::getXMLAttribute)
      .collect(Collectors.toList());

    for ( PropertyInfo attribute : attributes ) {
      Object value = attribute.get(obj);
      if ( value == null ) continue;

      writer_.append(" ")
        .append(getPropertyName(attribute))
        .append("=\"");
      output(value);
      writer_.append("\"");
    }
  }

  protected String getPropertyName(PropertyInfo prop) {
    return ! outputShortNames_ ? prop.getName() : prop.getShortName();
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
          .setTotalInterbankSettlementAmount(new ActiveCurrencyAndAmount.Builder(x)
            .setCcy("USD")
            .setXmlValue(100.0)
            .build())
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
