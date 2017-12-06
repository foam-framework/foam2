/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.csv;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

import foam.core.ClassInfo;
import foam.core.PropertyInfo;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ParserContextImpl;
import foam.lib.parse.Repeat;
import foam.lib.parse.StringPStream;
import foam.lib.parse.Parser;
import foam.dao.Sink;


public class CSVParser 
  extends foam.core.ContextAwareSupport
{
  protected Parser rowParser = new CSVRowParser();

  public void inputCSV(InputStream is, Sink sink, ClassInfo classInfo) {

    try {
      BufferedReader reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));
      String line = reader.readLine();
      StringPStream ps = new StringPStream();;
      ps.setString(line);
      ParserContext x = new ParserContextImpl();
      x.set("X", getX());

      //get property name and propertyInfo from the first row
      PStream ps1 = ps.apply(rowParser, x);
      //throw error if CSV template wrong
      if ( ps1 == null ) throw new RuntimeException("CSV format error");
      String[] propNames = (String[]) ps1.value();
      int column = propNames.length;
      PropertyInfo[] props = new PropertyInfo[column];
      //get propertyInfo from ClassInfo
      for ( int i = 0 ; i < column ; i++ ) {
        props[i] = (PropertyInfo) classInfo.getAxiomByName(propNames[i]);
      }

      String[] values = null;

      while ( (line = reader.readLine()) != null ) {
        
        ps = new StringPStream();;
        ps.setString(line);
        x = new ParserContextImpl();
        x.set("X", getX());

        ps1 = ps1.apply(rowParser, x);
        if ( ps1 == null ) throw new RuntimeException("CSV format error");
        values = (String[]) ps1.value();
        if ( values.length != column ) throw new RuntimeException("CSV format error");

        Object obj = classInfo.newInstance();
        for ( int i = 0 ; i < column ; i++ ) {
          ps = new StringPStream();;
          ps.setString(values[i]);
          x = new ParserContextImpl();
          x.set("X", getX());
          props[i].set(obj, props[i].csvParser().parse(ps, x));
        }

      }
    } catch ( Throwable t ) {
      throw new RuntimeException(t);
    }
  }
}
