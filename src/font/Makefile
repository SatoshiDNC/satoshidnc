#all: subdirs bundle.js # Textbook subdirectory recursion

# NOTE: This makefile differs slightly from the others in that it creates the
# individual .js files on the fly before packaging them.

AUTOGEN_FILES = \
	nybbleFont.js \
	iconFont.js \

bundle.js: $(AUTOGEN_FILES)
	cat $(AUTOGEN_FILES) > bundle.js

VARNAME = defaultFont
SRCFILE = project.font.png
OUTFILE = $(VARNAME).js
nybbleFont.js: $(SRCFILE)
	echo "  $(VARNAME) = new df.GlyphSet()" > $(OUTFILE)
	echo "  $(VARNAME).loadFromURL(" >> $(OUTFILE)
	echo "    \"$(VARNAME)\"," >> $(OUTFILE)
	echo "    ()=>{}," >> $(OUTFILE)
#	echo "    \"src/font/$(SRCFILE)\"," >> $(OUTFILE)
	cat $(SRCFILE) | base64 | tr -d '\r\n' > base64.output.txt
	certutil -encodehex -f $(SRCFILE) base64.output.txt 0x40000001
	echo "    \"data:application/octet-stream;base64,`cat base64.output.txt`\"," \
		>> $(OUTFILE)
	echo "  )" >> $(OUTFILE)
	rm base64.*
	cp $(OUTFILE) ../../pwa/js/font/

VARNAME = nybbleFont
SRCFILE = nybble.font.png
OUTFILE = $(VARNAME).js
nybbleFont.js: $(SRCFILE)
	echo "  $(VARNAME) = new df.GlyphSet()" > $(OUTFILE)
	echo "  $(VARNAME).loadFromURL(" >> $(OUTFILE)
	echo "    \"$(VARNAME)\"," >> $(OUTFILE)
	echo "    ()=>{}," >> $(OUTFILE)
#	echo "    \"src/font/$(SRCFILE)\"," >> $(OUTFILE)
	cat $(SRCFILE) | base64 | tr -d '\r\n' > base64.output.txt
	certutil -encodehex -f $(SRCFILE) base64.output.txt 0x40000001
	echo "    \"data:application/octet-stream;base64,`cat base64.output.txt`\"," \
		>> $(OUTFILE)
	echo "  )" >> $(OUTFILE)
	rm base64.*
	cp $(OUTFILE) ../../pwa/js/font/

VARNAME = iconFont
SRCFILE = icon.font.png
OUTFILE = $(VARNAME).js
nybbleFont.js: $(SRCFILE)
	echo "  $(VARNAME) = new df.GlyphSet()" > $(OUTFILE)
	echo "  $(VARNAME).loadFromURL(" >> $(OUTFILE)
	echo "    \"$(VARNAME)\"," >> $(OUTFILE)
	echo "    ()=>{}," >> $(OUTFILE)
#	echo "    \"src/font/$(SRCFILE)\"," >> $(OUTFILE)
	cat $(SRCFILE) | base64 | tr -d '\r\n' > base64.output.txt
	certutil -encodehex -f $(SRCFILE) base64.output.txt 0x40000001
	echo "    \"data:application/octet-stream;base64,`cat base64.output.txt`\"," \
		>> $(OUTFILE)
	echo "  )" >> $(OUTFILE)
	rm base64.*
	cp $(OUTFILE) ../../pwa/js/font/

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

