/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.script.jShell;

import java.io.BufferedReader;
import java.io.FileReader;
import java.util.LinkedList;
import java.util.List;
import foam.core.X;

import foam.util.SafetyUtil;
import foam.nanos.logger.Logger;
import jdk.jshell.JShell;

/**
 * Parse the code from a file and return a list of instruction
 *
 */
public class ReadLineByLine {
  protected List<String> lineScripts;
  public JShell          jShell;
  public List<String>    listInstruction;

  public ReadLineByLine(JShell jShell) {
    this.listInstruction = new LinkedList<String>();
    this.lineScripts = new LinkedList<>();
    this.jShell = jShell;
  }

  public List<String> ReadByLine(String initialScript, X x) {
    try {
      BufferedReader br = new BufferedReader(new FileReader(initialScript));
      for ( String scriptLine ; ( scriptLine = br.readLine() ) != null ; ) {
        if ( SafetyUtil.isEmpty(scriptLine.trim()) ) continue;
        this.lineScripts.add(scriptLine);
      }
      br.close();
    } catch (Exception e) {
      Logger logger = (Logger) x.get("logger");
      if ( logger == null ) {
        logger = new foam.nanos.logger.StdoutLogger();
      }
      logger.error(e);
    }
    return lineScripts;
  }
}
