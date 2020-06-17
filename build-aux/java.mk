MAVEN_BASE_URL=https://repo.maven.apache.org/maven2

JAVA_DEP_DIR ?= lib
JAVACFLAGS = -g

.DELETE_ON_ERROR:

empty :=
space := $(empty) $(empty)
#split <string> <separator>
split = $(subst $(2),$(space),$(1))

java_dep_version = $(word 3,$(call split,$(1),:))
java_dep_artifact = $(word 2,$(call split,$(1),:))
java_dep_group = $(word 1,$(call split,$(1),:))
java_dep_jar = $(call java_dep_artifact,$(1))-$(call java_dep_version,$(1)).jar
java_dep_sha1 = $(call java_dep_jar,$(1)).sha1
java_dep_jar_url = $(MAVEN_BASE_URL)/$(subst .,/,$(call java_dep_group,$(1)))/$(call java_dep_artifact,$(1))/$(call java_dep_version,$(1))/$(call java_dep_jar,$(1))
java_dep_sha1_url = $(MAVEN_BASE_URL)/$(subst .,/,$(call java_dep_group,$(1)))/$(call java_dep_artifact,$(1))/$(call java_dep_version,$(1))/$(call java_dep_sha1,$(1))

foam_genjava = $(NODE) $(FOAM2_HOME)/tools/genjava2.js

define JAVA_MAVEN_LIB_template
$(2)_JAVA_LIBS += $(JAVA_DEP_DIR)/$(call java_dep_jar,$(1))
$(JAVA_DEP_DIR)/$(call java_dep_jar,$(1)):
	@echo Downloading $(call java_dep_jar,$(1))
	$$(WGET) -O $(JAVA_DEP_DIR)/$(call java_dep_sha1,$(1)) $(call java_dep_sha1_url,$(1))
	$$(WGET) -O $$@ $(call java_dep_jar_url,$(1))
	@echo Verifying
	@if test "$$$$($$(SHA1SUM) $(JAVA_DEP_DIR)/$(call java_dep_jar,$(1)) | cut -d' ' -f1)" != "$$$$(cat $(JAVA_DEP_DIR)/$(call java_dep_sha1,$(1)))" ; then \
	  echo "ERROR: Download did not match sha1 checksum." ; \
	  exit 1 ; \
	fi


endef

all:

BUILD_DIR ?= build

$(BUILD_DIR):
	$(MKDIR_P) $@

.PHONY: gensrcs

define JAVA_JAR_template
$(1)_CLASSPATH = $$(subst $$(space),:,$$(foreach lib,$$($(1)_JAVA_LIBS),$$(abspath $$(lib))))
$(1)_CLASSPATH_TXT = $$(BUILD_DIR)/$(1).classpath.txt
$(1)_JAVA_SRCS ?= $$(shell find $$($(1)_SRC_DIR) -type f -iname '*.java')
$(1)_JS_SRCS ?= $$(shell find $$($(1)_SRC_DIR) -type f -iname '*.js')
$(1)_ALL_SRCS = $$($(1)_JAVA_SRCS) $$($(1)_JS_SRCS)
$(1)_GEN_SRC_DIR = .$(1)-gensrcs
$(1)_BUILD_DIR = .$(1)-build
$(1)_GEN_SRCS = $$(shell find $$($(1)_GEN_SRC_DIR) -type f -iname '*.java')
$(1)_JAR = $$(BUILD_DIR)/$(1).jar

.PHONY: $(1)-gensrcs $(1)-java-deps $(1)-list-deps

all: $(1)

$(1)-list-deps:
	$$(foreach dep,$$($(1)_JAVA_LIBS),$$(info $$(dep)))

$$($(1)_GEN_SRC_DIR):
	$$(MKDIR_P) $$@

$$($(1)_BUILD_DIR):
	$$(MKDIR_P) $$@

$(1)_SRC_HASH:=$$($(1)_GEN_SRC_DIR)/.srchash-$$(shell cat $$($(1)_JS_SRCS) $$($(1)_CLASSES) | $$(SHA256SUM) | cut -d" " -f1)

$$($(1)_JAR): $$($(1)_SRC_HASH)

$$($(1)_SRC_HASH): $$(FOAM2_HOME)/tools/genjava2.js | $$($(1)_GEN_SRC_DIR)
	find $$($(1)_GEN_SRC_DIR) -maxdepth 1 -type f -iname '.srchash-*' -delete
	find $$($(1)_GEN_SRC_DIR) -type f -iname '*.java' -delete
	$$(foam_genjava) $$($(1)_CLASSES) $$($(1)_GEN_SRC_DIR) $$($(1)_SRC_DIR)
	touch $$@

gensrcs: $$($(1)_SRC_HASH)

clean-$(1)-gensrcs:
	-rm -rf $$($(1)_GEN_SRC_DIR)

clean-$(1):
	-rm -f $$($(1)_JAR)
	-rm -f $$($(1)_CLASSPATH_TXT)

clean: clean-$(1) clean-$(1)-gensrcs

.PHONY: $(1)

$(1): $$($(1)_JAR) $$($(1)_CLASSPATH_TXT)

$$($(1)_CLASSPATH_TXT): $$($(1)_JAR)
	echo $$($(1)_CLASSPATH):$$(abspath $$($(1)_JAR)) > $$@

$(foreach dep,$($(1)_MAVEN_DEPS),$(call JAVA_MAVEN_LIB_template,$(dep),$(1)))

$(1)-java-deps: $$($(1)_JAVA_LIBS)

clean-$(1)-java-deps:
	-rm -f $$($(1)_JAVA_LIBS)

$$($(1)_JAR): $$($(1)_JAVA_SRCS) $$($(1)_JAVA_LIBS) | $$($(1)_BUILD_DIR) $$(BUILD_DIR)
	find $$($(1)_BUILD_DIR) -type f -iname '*.class' -delete
	@echo "Compiling..."
	@$$(JAVAC) $$(JAVACFLAGS) -d $$($(1)_BUILD_DIR) -cp $$($(1)_CLASSPATH) $$($(1)_JAVA_SRCS) $$($(1)_GEN_SRCS)
	@echo "Packaging..."
	$$(JAR) cvf $$@ -C $$($(1)_BUILD_DIR) .

.PHONY: run-$(1)

endef

$(foreach prog,$(java_JARS),$(eval $(call JAVA_JAR_template,$(prog))))
