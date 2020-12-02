/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.dig;

import foam.core.FObject;
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

/**
 * DigUtil contains static utility methods for working with Dig and Sugar.
 */
public class DigUtil {
  /**
   * Output DigErrorMessage object to HTTP response.
   *
   * @param x The context.
   * @param error The error to output.
   * @param format The format of the output.
   */
  public static void outputException(X x, DigErrorMessage error, Format format) {
    HttpServletResponse resp = x.get(HttpServletResponse.class);

    resp.setStatus(Integer.parseInt(error.getStatus()));
    outputFObject(x, error, format);
  }

  public static void outputFObject(X x, FObject object, Format format) {
    HttpServletResponse resp  = x.get(HttpServletResponse.class);
    PrintWriter         out   = x.get(PrintWriter.class);

    if ( format == Format.JSON ) {
      //output error in json format
      resp.setContentType("application/json");

      JSONParser jsonParser = new JSONParser();
      jsonParser.setX(x);
      Outputter outputterJson = new Outputter(x).setPropertyPredicate(new AndPropertyPredicate(x, new PropertyPredicate[] {new NetworkPropertyPredicate(), new PermissionedPropertyPredicate()}));
      outputterJson.setOutputDefaultValues(true);
      outputterJson.setOutputClassNames(true);
      outputterJson.setMultiLine(true);
      outputterJson.output(object);
      out.println(outputterJson.toString());

    } else if ( format == Format.XML )  {
      //output error in xml format
      resp.setContentType("application/xml");

      foam.lib.xml.Outputter outputterXml = new foam.lib.xml.Outputter(OutputterMode.NETWORK);
      outputterXml.output(object);
      out.println(outputterXml.toString());

    } else if ( format == Format.CSV )  {
      //output error in csv format
      resp.setContentType("text/csv");

      CSVOutputter outputterCsv = new foam.lib.csv.CSVOutputterImpl.Builder(x).build();
      outputterCsv.outputFObject(x, object);
      out.println(outputterCsv.toString());

    } else if ( format == Format.HTML ) {
      //output error in html format
      resp.setContentType("text/html");

      foam.lib.html.Outputter outputterHtml = new foam.lib.html.Outputter(OutputterMode.NETWORK);
      outputterHtml.outputStartHtml();
      outputterHtml.outputStartTable();
      outputterHtml.outputHead(object);
      outputterHtml.put(object, null);
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
      outputterJson.setMultiLine(true);
      outputterJson.outputJSONJFObject(object);
      out.println(outputterJson.toString());

    } else {
      throw new UnsupportedOperationException(
        String.format("Output FObject in %s format is not supported.", format.getName()));
    }
  }
}
