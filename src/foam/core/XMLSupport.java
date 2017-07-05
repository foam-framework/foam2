/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import org.w3c.dom.Element;
import org.w3c.dom.Document;
import java.io.FileReader;
import java.io.IOException;
import java.io.StringWriter;
import java.io.File;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.*;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

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

  public static void toXML(List<FObject> objList, Document doc, Element e) {
    Iterator i = objList.iterator();
    Element rootElement = doc.createElement("objects");
    // Case for nested object arrays
    if (doc.hasChildNodes() ) {
      e.appendChild(rootElement);
    } else {
      doc.appendChild(rootElement);
    }

    while ( i.hasNext() ) {
      toXML((FObject) i.next(), doc, e) ;
    }
  }

  public static void toXML(FObject obj, Document doc, Element e) {
    Element objElement = doc.createElement("object");
    objElement.setAttribute("class", obj.getClass().toString().replaceAll("class ", ""));
    writeToXML(obj, doc, objElement);
    if ( e != null ) {
      // Append to element (nested object)
      e.appendChild(objElement);
    } else if ( doc.hasChildNodes() ) {
      // Append to existing root
      Element root = doc.getDocumentElement();
      root.appendChild(objElement);
    } else {
      // New root element
      doc.appendChild(objElement);
    }
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

  //Specific case for Enum
  public static void enumXML (Enum o, Document doc, Element e) {
    Element enumElement = doc.createElement("ordinal");
    enumElement.appendChild(doc.createTextNode(Integer.toString(o.ordinal())));
    e.appendChild(enumElement);
  }

  public static void toXMLFile (Document doc, String fileName) {
    try {
      DOMSource source = new DOMSource(doc);
      StreamResult result = new StreamResult(new File(fileName));
      Transformer transformer = createTransformer();
      transformer.transform(source, result);
    } catch (TransformerConfigurationException ex) {
    } catch (TransformerException ex ) {
    }
  }

  // Returns XML string as full XML document string with document tags
  public static String toXMLString(List<FObject> objArray) {
    Document doc = createDoc();
    toXML(objArray, doc);
    return toXMLString(doc);
  }

  // Returns XML string as partial XML string with only object tags
  public static String toXMLString(FObject obj) {
    Document doc = createDoc();
    toXML(obj, doc);
    return toXMLString(doc);
  }

  public static Document createDoc() {
    Document doc = null;
    try {
      DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
      DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
      doc = dBuilder.newDocument();
    } catch (ParserConfigurationException ex) {
    }
    return doc;
  }

  public static Transformer createTransformer() {
    Transformer transformer = null;
    try {
      TransformerFactory tf = TransformerFactory.newInstance();
      transformer = tf.newTransformer();
      transformer.setOutputProperty(OutputKeys.INDENT, "yes");
      transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");
    } catch (TransformerConfigurationException ex) {
    }
    return transformer;
  }

  public static String toXMLString (Document doc) {
    try {
      DOMSource domSource = new DOMSource(doc);
      StringWriter writer = new StringWriter();
      StreamResult result = new StreamResult(writer);
      Transformer transformer = createTransformer();
      transformer.transform(domSource, result);
      return writer.toString();
    } catch (TransformerException ex) {
    }
    return null;
  }
}