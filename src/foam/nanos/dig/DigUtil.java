package foam.nanos.dig;

import foam.core.X;
import foam.lib.*;
import foam.lib.csv.CSVOutputter;
import foam.lib.json.JSONParser;
import foam.lib.json.Outputter;
import foam.lib.json.OutputterMode;
import foam.nanos.dig.exception.DigErrorMessage;
import foam.nanos.http.Format;

import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

public class DigUtil {
  public static void outputException(X x, HttpServletResponse resp, Format format, PrintWriter out, DigErrorMessage error) {
    if ( resp == null ) resp = x.get(HttpServletResponse.class);
    if ( out == null ) out = x.get(PrintWriter.class);

    resp.setStatus(Integer.parseInt(error.getStatus()));
    if ( format == Format.JSON ) {
      //output error in json format
      resp.setContentType("application/json");

      JSONParser jsonParser = new JSONParser();
      jsonParser.setX(x);
      Outputter outputterJson = new Outputter(x).setPropertyPredicate(new AndPropertyPredicate(x, new PropertyPredicate[] {new NetworkPropertyPredicate(), new PermissionedPropertyPredicate()}));
      outputterJson.setOutputDefaultValues(true);
      outputterJson.setOutputClassNames(true);
      outputterJson.output(error);
      out.println(outputterJson.toString());

    } else if ( format == Format.XML )  {
      //output error in xml format
      resp.setContentType("application/xml");

      foam.lib.xml.Outputter outputterXml = new foam.lib.xml.Outputter(OutputterMode.NETWORK);
      outputterXml.output(error);
      out.println(outputterXml.toString());

    } else if ( format == Format.CSV )  {
      //output error in csv format
      resp.setContentType("text/csv");

      CSVOutputter outputterCsv = new foam.lib.csv.CSVOutputterImpl.Builder(x).build();
      outputterCsv.outputFObject(x, error);
      out.println(outputterCsv.toString());

    } else if ( format == Format.HTML ) {
      //output error in html format
      resp.setContentType("text/html");

      foam.lib.html.Outputter outputterHtml = new foam.lib.html.Outputter(OutputterMode.NETWORK);
      outputterHtml.outputStartHtml();
      outputterHtml.outputStartTable();
      outputterHtml.outputHead(error);
      outputterHtml.put(error, null);
      outputterHtml.outputEndTable();
      outputterHtml.outputEndHtml();
      out.println(outputterHtml.toString());
    } else if ( format == Format.JSONJ ) {
      //output error in jsonJ format
      resp.setContentType("application/json");

      JSONParser jsonParser = new JSONParser();
      jsonParser.setX(x);
      Outputter outputterJson = new Outputter(x).setPropertyPredicate(new AndPropertyPredicate(new PropertyPredicate[] {new StoragePropertyPredicate(), new PermissionedPropertyPredicate()}));
      outputterJson.setOutputDefaultValues(true);
      outputterJson.setOutputClassNames(true);
      outputterJson.outputJSONJFObject(error);
      out.println(outputterJson.toString());

    } else {
      // TODO
    }
  }
}
