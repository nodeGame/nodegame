(function(node) {
	
	/*!
	 * Document
	 * 
	 */
	var JSUS = node.JSUS;
	
	// Create the window obj
	node.window = {};
	
	// Note: this will be erased, when the GameWindow obj will be created
	node.window.Document = Document;
	
	function Document() {};
	
	Document.prototype.getElement = function (elem, id, attributes) {
		var e = document.createElement(elem);
		if ('undefined' !== typeof id) {
			e.id = id;
		}
		return this.addAttributes2Elem(e, attributes);
	};
	
	Document.prototype.addElement = function (elem, root, id, attributes) {
		var el = this.getElement(elem, id, attributes);
		return root.appendChild(el);
		
	};
	
	Document.prototype.addAttributes2Elem = function (e, a) {
		if (!e || !a) return e;
		if ('object' != typeof a) return e;
		var specials = ['id', 'label', 'style'];
		for (var key in a) {
			if (a.hasOwnProperty(key)) {
				if (!JSUS.in_array(key, specials)) {
					e.setAttribute(key,a[key]);
				}
				else if (key === 'id') {
					e.id = a[key];
				}
				
				// TODO: handle special cases
				
//				else {
//			
//					// If there is no parent node, the legend cannot be created
//					if (!e.parentNode) {
//						node.log('Cannot add label: no parent element found', 'ERR');
//						continue;
//					}
//					
//					this.addLabel(e.parentNode, e, a[key]);
//				}
			}
		}
		return e;
	};
	
	Document.prototype.getButton = function (id, text, attributes) {
		var sb = document.createElement('button');
		sb.id = id;
		sb.appendChild(document.createTextNode(text || 'Send'));	
		return this.addAttributes2Elem(sb, attributes);
	};
	
	Document.prototype.addButton = function (root, id, text, attributes) {
		var b = this.getButton(id, text, attributes);
		return root.appendChild(b);
	};
	
	Document.prototype.getFieldset = function (id, legend, attributes) {
		var f = this.getElement('fieldset', id, attributes);
		var l = document.createElement('Legend');
		l.appendChild(document.createTextNode(legend));	
		f.appendChild(l);
		return f;
	};
	
	Document.prototype.addFieldset = function (root, id, legend, attributes) {
		var f = this.getFieldset(id, legend, attributes);
		return root.appendChild(f);
	};
	
	Document.prototype.getTextInput = function (id, attributes) {
		var mt =  document.createElement('input');
		mt.id = id;
		mt.setAttribute('type', 'text');
		return this.addAttributes2Elem(mt, attributes);
	};
	
	Document.prototype.addTextInput = function (root, id, attributes) {
		var ti = this.getTextInput(id, attributes);
		return root.appendChild(ti);
	};
	
	Document.prototype.getCanvas = function (id, attributes) {
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');
			
		if (!context) {
			alert('Canvas is not supported');
			return false;
		}
		
		canvas.id = id;
		return this.addAttributes2Elem(canvas, attributes);
	};
	
	Document.prototype.addCanvas = function (root, id, attributes) {
		var c = this.getCanvas(id, attributes);
		return root.appendChild(c);
	};
		
	Document.prototype.getSlider = function (id, attributes) {
		var slider = document.createElement('input');
		slider.id = id;
		slider.setAttribute('type', 'range');
		return this.addAttributes2Elem(slider, attributes);
	};
	
	Document.prototype.addSlider = function (root, id, attributes) {
		var s = this.getSlider(id, attributes);
		return root.appendChild(s);
	};
	
	Document.prototype.getRadioButton = function (id, attributes) {
		var radio = document.createElement('input');
		radio.id = id;
		radio.setAttribute('type', 'radio');
		return this.addAttributes2Elem(radio, attributes);
	};
	
	Document.prototype.addRadioButton = function (root, id, attributes) {
		var rb = this.getRadioButton(id, attributes);
		return root.appendChild(rb);
	};
	
//	Document.prototype.addJQuerySlider = function (root, id, attributes) {
//		var slider = document.createElement('div');
//		slider.id = id;
//		slider.slider(attributes);
//		root.appendChild(slider);
//		return slider;
//	};
	
	Document.prototype.getLabel = function (forElem, id, labelText, attributes) {
		if (!forElem) return false;
		var label = document.createElement('label');
		label.id = id;
		label.appendChild(document.createTextNode(labelText));
		
		if ('undefined' === typeof forElem.id) {
			forElem.id = this.generateUniqueId();
		}
		
		label.setAttribute('for', forElem.id);
		this.addAttributes2Elem(label, attributes);
		return label;
	};
	

	Document.prototype.addLabel = function (root, forElem, id, labelText, attributes) {
		if (!root || !forElem || !labelText) return false;		
		var l = this.getLabel(forElem, id, labelText, attributes);
		root.insertBefore(l, forElem);
		return l;
	};
	
	Document.prototype.getSelect = function (id, attributes) {
		return this.getElement('select', id, attributes);
	};
	
	Document.prototype.addSelect = function (root, id, attributes) {
		return this.addElement('select', root, id, attributes);
	};
	
	Document.prototype.populateSelect = function (select, list) {
		if (!select || !list) return;
		for (var key in list) {
			if (list.hasOwnProperty(key)) {
				var opt = document.createElement('option');
				opt.value = list[key];
				opt.appendChild(document.createTextNode(key));
				select.appendChild(opt);
			}
		}
	};
	
	Document.prototype.write = function (root, text) {
		if (!root) return;
		if (!text) return;
		var content = (!JSUS.isNode(text) || !JSUS.isElement(text)) ? document.createTextNode(text) : text;
		node.log('ROOT');
		node.log(root);
		node.log('TEXT');
		node.log(content);
		root.appendChild(content);
		return content;
	};
	
	Document.prototype.writeln = function (root, text, rc) {
		if (!root) return;
		var br = this.addBreak(root, rc);
		return (text) ? Document.prototype.write(root, text) : br;
	};
	
	// IFRAME
	
	Document.prototype.getIFrame = function (id, attributes) {
		var attributes = {'name' : id}; // For Firefox
		return this.getElement('iframe', id, attributes);
	};
	
	Document.prototype.addIFrame = function (root, id, attributes) {
		var ifr = this.getIFrame(id, attributes);
		return root.appendChild(ifr);
	};
	
	
	// BR
	
	Document.prototype.addBreak = function (root, rc) {
		var RC = rc || 'br';
		var br = document.createElement(RC);
		return root.appendChild(br);
		//return this.insertAfter(br,root);
	};
	
	// CSS
	
	Document.prototype.addCSS = function (root, css, id, attributes) {
		
		var attributes = attributes || {'rel' : 'stylesheet',
										'type': 'text/css'};
		
		attributes.href = css;
		
		var id = id || 'maincss';
		
		return this.addElement('link', root, id, attributes);
	};
	
	Document.prototype.getDiv = function (id, attributes) {
		return this.getElement('div', id, attributes);
	};
	
	Document.prototype.addDiv = function (root, id, attributes) {
		return this.addElement('div', root, id, attributes);
	};
	
	
	Document.prototype.highlight = function (elem, code) {
		if (!elem) return;
		
		// default value is ERR		
		switch (code) {	
			case 'OK':
				var color =  'green';
				break;
			case 'WARN':
				var color = 'yellow';
				break;
			default:
				var color = 'red';
		}
		
		return this.addBorder(elem,color);
	};
	
	Document.prototype.addBorder = function (elem, color, witdh, type) {
		if (!elem) return;
		
		var color = color || 'red';
		var width = width || '5px';
		var type = type || 'solid';
		
		var properties = { border: width + ' ' + type + ' ' + color }
		return this.style(elem,properties);
	};
	
	Document.prototype.style = function (elem, properties) {
		if (!elem || !properties) return;
		
		var style = '';
		for (var i in properties) {
			style += i + ': ' + properties[i] + '; ';
		};
		return elem.setAttribute('style',style);
	};
	
	Document.prototype.removeClass = function (el, c) {
		if (!el || !c) return;
		var regexpr = '/(?:^|\s)' + c + '(?!\S)/';
		el.className = el.className.replace( regexpr, '' );
		return el;
	};

	Document.prototype.addClass = function (el, c) {
		if (!el || !c) return;
		if (c instanceof Array) c = c.join(' ');
		if ('undefined' === typeof el.className) {
			el.className = c;
		} 
		else {
			el.className += ' ' + c;
		}
		return el;
	  };
	
	Document.prototype.removeChildrenFromNode = function (e) {
		
	    if (!e) return false;
	    
	    while (e.hasChildNodes()) {
	        e.removeChild(e.firstChild);
	    }
	    return true;
	};
	
	Document.prototype.insertAfter = function (node, referenceNode) {
		  referenceNode.insertBefore(node, referenceNode.nextSibling);
	};
	
	/**
	 * Generate a unique id for the page (frames included).
	 * 
	 * TODO: now it always create big random strings, it does not actually
	 * check if the string exists.
	 * 
	 */
	Document.prototype.generateUniqueId = function (prefix) {
		var search = [window];
		if (window.frames) {
			search = search.concat(window.frames);
		}
		
		function scanDocuments(id) {
			var found = true;
			while (found) {
				for (var i=0; i< search.length; i++) {
					found = search[i].document.getElementById(id);
					if (found) {
						id = '' + id + '_' + JSUS.randomInt(0, 1000);
						break;
					}
				}
			}
			return id;
		};

		
		return scanDocuments(prefix + '_' + JSUS.randomInt(0, 10000000));
		//return scanDocuments(prefix);
	};

})(window.node);