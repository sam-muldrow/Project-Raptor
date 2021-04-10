var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

var subscribeMessage = {
    "id": 1,
    "method": "subscribe",
    "params": [
        "ETHUSD-PERP@trades"
    ]
}

var verifyUser = {
    "id":2,
    "method":"auth",
    "params":{
        "type":"token",
        "value":"302e5d49a0d5af63c065b56dd9bf4e3cb66b7a1d"
    }
}

var submitBuy = {
    "id":6,
    "method":"placeOrder",
    "params":{
        "symbol":"ETHUSD-PERP",
        "clOrdId":"RAPTOR",
        "ordType":"MARKET",
        "timeInForce":"IOC",
        "side":"BUY",
        "px": 0,
        "qty":1
    }
}

var submitCloseShort= {
    "id":3,
    "method":"placeOrder",
    "params":{
        "symbol":"ETHUSD-PERP",
        "clOrdId":"RAPTOR",
        "ordType":"LIMIT",
        "timeInForce":"IOC",
        "side":"BUY",
        "px":0,
        "qty":1
    }
}
var submitOpenShort= {
    "id":3,
    "method":"placeOrder",
    "params":{
        "symbol":"ETHUSD-PERP",
        "ordType":"MARKET",
        "timeInForce":"IOC",
        "side":"SELL",
        "px":0,
        "qty":1
    }
}

var closePosition = {
    "id":8,
    "method":"closePosition",
    "params":{
        "symbol":"ETHUSD-PERP",
        "ordType":"MARKET",
        "px":0
    }
}

var cancelSell = {
    "id":4,
    "method":"cancelOrder",
    "params":{
        "symbol":"ETHUSD-PERP",
        "clOrdId":"RAPTORSELL"
    }
} 


var submitSell = {
    "id":3,
    "method":"placeOrder",
    "params":{
        "symbol":"ETHUSD-PERP",
        "clOrdId":"RAPTORSELL",
        "ordType":"LIMIT",
        "timeInForce":"GTC",
        "side":"SELL",
        "px": 0,
        "qty":1
    }
}

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

var currentBuy;
var isInTrade = false;
var profit = 0;
var currentPX = 0;
var isShort = false;
var pastOrder;
client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
           console.log("Received: '" + message.utf8Data + "'");
            
            if(message.utf8Data == 'ping') {
                connection.send('pong');
            } else {



                messageObject = JSON.parse(message.utf8Data);
                //console.log(messageObject);
                if(messageObject.id == 6){
                   submitSell.params.px = currentBuy +.25;
                    console.log(submitSell)
                   // connection.send(JSON.stringify(submitSell));
                }
                if(messageObject.id == undefined && messageObject.ch == 'trades'){
                    console.log(messageObject.data.trades[0]);
                    var trade = messageObject.data.trades[0]
                    currentPX = trade.px;
                    if(true) {
                        
                        if(trade.qty >= 10 && trade.side == 'BUY') {
                            submitBuy.params.px = trade.px;
                            connection.send(JSON.stringify(submitBuy));
                            currentBuy = trade.px;
                            isInTrade = true;
                            isShort = false;
                            console.log("Buying at: " + currentBuy);
                            submitSell.params.px = currentBuy +.50;
                            console.log(submitSell)
                            connection.send(JSON.stringify(submitSell));
                        }
                        
                        /*
                        if(trade.side == 'SELL') {
                            if(pastOrder != undefined && pastOrder.side == 'SELL'){
                                connection.send(JSON.stringify(submitSell));
                                currentBuy = trade.px;
                                isInTrade = true;
                                isShort = true;
                            //    console.log("Buying at: " + currentBuy);
                               // submitSell.params.px = currentBuy -.50;
                               // submitCloseShort.params.px = currentBuy -.75;
                               // console.log(submitSell)
                            }
                            //connection.send(JSON.stringify(submitCloseShort));
                        }
                        
                    pastOrder = trade;
                    } else {
                        /*
                        if( isShort == false && trade.px > currentBuy){
                            connection.send(JSON.stringify(submitSell));
                            isInTrade = false;
                            profit += (trade.px - currentBuy);
                            console.log("Selling at: " + trade.px);
                            console.log("Profit is now: " + profit);
                            
                        }
                        */
                    }

                    
                }
            }
        }

        
    });
    connection.send(JSON.stringify(subscribeMessage));
    connection.send(JSON.stringify(verifyUser));
    var myInt = setInterval(function () {

        
        connection.send(JSON.stringify(cancelSell));
        connection.send(JSON.stringify(closePosition));
        
    }, 130000);
});
client.connect('wss://ws.mapi.digitexfutures.com');
/*

*/
//client.connect('wss://ws.tapi.digitexfutures.com');

//44e06f4d5c6ba34881c34348004da5d3039c6028