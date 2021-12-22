(function(root, factory){
	if(typeof define === 'function' && define.amd){
		define([], factory);
	}else{
		root.Printer = factory(root);
	}
}(this, function(root){
	var Printer = {};
	Printer.printer = {"version": "0.0.1"};
	var init_options = {
		"speed" : 50,		
		"selector" : 'canvas',				
		"startIndex" : 0,		
		"endIndex" : 0,		
		"hasCur" : true,		
		"curId" : 'cur',		
		"curStr" : '_',		
		"curStyle" : 'font-weight: bold;',	
		"curSpeed" : 100,		
		"lnStr": ""
	};



	var str = "", options = init_options;
	var flwCurTimer, dom, curObj, reStr='', curSwitch,index=0;

	Printer.init = function(arg_str, arg_options){
		str = arg_str;
		for( var option in arg_options ){
			options[option] = arg_options[option];
		}
		dom = document.getElementById(options.selector);
		index = options.startIndex;
		options.endIndex = options.endIndex == 0 ? str.length : options.endIndex
		options.hasCur && flwCur();
		return this;
	}


	Printer.print = function(){	
		for(var i=0; i<str.length; i++) {
			(function(index){
				setTimeout(function(){	
					if (str.charAt(index) === '\n'){
						reStr += '<br>' + options.lnStr;
					} else {
						reStr += str.charAt(index);
					}
					dom.innerHTML= options.lnStr + reStr
				}, options.speed * (index + 1))
			})(i);
		}

		setTimeout(function(){
			if(options.hasCur){
				var element = document.createElement("span");
				element.id = options.curId
				dom.appendChild(element);

				curObj = document.getElementById(options.curId);
				clearTimeout(flwCurTimer);
				setInterval(chCur, options.curSpeed);
			}
		}, options.speed * str.length)
	}

	function flwCur(){	
		dom.innerHTML += '<span id="'+options.curId+'" style="'+options.curStyle+'">'+options.curStr+'</span>';
		flwCurTimer = setTimeout(flwCur, 1.5 * options.speed);
	}

	function chCur(){	
		curObj.innerHTML = curSwitch ? options.curStr : "";
		curSwitch = !curSwitch
	}

	return Printer;
}));


