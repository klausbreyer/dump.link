package src

import (
	"bytes"

	"github.com/PuerkitoBio/goquery"
	"github.com/russross/blackfriday/v2"
)

func markdownToHTML(input []byte) []byte {
	return blackfriday.Run(input)
}

func addTailwindClasses(htmlContent []byte) string {
	doc, err := goquery.NewDocumentFromReader(bytes.NewReader(htmlContent))
	if err != nil {
		panic(err)
	}

	doc.Find("h1").AddClass("text-4xl font-bold mb-4")
	doc.Find("h2").AddClass("text-3xl font-bold mb-3")
	doc.Find("h3").AddClass("text-2xl font-bold mb-3")

	doc.Find("p").AddClass("mb-4")

	doc.Find("ul, ol").AddClass("list-disc pl-5 mb-4")
	doc.Find("li").AddClass("mb-2")

	htmlString, err := doc.Html()
	if err != nil {
		panic(err)
	}
	return htmlString
}
