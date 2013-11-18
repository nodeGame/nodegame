var QUIZ = (function() {
    var node =  parent.node,
    J = parent.JSUS,
    W = parent.W;

    node.window.noEscape(window);

    var results = {};

    var answers = {
        howMuch: 100,
        reject: 3
    };
    
    node.env('auto', function(){
        node.set('QUIZ', results);
        node.timer.randomEmit('DONE', 2000);
    });

    function checkAnswer(a) {
        if (!a || !answers) return;
        
        var checked = getCheckedValue(a);  
        return checked != answers[a.name];
    }

    function checkAnswers(submitButton) {
        var correct, counter = 0;
        J.each(document.forms, function(a) {
            if (!results[a.name]) results[a.name] = [];
            correct = checkAnswer(a);
            
            if (correct) {
                W.highlight(a, 'ERR');
                document.getElementById(a.id + '_result').innerHTML = 'Wrong, try again';
                results[a.name].push(0);	 
            }
            else {  
                W.highlight(a, 'OK');
                document.getElementById(a.id + '_result').innerHTML = 'Correct!';
                results[a.name].push(1);
                counter++;
            }
        });
        
        document.getElementById('answers_counter').innerHTML = counter + ' / ' + document.forms.length;
        
        if (counter === document.forms.length) {
            submitButton.disabled = true;
            node.set('QUIZ', results);
            node.timer.randomEmit('DONE', 3000);
        }
        
    }

    function getCheckedValue(radioObj) {
        if (!radioObj) return;
        
        if (radioObj.length) {
            for (var i = 0; i < radioObj.length; i++) {
	        if (radioObj[i].checked) {
		    return radioObj[i].value;
	        }
	    }
        }
        
        return radioObj.checked;
    }

    // set the radio button with the given value as being checked
    // do nothing if there are no radio buttons
    // if the given value does not exist, all the radio buttons
    // are reset to unchecked
    function setCheckedValue(radioObj, newValue) {
        if (!radioObj)
	    return;
        var radioLength = radioObj.length;
        if (radioLength == undefined) {
	    radioObj.checked = (radioObj.value == newValue.toString());
	    return;
        }
        for (var i = 0; i < radioLength; i++) {
	    radioObj[i].checked = false;
	    if (radioObj[i].value == newValue.toString()) {
	        radioObj[i].checked = true;
	    }
        }
    }

    return {
        setCheckedValue: setCheckedValue,
        getCheckedValue: getCheckedValue,
        checkAnswers: checkAnswers
    };

})();