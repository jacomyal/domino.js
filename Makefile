DOMINO_PATH=src/domino.js
MINIFY_PATH=build/domino.min.js
TEMP_PATH=build/tmp.js
CLOSURE=build/compiler.jar
BUILD=build
LICENSE=/* domino.js - a JS fast dashboard prototyping framework - Version: 1.2 - Author:  Alexis Jacomy, Linkfluence - License: MIT */

all: clean minify
check:
	gjslint --nojsdoc src/domino.js
fix:
	fixjsstyle --nojsdoc src/domino.js
clean:
	rm -f ${MINIFY_PATH}
minify: clean
	java -jar ${CLOSURE} --compilation_level SIMPLE_OPTIMIZATIONS --js ${DOMINO_PATH} --js_output_file ${MINIFY_PATH}
	echo "${LICENSE}" > ${TEMP_PATH} && cat ${MINIFY_PATH} >> ${TEMP_PATH} && mv ${TEMP_PATH} ${MINIFY_PATH}
minify_advanced: clean
	java -jar ${CLOSURE} --compilation_level ADVANCED_OPTIMIZATIONS --js ${DOMINO_PATH} --js_output_file ${MINIFY_PATH}
	echo "${LICENSE}" > ${TEMP_PATH} && cat ${MINIFY_PATH} >> ${TEMP_PATH} && mv ${TEMP_PATH} ${MINIFY_PATH}
