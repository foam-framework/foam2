package foam.core;

import java.io.FileReader;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.FileWriter;
import com.sun.xml.internal.txw2.output.IndentingXMLStreamWriter;
import foam.dao.XMLDAO;
import foam.dao.ListSink;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.ZoneId;

public class XMLSupport {

    // TODO: Planning to add support for other date formats in the future

    // Parsing xml for FObjects and inserting into provided XMLDAO
    public static void XMLToFObject (String fileName, XMLDAO xmlDAO) throws FileNotFoundException, XMLStreamException, IllegalAccessException {
        XMLInputFactory xmlInputFactory = XMLInputFactory.newInstance();
        try {
            XMLStreamReader xmlr = xmlInputFactory.createXMLStreamReader(new FileReader(fileName));
            int eventType;
            Object clsInstance = null;
            while (xmlr.hasNext()) {
                eventType = xmlr.next();
                switch (eventType) {
                    case XMLStreamConstants.START_DOCUMENT:
                        break;
                    case XMLStreamConstants.START_ELEMENT:
                        if (xmlr.getLocalName().equals("object")){
                            // Create new fObject
                            String objClass = xmlr.getAttributeValue(null, "class");
                            Class<?> cls;

                            try {
                                cls = Class.forName(objClass);
                                clsInstance = cls.newInstance();
                                ClassInfo csInfo = ((FObject)clsInstance).getClassInfo();
                                xmlDAO.setOf(csInfo);
                            } catch (ClassNotFoundException | InstantiationException ex) {

                            }
                            // Object properties
                            fillProperties((FObject) clsInstance, xmlr);
                            if (clsInstance != null){
                                xmlDAO.putOnly( (FObject) clsInstance);
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
        } catch (FileNotFoundException ex) {
            throw new FileNotFoundException("Xml file not found with given filename: " + fileName);
        } catch (XMLStreamException ex) {
            throw new XMLStreamException("Premature end of xml file");
        }
    }

    private static void fillProperties(FObject obj, XMLStreamReader reader) throws XMLStreamException {
        try {
            int eventType;
            PropertyInfo prop = null;
            while (reader.hasNext()) {
                eventType = reader.next();
                switch (eventType) {
                    case XMLStreamConstants.START_ELEMENT:
                        prop = (PropertyInfo) obj.getClassInfo().getAxiomByName(reader.getLocalName());
                        if (prop == null) {
                            throw new XMLStreamException("Could not find property " + reader.getLocalName());
                        }
                        break;
                    case XMLStreamConstants.CHARACTERS:
                        if (prop != null) {
                            prop.set(obj, reader.getText());
                            prop = null;
                        }
                        break;
                    case XMLStreamConstants.END_ELEMENT:
                        if(reader.getLocalName().equals("object")) { return; }
                        break;
                }
            }
        } catch (XMLStreamException ex ) {
            throw new XMLStreamException("Premature end of xml file");
        }
    }

    // FObjects taken from XMLDAO and written to file with specified filename given
    public static void FObjectToXML (String fileName, XMLDAO xmlDAO) throws XMLStreamException {
        // Returns all objects into a list iterator
        ListSink ls = new ListSink();
        xmlDAO.select(ls);
        List objList = ls.getData();
        Iterator objItr = objList.iterator();

        try {
            XMLOutputFactory xMLOutputFactory = XMLOutputFactory.newInstance();
            XMLStreamWriter xmlStreamWriter = xMLOutputFactory.createXMLStreamWriter(new FileWriter(fileName));
            xmlStreamWriter = new IndentingXMLStreamWriter(xmlStreamWriter);

            xmlStreamWriter.writeStartDocument();
            //Root tag
            xmlStreamWriter.writeStartElement("objects");

            while (objItr.hasNext()) {
                FObject currentObj = (FObject)objItr.next();
                xmlStreamWriter.writeStartElement("object");
                xmlStreamWriter.writeAttribute("class", currentObj.getClass().toString().replaceAll("class ",""));

                List props = currentObj.getClassInfo().getAxioms();
                Iterator propItr = props.iterator();

                while (propItr.hasNext()) {
                    PropertyInfo currentProp = (PropertyInfo)propItr.next();
                    Object value = currentProp.f(currentObj);
                    if (value != null && value != "" ) {
                        xmlStreamWriter.writeStartElement(currentProp.getName());
                        // Case for date
                        if (value instanceof java.util.Date) {
                            String dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
                            LocalDateTime ldt = LocalDateTime.ofInstant(((Date) value).toInstant(), ZoneId.of("UTC"));
                            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(dateFormat).withZone(java.time.ZoneOffset.UTC);
                            String s = formatter.format(ldt);
                            xmlStreamWriter.writeCharacters(s);
                        } else {
                            xmlStreamWriter.writeCharacters(value.toString());
                        }
                        xmlStreamWriter.writeEndElement();
                    }
                }

                xmlStreamWriter.writeEndElement();
            }

            xmlStreamWriter.writeEndElement();
            xmlStreamWriter.writeEndDocument();
            xmlStreamWriter.flush();
            xmlStreamWriter.close();

        } catch (XMLStreamException ex) {
            throw new XMLStreamException("Error while writing xml file");
        } catch (IOException ex) {
        }
    }
}
