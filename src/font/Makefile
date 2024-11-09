#all: subdirs bundle.js # Textbook subdirectory recursion

# NOTE: This makefile differs slightly from the others in that it creates the
# individual .js files on the fly before packaging them.

AUTOGEN_FILES = \
  defaultFont.js \
	nybbleFont.js \
	iconFont.js \

bundle.js: $(AUTOGEN_FILES)
	cat $(AUTOGEN_FILES) > bundle.js

VARNAME1 = defaultFont
SRCFILE1 = project.font.png
OUTFILE1 = $(VARNAME1).js
defaultFont.js: $(SRCFILE1)
	echo "  $(VARNAME1) = new df.GlyphSet()" > $(OUTFILE1)
	echo "  $(VARNAME1).loadFromURL(" >> $(OUTFILE1)
	echo "    \"$(VARNAME1)\"," >> $(OUTFILE1)
	echo "    ()=>{}," >> $(OUTFILE1)
#	echo "    \"src/font/$(SRCFILE1)\"," >> $(OUTFILE1)
	cat $(SRCFILE1) | base64 | tr -d '\r\n' > base64.output.txt
	certutil -encodehex -f $(SRCFILE1) base64.output.txt 0x40000001
	echo "    \"data:application/octet-stream;base64,`cat base64.output.txt`\"," \
		>> $(OUTFILE1)
	echo "  )" >> $(OUTFILE1)
	rm base64.*
	cp $(OUTFILE1) ../../pwa/js/font/

VARNAME2 = nybbleFont
SRCFILE2 = nybble.font.png
OUTFILE2 = $(VARNAME2).js
nybbleFont.js: $(SRCFILE2)
	echo "  $(VARNAME2) = new df.GlyphSet()" > $(OUTFILE2)
	echo "  $(VARNAME2).loadFromURL(" >> $(OUTFILE2)
	echo "    \"$(VARNAME2)\"," >> $(OUTFILE2)
	echo "    ()=>{}," >> $(OUTFILE2)
#	echo "    \"src/font/$(SRCFILE2)\"," >> $(OUTFILE2)
	cat $(SRCFILE2) | base64 | tr -d '\r\n' > base64.output.txt
	certutil -encodehex -f $(SRCFILE2) base64.output.txt 0x40000001
	echo "    \"data:application/octet-stream;base64,`cat base64.output.txt`\"," \
		>> $(OUTFILE2)
	echo "  )" >> $(OUTFILE2)
	rm base64.*
	cp $(OUTFILE2) ../../pwa/js/font/

VARNAME3 = iconFont
SRCFILE3 = icon.font.png
OUTFILE3 = $(VARNAME3).js
iconFont.js: $(SRCFILE3)
	echo "  $(VARNAME3) = new df.GlyphSet()" > $(OUTFILE3)
	echo "  $(VARNAME3).loadFromURL(" >> $(OUTFILE3)
	echo "    \"$(VARNAME3)\"," >> $(OUTFILE3)
	echo "    ()=>{}," >> $(OUTFILE3)
#	echo "    \"src/font/$(SRCFILE3)\"," >> $(OUTFILE3)
	cat $(SRCFILE3) | base64 | tr -d '\r\n' > base64.output.txt
	certutil -encodehex -f $(SRCFILE3) base64.output.txt 0x40000001
	echo "    \"data:application/octet-stream;base64,`cat base64.output.txt`\"," \
		>> $(OUTFILE3)
	echo "  )" >> $(OUTFILE3)
	rm base64.*
	cp $(OUTFILE3) ../../pwa/js/font/

# Clean files from subdirs and this dir
.PHONY: clean
clean:
#	@$(MAKE) -sC tbd clean # ADD DIRS AS NEEDED
	@-rm -f bundle.js $(AUTOGEN_FILES)

# Textbook subdirectory recursion
#SUBDIRS = $(wildcard */)
#.PHONY: subdirs $(SUBDIRS)
#subdirs: $(SUBDIRS)
#$(SUBDIRS):
#	@$(MAKE) -C $@

