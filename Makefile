FOAM2_HOME ?= .

foam2_SRC_DIR = src
foam2_CLASSES = tools/classes.js

# Format for dependencies from maven is
# <groupId>:<artifactId>:<version>
foam2_MAVEN_DEPS = \
	javax.json:javax.json-api:1.0 \
	javax.mail:mail:1.4.7 \
	javax.mail:javax.mail-api:1.5.5 \
	javax.servlet:javax.servlet-api:3.1.0 \
	javax.websocket:javax.websocket-api:1.1 \
	jstl:jstl:1.2 \
	org.apache.commons:commons-text:1.1 \
	org.apache.commons:commons-dbcp2:2.0.1 \
	org.apache.commons:commons-lang3:3.6 \
	commons-collections:commons-collections:3.2.2 \
	org.apache.httpcomponents:httpcore:4.4.10 \
	org.apache.httpcomponents:httpclient:4.5.6 \
	commons-codec:commons-codec:1.11 \
	commons-io:commons-io:2.6 \
	org.apache-extras.beanshell:bsh:2.0b6 \
	com.google.api-client:google-api-client:1.22.0 \
	org.jtwig:jtwig-core:5.86.1.RELEASE \
	org.mongodb:mongodb-driver:3.4.2 \
	org.mongodb:mongodb-driver-core:3.4.2 \
	org.mongodb:bson:3.4.2 \
	org.postgresql:postgresql:42.0.0 \
	com.authy:authy-java:1.1.0 \
	org.bouncycastle:bcpkix-jdk15on:1.57 \
	org.bouncycastle:bcprov-jdk15on:1.57 \
	org.java-websocket:Java-WebSocket:1.3.7 \
	org.eclipse.jetty:jetty-alpn-conscrypt-server:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-alpn-java-server:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-alpn-openjdk8-server:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-alpn-server:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-annotations:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-client:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-continuation:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-deploy:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-hazelcast:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-http:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-infinispan:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-io:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-jaas:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-jaspi:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-jmx:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-jndi:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-nosql:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-plus:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-proxy:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-quickstart:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-rewrite:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-security:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-server:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-servlet:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-servlets:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-unixsocket:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-util:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-webapp:9.4.8.v20171121 \
	org.eclipse.jetty:jetty-xml:9.4.8.v20171121 \
	org.eclipse.jetty.websocket:websocket-api:9.4.8.v20171121 \
	org.eclipse.jetty.websocket:websocket-server:9.4.8.v20171121 \
	org.eclipse.jetty.websocket:websocket-servlet:9.4.8.v20171121 \
	com.google.guava:guava:23.6-jre \
	com.google.appengine:appengine-api-1.0-sdk:1.9.24

java_JARS = foam2

include build-aux/tools.mk
include build-aux/java.mk

nanos: nanos.in $(foam2_JAR)
	sed -e 's,@CLASSPATH[@],$(foam2_CLASSPATH):$(abspath $(foam2_JAR)),g' $< > $@
	chmod +x $@

all: nanos

.PHONY: run

run: nanos $(foam2_JAR)
	./$< -d --datadir src
