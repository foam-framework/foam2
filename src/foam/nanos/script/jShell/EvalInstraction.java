/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.script.jShell;

import java.util.List;

import foam.core.X;
import jdk.jshell.JShell;
import jdk.jshell.SnippetEvent;

public class EvalInstraction {
  public JShell jShell;
  List<String>  listInstraction;
  String        result = null;

  public EvalInstraction(JShell jShell, List<String> listInstraction, X x) {
    this.jShell = jShell;
    this.listInstraction = listInstraction;
    this.result = "";
  } 
    
  public String runEvalInstraction() throws Exception { 
    for ( int j = 0; j < listInstraction.size(); j++ ) {
      result += evalSingleInstraction(listInstraction.get(j));
    }
    return result;
  }

  private String evalSingleInstraction(String source) throws Exception {
    String output = "";
    for ( SnippetEvent event : jShell.eval(source) ) {
      switch ( event.snippet().subKind() ) {
        case ANNOTATION_TYPE_SUBKIND: //An annotation interface declaration.
        case ASSIGNMENT_SUBKIND: //An assignment expression.
        case CLASS_SUBKIND:   
        case ENUM_SUBKIND:    
        case INTERFACE_SUBKIND:   
        case SINGLE_STATIC_IMPORT_SUBKIND:    
        case SINGLE_TYPE_IMPORT_SUBKIND  :
        case STATIC_IMPORT_ON_DEMAND_SUBKIND :
        case TYPE_IMPORT_ON_DEMAND_SUBKIND:   
        case VAR_DECLARATION_SUBKIND: 
        case VAR_VALUE_SUBKIND:
        case METHOD_SUBKIND:
        case STATEMENT_SUBKIND:
        case TEMP_VAR_EXPRESSION_SUBKIND:
        case VAR_DECLARATION_WITH_INITIALIZER_SUBKIND:
          String val = event.value();
          if (val != null)
            output += val+"\n";
          break;
        case OTHER_EXPRESSION_SUBKIND: // An expression which has not been wrapped in a temporary variable (reserved).        
        case UNKNOWN_SUBKIND:
          String message = "Unknown subkind instraction"+ source;
          throw new Exception(message);
        default:
          break;
      }
      Exception exc = event.exception();
      if ( exc != null ) {
        String out = exc.getMessage();
        output += "Error is " + out;
        System.out.println( "Error is " + out );
      }
    }
    return output;
  }
}