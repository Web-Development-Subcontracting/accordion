/*
Add a button to ckeditor to create nestable accordion elements.
This is updated from "collapsables", circa 2023
*/

(function($) {
	CKEDITOR.plugins.add( 'accordion', {
		icons: 'accordion',
		init: function( editor ) {
			editor.addCommand( 'accordion', {
				exec: function( editor ) {
					var fragment = editor.getSelection().getRanges()[0].extractContents()
					var container = CKEDITOR.dom.element.createFromHtml("<div/>", editor.document)
					container.setAttribute("class", "collapsible");
					fragment.appendTo(container)
					editor.insertElement(container)
				}
			  });
			editor.ui.addButton( 'accordion', {
				label: 'Accordion',
				command: 'accordion',
				toolbar: 'accordion'

			});
		}
	});
})(jQuery);
