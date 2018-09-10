package foam.nanos.dig;

import foam.nanos.http.WebAgent;
import foam .core.X;
import foam.nanos.logger.Logger;
import java.io.*;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.nanos.boot.NSpec;
import foam.core.Detachable;
import foam.core.ClassInfo;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import foam.nanos.http.HttpParameters;
import javax.servlet.ServletException;
import java.nio.CharBuffer;
import foam.util.SafetyUtil;

public class SugarWebAgent
  implements WebAgent
{
  public SugarWebAgent() {}

  public void execute(X x) {
    Logger logger = (Logger) x.get("logger");
    PrintWriter         out      = x.get(PrintWriter.class);
    HttpServletResponse resp     = x.get(HttpServletResponse.class);
    HttpParameters      p        = x.get(HttpParameters.class);
    CharBuffer buffer_ = CharBuffer.allocate(65535);
    String serviceName = p.getParameter("servic");
    String methodName = p.getParameter("method");
    String parameters = p.getParameter("parameters");
//    String Command =

    try {
      if ( SafetyUtil.isEmpty(serviceName) ) {
        System.out.println("serviceName 11 : " + serviceName);
        //outputPage(x);
      }

      //System.out.println("this is 22 : " + x.get("exchangeRate").getClass().getMethods()[1]);
      System.out.println("serviceName 22 : " + serviceName);

      for ( int i = 0; i < x.get("exchangeRate").getClass().getMethods().length; i++ ) {
        out.println("getMethods[] : " + x.get("exchangeRate").getClass().getMethods()[i]);
        out.println("getName : " + x.get("exchangeRate").getClass().getMethods()[i].getName());
        out.println("getParameterTypes : " + x.get("exchangeRate").getClass().getMethods()[i].getParameterTypes());
        out.println("getGenericParameterTypes : " + x.get("exchangeRate").getClass().getMethods()[i].getGenericParameterTypes());
        out.println("getParameterCount : " + x.get("exchangeRate").getClass().getMethods()[i].getParameterCount());
        out.println("getReturnType : " + x.get("exchangeRate").getClass().getMethods()[i].getReturnType());
      }

      if ( !SafetyUtil.isEmpty(parameters) ) {
        String parameterArr[] = parameters.split(",");
        String parameterStr = null;

        for ( int j = 0; j < parameterArr.length; j++ ) {
          out.println("j : " + parameterArr[j]);
          //parameterStr += "\"" + parameterArr[j]

//
        }

        //x.get(methodName).getClass().getM
      }

    } catch (Exception e) {
      logger.error(e);

      return;
    }

    //outputPage(x);
  }

  protected void outputPage(X x) {
    PrintWriter       out      = x.get(PrintWriter.class);
    DAO               nSpecDAO = (DAO) x.get("AuthenticatedNSpecDAO");
    Logger            logger   = (Logger) x.get("logger");



    System.out.println("this is 11 : " + x.get("exchangeRate").getClass());
    System.out.println("this is 22 : " + x.get("exchangeRate").getClass().getMethods()[1]);
    System.out.println("this is 33 : " + x.get("exchangeRate").getClass().getSimpleName());

    //ClassInfo         cInfo    = (ClassInfo) "net.nanopay.fx.ExchangeRateInterfaceSkeleton";

    //System.out.println("cInfo111 : " + cInfo);

    out.println("<form method=post><span>SERVICE:</span>");
    out.println("<span><select name=serviceName id=serviceName style=margin-left:35 >");
    // gets all ongoing nanopay services
    nSpecDAO.inX(x).orderBy(NSpec.NAME).select(new AbstractSink() {
      @Override
      public void put(Object o, Detachable d) {
        NSpec s = (NSpec) o;
        if ( s.getName().endsWith("DAO") == false ) { //s.getServe() && !s.getName().endsWith("DAO")
          out.println("<option value=" + s.getName() + ">" + s.getName() + "</option>");
        }
      }
    });
    out.println("</select></span>");
//    out.println("<br><br><span id=formatSpan>Format:<select name=format id=format onchange=changeUrl() style=margin-left:25><option value=csv>CSV</option><option value=xml>XML</option><option value=json selected>JSON</option><option value=html>HTML</option><option value=jsonj>JSON/J</option></select></span>");
//    out.println("<br><br><span>Command:<select name=cmd id=cmd width=150 style=margin-left:5  onchange=changeCmd(this.value)><option value=put selected>PUT</option><option value=select>SELECT</option><option value=remove>REMOVE</option><option value=help>HELP</option></select></span>");
//    out.println("<br><br><span id=qSpan style=display:none;>Query:<input id=q name=q style=margin-left:30;width:350 onchange=changeUrl() onkeyup=changeUrl()></input></span>");
//    out.println("<br><br><span id=emailSpan style=display:none;>Email:<input id=email name=email style=margin-left:30;width:350 onkeyup=changeUrl() onchange=changeUrl()></input></span>");
//    out.println("<br><br><span id=subjectSpan style=display:none;>Subject:<input id=subject name=subject style=margin-left:20;width:350 onkeyup=changeUrl() onchange=changeUrl()></input></span>");
//    out.println("<br><br><span id=idSpan style=display:none;>ID:<input id=id name=id style=margin-left:52 onkeyup=changeUrl() onchange=changeUrl()></input></span>");
//    out.println("<br><br><span id=dataSpan>Data:<br><textarea rows=20 cols=120 name=data></textarea></span>");
//    out.println("<br><span id=urlSpan style=display:none;> URL : </span>");
//    out.println("<input id=builtUrl size=120 style=margin-left:20;display:none;/ >");
      out.println("<br><br><button type=submit >Submit</button></form>");
//    out.println("<script>function changeCmd(cmdValue) { if ( cmdValue != 'put' ) {document.getElementById('dataSpan').style.cssText = 'display: none'; } else { document.getElementById('dataSpan').style.cssText = 'display: inline-block'; } if ( cmdValue == 'remove' ) { document.getElementById('idSpan').style.cssText = 'display: inline-block'; document.getElementById('formatSpan').style.cssText = 'display:none';} else { document.getElementById('idSpan').style.cssText = 'display: none'; document.getElementById('formatSpan').style.cssText = 'display: inline-block'; document.getElementById('id').value = '';} if ( cmdValue == 'select' ) {document.getElementById('qSpan').style.cssText = 'display: inline-block'; document.getElementById('emailSpan').style.cssText = 'display: inline-block'; document.getElementById('subjectSpan').style.cssText = 'display: inline-block'; document.getElementById('urlSpan').style.cssText = 'display: inline-block';document.getElementById('builtUrl').style.cssText = 'display: inline-block'; var vbuiltUrl = document.location.protocol + '//' + document.location.host + '/service/dig?dao=' + document.getElementById('dao').value + '&format=' + document.getElementById('format').options[document.getElementById('format').selectedIndex].value + '&cmd=' + document.getElementById('cmd').options[document.getElementById('cmd').selectedIndex].value + '&email='; document.getElementById('builtUrl').value=vbuiltUrl;}else {document.getElementById('qSpan').style.cssText = 'display:none'; document.getElementById('emailSpan').style.cssText = 'display:none'; document.getElementById('subjectSpan').style.cssText ='display:none';document.getElementById('urlSpan').style.cssText = 'display:none';document.getElementById('builtUrl').style.cssText = 'display:none';}}</script>");
//
//    out.println("<script>function changeUrl() {var vbuiltUrl = document.location.protocol + '//' + document.location.host + '/service/dig?dao=' + document.getElementById('dao').value + '&format=' + document.getElementById('format').options[document.getElementById('format').selectedIndex].value + '&cmd=' + document.getElementById('cmd').options[document.getElementById('cmd').selectedIndex].value + '&email=' + document.getElementById('email').value + '&q=' + document.getElementById('q').value; document.getElementById('builtUrl').value=vbuiltUrl;}</script>");

    out.println();
  }
}
