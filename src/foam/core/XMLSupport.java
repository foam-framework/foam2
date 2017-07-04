package foam.core;

import org.w3c.dom.Element;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.w3c.dom.Document;
import java.io.FileReader;
import java.io.IOException;
import java.io.StringWriter;
import java.io.StringReader;
import java.io.File;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.*;

public class XMLSupport {

  public static List<FObject> fromXML(X x, XMLStreamReader xmlr) {
    List<FObject> objList = new ArrayList<FObject>();
    try {
      int eventType;
      while ( xmlr.hasNext() ) {
        eventType = xmlr.next();
        switch ( eventType ) {
          case XMLStreamConstants.START_ELEMENT:
            if ( xmlr.getLocalName().equals("object") ) {
              FObject obj = createObj(x, xmlr);
              if ( obj != null ) {
                objList.add(obj);
              }
            }
            break;
        }
      }
      xmlr.close();
    } catch (XMLStreamException ex) {
    }
    return objList;
  }

  public static FObject createObj ( X x, XMLStreamReader xmlr ) {
    Object clsInstance = null;
    try {
      // Create new fObject
      String objClass = xmlr.getAttributeValue(null, "class");
      Class cls = Class.forName(objClass);
      clsInstance = x.create(cls);
      // Object properties
      copyFromXML(x, (FObject) clsInstance, xmlr);
    } catch (ClassNotFoundException ex) {

    } catch (XMLStreamException ex ) {

    }
    return (FObject) clsInstance;
  }

  public static List<FObject> fromXML(X x, String fileName) throws IOException {
    XMLInputFactory xmlInputFactory = XMLInputFactory.newInstance();
    XMLStreamReader xmlr = null;
    try {
      xmlr = xmlInputFactory.createXMLStreamReader(new FileReader(fileName));
    } catch (IOException ex) {
      throw new IOException("Could not create/file with given fileName");
    } catch (XMLStreamException ex) {

    }
    return fromXML(x, xmlr);
  }

  public static void copyFromXML(X x, FObject obj, XMLStreamReader reader) throws XMLStreamException {
    try {
      PropertyInfo prop = null;
      while ( reader.hasNext() ) {
        int eventType;
        eventType = reader.next();
        switch ( eventType ) {
          case XMLStreamConstants.START_ELEMENT:
            ClassInfo cInfo = obj.getClassInfo();
            prop = (PropertyInfo) cInfo.getAxiomByName(reader.getLocalName());
            if ( prop != null ) {
              prop.set(obj, prop.fromXML(x, reader));
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

  public static void toXML(List<FObject> objList, Document doc) {
    Iterator i = objList.iterator();
    Element rootElement = doc.createElement("objects");
    doc.appendChild(rootElement);

    while ( i.hasNext() ) {
      toXML((FObject) i.next(), doc) ;
    }
  }

  public static void toXML(FObject obj, Document doc) {
    Element objElement = doc.createElement("object");
    objElement.setAttribute("class", obj.getClass().toString().replaceAll("class ", ""));
    if ( doc.hasChildNodes() ) {
      Element root = doc.getDocumentElement();
      root.appendChild(objElement);
    } else {
      doc.appendChild(objElement);
    }
    writeToXML(obj, doc, objElement);
  }

  // Write properties from given FObject
  public static void writeToXML(FObject obj, Document doc, Element objElement) {
    ClassInfo cInfo = obj.getClassInfo();
    List props = cInfo.getAxiomsByClass(PropertyInfo.class);
    Iterator propItr = props.iterator();

    while ( propItr.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) propItr.next();
      prop.toXML(obj, doc, objElement);
    }
  }

  // Returns XML string as partial XML string with only object tags
  public static String toXMLString(FObject obj) {
    XMLOutputFactory factory = XMLOutputFactory.newInstance();
    StringWriter sw = new StringWriter();
    try {
      XMLStreamWriter writer = factory.createXMLStreamWriter(sw);
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
      writer.writeStartDocument();
      Iterator i = objArray.iterator();
      writer.writeStartElement("objects");
      while ( i.hasNext() ) {
        toXML((FObject) i.next(), writer);
      }
      writer.writeEndElement();
      writer.writeEndDocument();
    } catch (XMLStreamException ex) {
    }
    return sw.toString();
  }
}
