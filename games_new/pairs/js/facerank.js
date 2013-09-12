

 // TODO: move in the appropriate place
  node.on('DONE', function() {
      
      var radios, value;
      var i;

      radios = document.getElementsByTagName('input');
      for (i = 0; i < radios.length; i++) {
          if (radios[i].type === 'radio' && radios[i].checked) {
              // get value, set checked flag or do whatever you need to
              value = radios[i].value;       
          }
      }

      
  }