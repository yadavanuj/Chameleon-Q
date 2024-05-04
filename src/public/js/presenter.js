function createCell(content, processBy) {
    let div = document.createElement("div");
    div.classList.add("m-1");
    div.classList.add("p-1");
    div.classList.add("rounded");
    div.classList.add("w-100");

    let text = document.createTextNode(`Message: ${content} | Process By: ${processBy}`);
    div.appendChild(text);

    return div;
}

let ClientPresenter = (function(){
    let clientResultArea = document.querySelector('#result-inner-client');
    
    return {
        render: function(packet){
            let div = createCell(packet.message.data.content, packet.message.data.processBy);
            clientResultArea.appendChild(div);
        }
    }
})();


// Initial View
(function() {
    let clientIdDisplay = document.querySelector('#client-id');
    clientIdDisplay.innerText = Window.chameleon.ClientId;
})();