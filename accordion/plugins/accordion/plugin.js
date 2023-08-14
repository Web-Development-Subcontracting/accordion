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
					let fragment = editor.getSelection().getRanges()[0].extractContents();
					let container = CKEDITOR.dom.element.createFromHtml("<div/>", editor.document);
					container.setAttribute("class", "collapsible");

					fragment.appendTo(container);

					// Identify the first child element
					var firstChild = container.getFirst();
					
					if (firstChild) {
						// Create a new div for the remaining content
						var remainingContentDiv = CKEDITOR.dom.element.createFromHtml("<div/>", editor.document);
						remainingContentDiv.setAttribute("class", "collapsible-content");
						
						// Move the remaining content after the first child to the new div
						while (firstChild.getNext()) {
							remainingContentDiv.append(firstChild.getNext());
						}
						
						// Append the new div to the container
						container.append(remainingContentDiv);
					}

					editor.insertElement(container);
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
