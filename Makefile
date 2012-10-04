DOMINO_PATH=src/domino.js
MINIFY_PATH=build/domino.min.js
MODULES_PATH=src/domino.modules.js
MODULES_MINIFY_PATH=build/domino.modules.min.js
TEMP_PATH=build/tmp.js
CLOSURE=build/compiler.jar
BUILD=build
LICENSE=/* domino.js - a JS fast dashboard prototyping framework - Version: 1.0 - Author:  Alexis Jacomy - License: MIT */

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
	java -jar ${CLOSURE} --compilation_level SIMPLE_OPTIMIZATIONS --js ${MODULES_PATH} --js_output_file ${MODULES_MINIFY_PATH}
	echo "${LICENSE}" > ${TEMP_PATH} && cat ${MODULES_MINIFY_PATH} >> ${TEMP_PATH} && mv ${TEMP_PATH} ${MODULES_MINIFY_PATH}
minify_advanced: clean
	java -jar ${CLOSURE} --compilation_level ADVANCED_OPTIMIZATIONS --js ${DOMINO_PATH} --js_output_file ${MINIFY_PATH}
	echo "${LICENSE}" > ${TEMP_PATH} && cat ${MINIFY_PATH} >> ${TEMP_PATH} && mv ${TEMP_PATH} ${MINIFY_PATH}
	java -jar ${CLOSURE} --compilation_level ADVANCED_OPTIMIZATIONS --js ${MODULES_PATH} --js_output_file ${MODULES_MINIFY_PATH}
	echo "${LICENSE}" > ${TEMP_PATH} && cat ${MODULES_MINIFY_PATH} >> ${TEMP_PATH} && mv ${TEMP_PATH} ${MODULES_MINIFY_PATH}
