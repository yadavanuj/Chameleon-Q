var IsIt = (function () {
	return {
		func: function (param) {
			return typeof param === 'function';
		},
		defined: function (param) {
			return param ? true : false;
		},
		array: function (param) {
			return Object.prototype.toString.call(param) === '[object Array]'
				? true
				: false;
		},
		emptyArray: function (param) {
			return this.array(param) && param.length === 0 ? true : false;
		},
		nonEmptyArray: function (param) {
			return this.array(param) && param.length !== 0 ? true : false;
		},
		string: function (param) {
			return typeof param === 'string' ? true : false;
		},
		number: function (param) {
			return typeof param === 'number' ? true : false;
		},
		undefined: function (param) {
			return typeof param === 'undefined' ? true : false;
		},
		object: function (param) {
			return typeof param === 'object' ? true : false;
		},
	};
})();

var Breeze = (function () {
	return {
		createBlock: function (tag, classes, textProvider) {
			let element = document.createElement(tag);
			if (element && IsIt.array(classes)) {
				classes.forEach((clazz) => {
					element.classList.add('' + clazz);
				});
			}

			if (element && IsIt.func(textProvider)) {
				let text = document.createTextNode(textProvider());
				element.appendChild(text);
			} 
			return element;
		}
	};
})();

let ClientPresenter = (function(){
    let clientResultArea = document.querySelector('#result-inner-client');
    
    return {
        render: function(packet){
            let classes = ['m-1', 'p-1', 'rounded', 'w-100'];
            let textProvider = () => { return `Message: ${packet.message.data.content} | Process By: ${packet.message.data.processBy}`;}
            let div = Breeze.createBlock('div', classes, textProvider);
            clientResultArea.appendChild(div);
        }
    }
})();

let ServerPresenter = (function(){
    let serverResultArea = document.querySelector('#result-inner-client');
    
    return {
        render: function(packet){
            let classes = ['m-1', 'p-1', 'rounded', 'w-100'];
            let textProvider = () => { return `ID: ${packet.id} | Acquired At: ${packet.acquiredAt}`;}
            let div = Breeze.createBlock('div', classes, textProvider);
            serverResultArea.appendChild(div);
        }
    }
})();

// Initial View
(function() {
    let clientIdDisplay = document.querySelector('#client-id');
    clientIdDisplay.innerText = Window.chameleon.ClientId;
})();