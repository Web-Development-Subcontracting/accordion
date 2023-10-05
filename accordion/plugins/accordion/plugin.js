/*
Add a button to ckeditor to create nestable accordion elements.
This is an improved, accessible version of ccit's "collapsables"
Author: Ben Alexander, 2023
*/

function isInsideCollapsibleContainer(element) {
    var parentElement = element.getAscendant('div', true); // Adjust the element type as needed
    if (parentElement && parentElement.hasClass('collapsible')) {
        return parentElement;
    }
    return false;
}

function getCollapsibleContentContainerElement(startElement) {
	let elem = startElement.$;
	let children = elem.childNodes;
	for (let i = 0; i < children.length; i++) {
		let collapsibleContentContainer = children[i];
		let classes = collapsibleContentContainer.classList
		if (classes && classes.contains('collapsible-content')) {
			let contents = collapsibleContentContainer.childNodes;
			//if child is empty, add a p
			if (contents.length === 0) {
				let paragraph = document.createElement('p');
				collapsibleContentContainer.appendChild(paragraph);
			}
			if (contents.length >= 1) {
				for (let j = 0; j < contents.length; j++) {
					if (contents[j].nodeType === Node.TEXT_NODE) {
						//this probably shouldn't happen
						console.warn("Warning: accordion element with no wrapper will be placed in paragraph.");
						const originalText = collapsibleContentContainer.textContent.trim();
						const newParagraph = document.createElement('p');
						newParagraph.textContent = originalText;
						collapsibleContentContainer.innerHTML = '';
						collapsibleContentContainer.appendChild(newParagraph);
					}
				}
			}
			return collapsibleContentContainer;
		}
	}
	//Reaching here means the content editor must have deleted the collapsible-content div. This is fine.
	let collapsibleContentContainer = document.createElement('div');
	collapsibleContentContainer.setAttribute("class", "collapsible-content");
	if (children.length > 1) {
		//there should be nothing here unless something weird happened
		let looseElems = [];
		for (let i = 1; i < children.length; i++) {
			looseElems.push(children[i]);
		}
		for (let i = 0; i < looseElems.length; i++) {
			collapsibleContentContainer.appendChild(looseElems[i]);
		}
	} else {
		let newParagraph = document.createElement('p');
		newParagraph.innerHTML += "&nbsp;";
		collapsibleContentContainer.appendChild(newParagraph);
	}
	elem.appendChild(collapsibleContentContainer);
    return collapsibleContentContainer;
}

(function($) {
	CKEDITOR.plugins.add( 'accordion', {
		icons: 'accordion',
		init: function( editor ) {
			//detect enter key press
			editor.on('key', function(evt) {
				let collapsibleContainer;
				//if the cursor is inside the special "collapsible container"
				if (evt.data.keyCode === 13 && (collapsibleContainer = isInsideCollapsibleContainer(editor.getSelection().getStartElement()))) {
					// Move cursor to collapsible-content container
					var collapsibleContentElement = getCollapsibleContentContainerElement(collapsibleContainer);
					if (collapsibleContentElement) {
						let elem = CKEDITOR.dom.element.get(collapsibleContentElement);
						//set cursor to end of selection
						if (elem) {
							var lastChild = elem.getLast();
							if (lastChild) {
								var newRange = editor.createRange();
								newRange.moveToElementEditablePosition(lastChild, true);
								newRange.collapse();
								var selection = editor.getSelection();
								selection.selectRanges([newRange]);
							}
						}
						//cancel key event
						evt.cancel();
					}
				}
			});
			// set the behavior of accordion button
			editor.addCommand( 'accordion', {
				exec: function( editor ) {
					let selection = editor.getSelection();
					let ranges = selection.getRanges();
					//get contents of selection
					let fragment = ranges[0].extractContents();

					//create the container that will visualize the collapsible
					let container = CKEDITOR.dom.element.createFromHtml("<div/>", editor.document);
					container.setAttribute("class", "collapsible");
					var firstChild;
					// Identify the first child element i.e. the "button" that opens the accordion
					if (fragment.getFirst() && fragment.getFirst().type === CKEDITOR.NODE_TEXT) {
						// just one line is selected
						let textContent = fragment.getFirst().getText();
						let startElement = selection.getStartElement();
						let tagName = startElement.getName();
						let line = CKEDITOR.dom.element.createFromHtml(`<${tagName}/>`, editor.document);
						line.setHtml(textContent);
						firstChild = line;
						container.append(firstChild);
					} else {
						// multiple lines are selected, or nothing is selected
						container.append(fragment);
						firstChild = container.getFirst(); //null if nothing selected
					}
					
					if (firstChild) {
						// Create a new div for the remaining content
						let remainingContentDiv = CKEDITOR.dom.element.createFromHtml("<div/>", editor.document);
						remainingContentDiv.setAttribute("class", "collapsible-content");
						
						// Move the remaining content after the first child to the new div
						let children = false;
						while (firstChild.getNext()) {
							children = true;
							remainingContentDiv.append(firstChild.getNext());
						}

						if (!children) {
							let paragraph = CKEDITOR.dom.element.createFromHtml("<p/>", editor.document);
							remainingContentDiv.append(paragraph);
						}
						// Append the new div to the container
						container.append(remainingContentDiv);
					} else {
						// Empty accordion created when nothing selected
						let button = CKEDITOR.dom.element.createFromHtml("<h3/>", editor.document);
						let content = CKEDITOR.dom.element.createFromHtml("<div/>", editor.document);
						let paragraph = CKEDITOR.dom.element.createFromHtml("<p/>", editor.document);
						content.append(paragraph);
						content.setAttribute("class", "collapsible-content");
						container.append(button);
						container.append(content);
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
