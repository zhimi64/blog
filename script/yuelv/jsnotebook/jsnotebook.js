

function _run_codeblock(_code_editor, _output_element, _context) {
	var _code = _code_editor.textContent;
	_output_element.innerText = "";
	console.log(_code_editor); 
	console.log(_output_element);
	console.log(_code);
	var _console_injector = new ConsoleInjector();
	_console_injector.inject();
	try {
		(function () {
			var _ans = eval(_code);
			_output_element.innerText = "返回值：" + _ans;
		}).bind(_context)();
	}
	catch (e) {
		console.log(e.stack);
	}
	_console_injector.recover();
	_output_element.innerText += "\n" + "日誌輸出：" + _console_injector.log; 
	console.log(_context);
}


function _prepare_codeblock(codeblock_element, context) {
	/*
	在頁面初始化時，將文檔內定義的代碼塊替換為實際HTML元素，並設置回調函數。
	*/
	var code = codeblock_element.innerText;
	var code_editor = document.createElement("pre");
	code_editor.setAttribute("contenteditable", "plaintext-only");
	code_editor.setAttribute("class", "jsnb_code_editor");
	console.log(code);
	code_editor.innerHTML = code;
	var output_element = document.createElement("div");
	var button_run = document.createElement("button");
	button_run.innerHTML = "運行";
	button_run.onclick = (function(code_editor, output_element) {
		_run_codeblock(code_editor, output_element, context);
	}).bind(null, code_editor, output_element);
	codeblock_element.innerHTML = "";
	codeblock_element.appendChild(code_editor);
	codeblock_element.appendChild(document.createElement("br"));
	codeblock_element.appendChild(button_run);
	codeblock_element.appendChild(output_element);
}

function jsnotebook_onload() {
	var context = new (function(){})();
	var code_blocks = document.getElementsByClassName("jsnb_block");
	[].forEach.call(code_blocks, function(ele) {
		_prepare_codeblock(ele, context);
	})
}

/*
為了獲取代碼塊內的程序運行結果，需要將系統的console.log函數替換為自己的。這時就需要使用
ConsoleInjector類。
*/
var ConsoleInjector = function() {
	var original_log = console.log; 
	this.log = "";
	this.inject = function() {
		console.log = function(message) {
			this.log += message.toString() + "\n"; 
			original_log.apply(console, arguments);
		}.bind(this);
	}.bind(this);
	this.recover = function() {
		console.log = original_log;
	}
}