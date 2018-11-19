package foam.dao;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.XMLSupport;
import org.w3c.dom.Document;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Iterator;
import java.util.List;

public class XMLDAO
  extends MapDAO
{
  protected String fileName;

  public void setFileName(String filename) {
    if ( filename.endsWith(".xml") ) {
      fileName = System.getProperty("user.dir") + filename;
    } else {
      fileName = System.getProperty("user.dir") + filename.concat(".xml");
    }
  }

  public String getFileName() { return fileName; }

  // Read file and read data in the DAO
  public void init() throws IOException {
    List<FObject> objList;

    try {
      objList = XMLSupport.fromXML(getX(), fileName);
      Iterator i = objList.iterator();
      while ( i.hasNext() ) {
        FObject currentObj = (FObject)i.next();
        ClassInfo clsInfo = currentObj.getClassInfo();
        setOf(clsInfo);
        putOnly(currentObj);
      }
    } catch ( FileNotFoundException ex) {
    }
  }

  // Rewrites file when new object is put into DAO
  public FObject put(FObject obj) {
    setOf(obj.getClassInfo());
    FObject s = super.put(obj);
    saveToXML();
    return s;
  }

  // Used for xml to FObject conversion where re-write is not required
  public FObject putOnly(FObject obj) {
    setOf(obj.getClassInfo());
    return super.put(obj);
  }

  public FObject remove(FObject obj) {
    FObject s = super.remove(obj);
    saveToXML();
    return s;
  }

  public void removeAll() {
    super.removeAll();
    saveToXML();
  }

  public synchronized void saveToXML () {
    ArraySink ls = (ArraySink) select(new ArraySink());

    try {
      DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
      DocumentBuilder        dBuilder  = dbFactory.newDocumentBuilder();
      Document               doc       = dBuilder.newDocument();

//      XMLSupport.toXML(ls.getArray(), doc, null);
//      XMLSupport.toXMLFile(doc, fileName);
    } catch (ParserConfigurationException ex) {
    }
  }
}
