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
import foam.core.FObject;
import foam.lib.parse.*;
import foam.dao.Sink;


public class CSVSupport
  extends foam.core.ContextAwareSupport
{
  protected Parser headParser = new Repeat(new CSVStringParser(), new Literal(","));

  public void inputCSV(InputStream is, Sink sink, ClassInfo classInfo) {

    try {
      BufferedReader reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));
      String line = reader.readLine();
      StringPStream ps = new StringPStream();
      ps.setString(line);
      ParserContext x = new ParserContextImpl();
      x.set("X", getX());

      //get property name and propertyInfo from the first row
      PStream ps1 = ps.apply(headParser, x);
      if ( ps1 == null ) throw new RuntimeException("CSV head format error");

      Object[] propNames = (Object[]) ps1.value();
      int column = propNames.length;
      Parser[] propertyParsers = new Parser[column];
      PropertyInfo[] propertyInfos = new PropertyInfo[column];
      //get propertyInfo from ClassInfo
      for ( int i = 0 ; i < column ; i++ ) {
        propertyInfos[i] = (PropertyInfo) classInfo.getAxiomByName((String) propNames[i]);
        Parser p = propertyInfos[i].csvParser();

        if ( i < column - 1) {
          propertyParsers[i] = new Seq1(0, p, new Literal(","));
        } else {
          propertyParsers[i] = p;
        }
      }

      Parser columnParser = new Seq(propertyParsers);
      Object[] values = null;

      while ( (line = reader.readLine()) != null ) {
        ps = new StringPStream();
        ps.setString(line);
        x = new ParserContextImpl();
        x.set("X", getX());

        Object obj = getX().create(classInfo.getObjClass());
        ps1 = ps.apply(columnParser, x);
        if ( ps1 == null ) throw new RuntimeException("CSV row format error");

        values = (Object[]) ps1.value();
        for ( int i = 0 ; i < column ; i++ ) {
          propertyInfos[i].set(obj, values[i]);
        }

        sink.put(obj, null);
      }
    } catch ( Throwable t ) {
      throw new RuntimeException(t);
    }
  }
}
