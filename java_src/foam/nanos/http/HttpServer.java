package foam.nanos.http;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.charset.Charset;

import com.sun.net.httpserver.*;

import foam.core.*;

public class HttpServer implements Server {
  private HttpServer server;
  private String[] nanosList;

  static void start(Integer port, String[] nanos) {
    server = HttpServer.create(new InetSocketAddress(port), 0);
    nanosList = nanos;

    server.createContext('/', new nanoHttpHandler());

    server.start();
  }

  static class nanoHttpHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
      URI requestURI = t.getRequestURI();
      String path = requestURI.getPath();

      // Path htmlFilePath = Paths.get("test.html");
      // byte[] htmlFile = Files.readAllBytes(htmlFilePath);
      // String response = new String (htmlFile, Charset.forName("UTF-8"));

      Headers h = exchange.getResponseHeaders();
      h.set("Content-Type", "text/html");

      exchange.sendResponseHeaders(200, response.length());

      OutputStream os = exchange.getResponseBody();

      os.write(response.getBytes());
      os.close();
    }
  }
}