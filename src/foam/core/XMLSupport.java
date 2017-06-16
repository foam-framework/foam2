package foam.core;

import com.sun.xml.internal.txw2.output.IndentingXMLStreamWriter;
import foam.dao.ListSink;
import foam.dao.XMLDAO;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import javax.xml.stream.*;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;

public class XMLSupport {

  // TODO: Planning to add support for other date formats in the future

  public static List<FObject> fromXML(XMLStreamReader xmlr) {
    List<FObject> objList = new ArrayList<FObject>();
    try {
      int eventType;
      Object clsInstance = null;
      while ( xmlr.hasNext() ) {
        eventType = xmlr.next();
        switch ( eventType ) {
          case XMLStreamConstants.START_DOCUMENT:
            break;
          case XMLStreamConstants.START_ELEMENT:
            if ( xmlr.getLocalName().equals("object") ) {
              // Create new fObject
              String objClass = xmlr.getAttributeValue(null, "class");
              Class<?> cls;

              try {
                cls = Class.forName(objClass);
                clsInstance = cls.newInstance();
              } catch (ClassNotFoundException | InstantiationException ex) {

              }
              // Object properties
              copyFromXML((FObject) clsInstance, xmlr);
              if ( clsInstance != null ) {
                objList.add((FObject) clsInstance);
              }
            }
            break;
          case XMLStreamConstants.END_ELEMENT:
            break;
          case XMLStreamConstants.END_DOCUMENT:
            break;
        }
      }
      xmlr.close();
    } catch (XMLStreamException | IllegalAccessException ex) {
    }
    return objList;
  }

  public static List<FObject> fromXML(String fileName) throws IOException {
    XMLInputFactory xmlInputFactory = XMLInputFactory.newInstance();
    XMLStreamReader xmlr = null;
    try {
      xmlr = xmlInputFactory.createXMLStreamReader(new FileReader(fileName));
    } catch (IOException ex) {
      throw new IOException("Could not create/file with given fileName");
    } catch (XMLStreamException ex) {

    }
    return fromXML(xmlr);
  }

  public static void copyFromXML(FObject obj, XMLStreamReader reader) throws XMLStreamException {
    try {
      PropertyInfo prop = null;
      while ( reader.hasNext() ) {
        int eventType;
        eventType = reader.next();
        switch ( eventType ) {
          case XMLStreamConstants.START_ELEMENT:
            prop = (PropertyInfo) obj.getClassInfo().getAxiomByName(reader.getLocalName());
            if ( prop == null ) {
              throw new XMLStreamException("Could not find property " + reader.getLocalName());
            }
            break;
          case XMLStreamConstants.CHARACTERS:
            if ( prop != null ) {
              prop.setFromString(obj, reader.getText());
              prop = null;
            }
            break;
          case XMLStreamConstants.END_ELEMENT:
            if ( reader.getLocalName().equals("object") ) {
              return;
            }
            break;
        }
      }
    } catch (XMLStreamException ex) {
      throw new XMLStreamException("Premature end of xml file");
    }
  }

  public static void toXML(List<FObject> objList, XMLStreamWriter xmlStreamWriter) {
    try {
      xmlStreamWriter = new IndentingXMLStreamWriter(xmlStreamWriter);
      Iterator i = objList.iterator();
      xmlStreamWriter.writeStartDocument();
      //Root tag
      xmlStreamWriter.writeStartElement("objects");

      while ( i.hasNext() ) {
        toXML((FObject) i.next(), xmlStreamWriter);
      }

      xmlStreamWriter.writeEndElement();
      xmlStreamWriter.writeEndDocument();

    } catch (XMLStreamException ex) {
    }
  }

  public static void toXML(FObject obj, XMLStreamWriter xmlStreamWriter) throws XMLStreamException {
    try {
      xmlStreamWriter.writeStartElement("object");
      xmlStreamWriter.writeAttribute("class", obj.getClass().toString().replaceAll("class ", ""));
      writeObjectProperties(obj, xmlStreamWriter);
      xmlStreamWriter.writeEndElement();
    } catch (XMLStreamException ex) {
      throw new XMLStreamException("Error while writing xml file");
    }
  }

  // Write properties from given FObject
  public static void writeObjectProperties(FObject obj, XMLStreamWriter writer) {
    List props = obj.getClassInfo().getAxioms();
    Iterator propItr = props.iterator();

    try {
      while ( propItr.hasNext() ) {
        PropertyInfo currentProp = (PropertyInfo) propItr.next();
        Object value = currentProp.f(obj);
        if (currentProp.getTransient() ) continue;
        if ( value != null && value != "" ) {
          writer.writeStartElement(currentProp.getName());
          // Case for date
          if ( value instanceof java.util.Date ) {
            String dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
            LocalDateTime ldt = LocalDateTime.ofInstant(((Date) value).toInstant(), ZoneId.of("UTC"));
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(dateFormat).withZone(java.time.ZoneOffset.UTC);
            String s = formatter.format(ldt);
            writer.writeCharacters(s);
          } else {
            writer.writeCharacters(value.toString());
          }
          writer.writeEndElement();
        }
      }
    } catch (XMLStreamException ex) {
    }
  }

  // Returns XML string as partial XML string with only object tags
  public static String toXMLString(FObject obj) {
    XMLOutputFactory factory = XMLOutputFactory.newInstance();
    StringWriter sw = new StringWriter();
    try {
      XMLStreamWriter writer = factory.createXMLStreamWriter(sw);
      writer = new IndentingXMLStreamWriter(writer);
      toXML(obj, writer);
    } catch (XMLStreamException ex) {
    }
    return sw.toString();
  }

  // Returns XML string as full XML document string with document tags
  public static String toXMLString(List<FObject> objArray) {
    XMLOutputFactory factory = XMLOutputFactory.newInstance();
    StringWriter sw = new StringWriter();
    try {
      XMLStreamWriter writer = factory.createXMLStreamWriter(sw);
      writer = new IndentingXMLStreamWriter(writer);
      writer.writeStartDocument();
      Iterator i = objArray.iterator();
      while ( i.hasNext() ) {
        toXML((FObject) i.next(), writer);
      }
      writer.writeEndDocument();
    } catch (XMLStreamException ex) {
    }
    return sw.toString();
  }
}
