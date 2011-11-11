(function (exports) {
	

	/*!
	 * Slider Controls
	 * 
	 */
	
	exports.SliderControls = SliderControls;	
		
	function SliderControls (id, features) {
		this.name = 'Slider Controls'
		this.version = '0.1';
		
		this.id = id;
		this.features = features;
		
		this.list = new node.window.List();
	};
	
	SliderControls.prototype.append = function(root) {
		
		var listRoot = this.list.getRoot();
		root.appendChild(listRoot);
		//debugger
		for (var key in this.features) {
			if (this.features.hasOwnProperty(key)) {
				
				var f = this.features[key];
				var id = f.id || key;
				
				var item = this.list.getItem();
				listRoot.appendChild(item);
				
				var attributes = {min: f.min, max: f.max, step: f.step, value: f.value};
				//var slider = node.window.addJQuerySlider(item, id, attributes);
				var slider = node.window.addSlider(item, id, attributes);
				
				
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
					
					node.window.addLabel(slider, labelId, labelText, id);
				}
				
				
			}
		}
	};
	
	SliderControls.prototype.listeners = function() {
		
	};
	
	SliderControls.prototype.getAllValues = function() {
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