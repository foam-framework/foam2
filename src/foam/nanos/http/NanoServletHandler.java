/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import java.io.*;
import java.lang.reflect.*;
import java.net.InetSocketAddress;
import java.util.*;
import javax.servlet.*;
import javax.servlet.http.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

/** Adapt a NanoServlet into an HttpHandler. **/
public class NanoServletHandler
  implements HttpHandler
{
  protected NanoServlet servlet_;

  public NanoServletHandler(NanoServlet servlet) {
    servlet_ = servlet;
  }

  final class RequestWrapper extends HttpServletRequestWrapper {
    final HttpExchange          ex;
    final Map<String, String[]> postData;
    final ServletInputStream    is;
    final Map<String, Object>   attributes = new HashMap<>();

    RequestWrapper(HttpServletRequest request, HttpExchange ex, Map<String, String[]> postData, ServletInputStream is) {
      super(request);

      this.ex = ex;
      this.postData = postData;
      this.is = is;
    }

    @Override
    public String getHeader(String name) {
      return ex.getRequestHeaders().getFirst(name);
    }

    @Override
    public Enumeration<String> getHeaders(String name) {
      return new Vector<String>(ex.getRequestHeaders().get(name)).elements();
    }

    @Override
    public Enumeration<String> getHeaderNames() {
      return new Vector<String>(ex.getRequestHeaders().keySet()).elements();
    }

    @Override
    public Object getAttribute(String name) {
      return attributes.get(name);
    }

    @Override
    public void setAttribute(String name, Object o) {
      this.attributes.put(name, o);
    }

    @Override
    public Enumeration<String> getAttributeNames() {
      return new Vector<String>(attributes.keySet()).elements();
    }

    @Override
    public String getMethod() {
      return ex.getRequestMethod();
    }

    @Override
    public ServletInputStream getInputStream() throws IOException {
      return is;
    }

    @Override
    public BufferedReader getReader() throws IOException {
      return new BufferedReader(new InputStreamReader(getInputStream()));
    }

    @Override
    public String getPathInfo() {
      return ex.getRequestURI().getPath();
    }

    @Override
    public String getParameter(String name) {
      String[] arr = postData.get(name);
      return arr != null ? (arr.length > 1 ? Arrays.toString(arr) : arr[0]) : null;
    }

    @Override
    public Map<String, String[]> getParameterMap() {
      return postData;
    }

    @Override
    public Enumeration<String> getParameterNames() {
      return new Vector<String>(postData.keySet()).elements();
    }
  }

  protected final class ResponseWrapper extends HttpServletResponseWrapper {
    final ByteArrayOutputStream outputStream        = new ByteArrayOutputStream();
    final ServletOutputStream   servletOutputStream = new ServletOutputStream() {

      @Override
      public void write(int b) throws IOException {
        outputStream.write(b);
      }
    };

    protected final HttpExchange ex;
    protected final PrintWriter  printWriter;
    protected       int          status = HttpServletResponse.SC_OK;

    protected ResponseWrapper(HttpServletResponse response, HttpExchange ex) {
      super(response);

      this.ex = ex;
      printWriter = new PrintWriter(servletOutputStream);
    }

    @Override
    public void setContentType(String type) {
      ex.getResponseHeaders().add("Content-Type", type);
    }

    @Override
    public void setHeader(String name, String value) {
      ex.getResponseHeaders().add(name, value);
    }

    @Override
    public javax.servlet.ServletOutputStream getOutputStream() throws IOException {
      return servletOutputStream;
    }

    @Override
    public void setContentLength(int len) {
      ex.getResponseHeaders().add("Content-Length", len + "");
    }

    @Override
    public void setStatus(int status) {
      this.status = status;
    }

    @Override
    public void sendError(int sc, String msg) throws IOException {
      this.status = sc;
      if (msg != null) {
        printWriter.write(msg);
      }
    }

    @Override
    public void sendError(int sc) throws IOException {
      sendError(sc, null);
    }

    @Override
    public PrintWriter getWriter() throws IOException {
      return printWriter;
    }

    public void flushBuffer() throws IOException {
      this.getWriter().flush();
    }

    public void complete() throws IOException {
      try {
        printWriter.flush();
        ex.sendResponseHeaders(status, outputStream.size());
        if ( outputStream.size() > 0 ) {
          ex.getResponseBody().write(outputStream.toByteArray());
        }
        ex.getResponseBody().flush();
      } catch (Exception e) {
        e.printStackTrace();
      } finally {
        ex.close();
      }
    }
  }

  @SuppressWarnings("deprecation")
  @Override
  public void handle(final HttpExchange ex) throws IOException {
    byte[] inBytes = getBytes(ex.getRequestBody());
    ex.getRequestBody().close();
    final ByteArrayInputStream newInput = new ByteArrayInputStream(inBytes);
    final ServletInputStream   is       = new ServletInputStream() {

      @Override
      public int read() throws IOException {
        return newInput.read();
      }
    };

    Map<String, String[]> parsePostData = new HashMap<>();

    try {
      parsePostData.putAll(HttpUtils.parseQueryString(ex.getRequestURI().getQuery()));

      // check if any postdata to parse
      parsePostData.putAll(HttpUtils.parsePostData(inBytes.length, is));
    } catch (IllegalArgumentException e) {
      // no postData - just reset inputstream
      newInput.reset();
    }

    final Map<String, String[]> postData = parsePostData;

    RequestWrapper  req  = new RequestWrapper(createUnimplementAdapter(HttpServletRequest.class), ex, postData, is);
    ResponseWrapper resp = new ResponseWrapper(createUnimplementAdapter(HttpServletResponse.class), ex);

    try {
      servlet_.service(req, resp);
      resp.complete();
    } catch (ServletException e) {
      throw new IOException(e);
    }
  }

  protected static byte[] getBytes(InputStream in) throws IOException {
    ByteArrayOutputStream out    = new ByteArrayOutputStream();
    byte[]                buffer = new byte[1024];

    while (true) {
      int r = in.read(buffer);
      if ( r == -1 ) break;
      out.write(buffer, 0, r);
    }
    return out.toByteArray();
  }

  @SuppressWarnings("unchecked")
  protected static <T> T createUnimplementAdapter(Class<T> httpServletApi) {
    class UnimplementedHandler implements InvocationHandler {
      @Override
      public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        throw new UnsupportedOperationException("Not implemented: " + method + ", args=" + Arrays.toString(args));
      }
    }

    return (T) Proxy.newProxyInstance(
        UnimplementedHandler.class.getClassLoader(),
        new Class<?>[] { httpServletApi },
        new UnimplementedHandler());
  }
}
