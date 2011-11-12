(function (exports) {
	

	/**
	 * Controls
	 * 
	 */
	
	exports.Controls = Controls;	
	exports.Controls.Slider = SliderControls;
	exports.Controls.Radio	= RadioControls;
	
		
	function Controls (options) {
		this.name = 'Controls'
		this.version = '0.1';
		
		this.id = options.id || this.name;
		
		this.add = null;
		
		// Init the list
		if (options.features) {
			this.init(features);
		}
		
	};

	SliderControls.prototype.__proto__ = Controls.prototype;
	SliderControls.prototype.constructor = SliderControls;
	
	function SliderControls (options) {
		Controls.call(this,options);
		this.name = 'SliderControls'
		this.version = '0.2';
		this.id = options.id || this.name;
		
		this.add = function (root, id, attributes) {
			node.window.addSlider(root, id, attributes);
		};
	};
	
	RadioControls.prototype.__proto__ = Controls.prototype;
	RadioControls.prototype.constructor = RadioControls;
	
	function RadioControls (options) {
		Controls.call(this,options);
		this.name = 'RadioControls'
		this.version = '0.1';
		this.id = options.id || this.name;
		
		this.add = function (root, id, attributes) {
			node.window.addRadioButton(root, id, attributes);
		};
	};
	
	Controls.prototype.init = function (features) {
		this.features = features;
		this.list = new node.window.List();
		this.populate();
	};
	
	Controls.prototype.append = function(root) {	
		var listRoot = this.list.getRoot();
		root.appendChild(listRoot);
		this.populate();
	};
	
	
	Controls.prototype.populate = function () {
		//debugger
		for (var key in this.features) {
			if (this.features.hasOwnProperty(key)) {
				
				// Prepare the attributes vector
				var attributes = this.features[key];
				var id = key;
				if (attributes.id) {
					var id = attributes.id;
					delete attributes.id;
				}
				
				var item = this.list.getItem();
				listRoot.appendChild(item);
				
				//var attributes = {min: f.min, max: f.max, step: f.step, value: f.value};
				//var slider = node.window.addJQuerySlider(item, id, attributes);
				
				var elem = this.add(item, id, attributes);
				
				//var slider = node.window.addSlider(item, id, attributes);
				
				
				// If a label element is present it checks whether it is an
				// object literal or a string.
				// In the former case it scans the obj for additional properties
				if (f.label) {
					var labelId = 'label_' + id;
					var labelText = f.label;
					
					if (typeof(f.label) === 'object') {
						var labelText = f.label.text;
						if (f.label.id) {
							labelId = f.label.id; 
						}
					}
					
					node.window.addLabel(elem, labelId, labelText, id);
				}
				
				
			}
		}
	};
	
	Controls.prototype.listeners = function() {};
	
	Controls.prototype.getAllValues = function() {
		var out = {};
		for (var key in this.features) {
			
			if (this.features.hasOwnProperty(key)) {
				//console.log('STE ' + key + ' ' + node.window.getElementById(key).value);
				out[key] = Number(node.window.getElementById(key).value);
			}
		}
		
		return out;
	};
	
	
})(node.window.widgets);