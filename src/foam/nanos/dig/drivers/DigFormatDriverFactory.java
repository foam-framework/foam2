/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.dig.drivers;

import foam.core.*;
import foam.dao.DAO;
import foam.lib.csv.CSVOutputter;
import foam.lib.json.OutputterMode;
import foam.nanos.boot.NSpec;
import foam.nanos.dig.exception.*;
import foam.nanos.dig.*;
import foam.nanos.http.*;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.util.SafetyUtil;

import java.io.PrintWriter;
import java.util.List;
import javax.servlet.http.HttpServletResponse;

public class DigFormatDriverFactory
{
  public static DigFormatDriver create(X x, Format format) {
    switch (format) {
      case JSON:
        return new DigJsonDriver.Builder(x).setFormat(format).build();
      case JSONJ:
        return new DigJsonJDriver.Builder(x).setFormat(format).build();
      case XML:
        return new DigXmlDriver.Builder(x).setFormat(format).build();
      case CSV:
        return new DigCsvDriver.Builder(x).setFormat(format).build();
      case HTML:
        return new DigHtmlDriver.Builder(x).setFormat(format).build();
      default:
        return null;
    }
  }
}
