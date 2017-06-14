package foam.dao;

import foam.core.FObject;
import foam.core.XMLSupport;
import foam.core.X;
import foam.core.ProxyX;
import java.io.IOException;
import java.io.FileNotFoundException;
import javax.xml.stream.XMLStreamException;


public class XMLDAO
        extends MapDAO
{

    private String fileName;

    public void setFileName(String filename) {
      if (filename.contains(".xml")){
        fileName = System.getProperty("user.dir") + filename;
      } else {
        fileName = System.getProperty("user.dir") + filename.concat(".xml");
      }
    }

    public String getFileName() { return fileName; }

    // Read file and read data in the DAO
    public void init() throws IOException {
      X x = new ProxyX();
      this.setX(x);

      try {
        XMLSupport.XMLToFObject(fileName, this);
      } catch (IllegalAccessException | XMLStreamException | FileNotFoundException ex) {
      }
    }

    // Rewrites file when new object is put into DAO
    public FObject put(FObject obj) {
      this.setOf(obj.getClassInfo());
      FObject s =  super.put(obj);
      try {
        XMLSupport.FObjectToXML(fileName, this);
      } catch (XMLStreamException ex) {

      }
      return s;
    }

    // Used for xml to FObject conversion where re-write is not required
    public FObject putOnly(FObject obj) {
      this.setOf(obj.getClassInfo());
      return super.put(obj);
    }

    public FObject remove(FObject obj) {
      FObject s = super.remove(obj);
      try {
        XMLSupport.FObjectToXML(fileName, this);
      } catch (XMLStreamException ex) {

      }
      return s;
    }

    public void removeAll() {
      super.removeAll();
      try {
        XMLSupport.FObjectToXML(fileName, this);
      } catch (XMLStreamException ex) {

      }
    }

}
