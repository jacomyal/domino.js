all:
	./github-flavored-markdown.rb _content.md > __tmp__ 
	cat ./_header.html ./__tmp__ ./_footer.html > index.html
	rm __tmp__