// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact

var SupplyChain = artifacts.require('SupplyChain')

contract('SupplyChain', function(accounts) {
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    var sku = 4
    var upc = 1
    var ownerID = accounts[0]
    const originProducerID = accounts[1]
    const originProducerName = "John Doe"
    const originProducerInformation = "Yarray Valley"
    const originFarmLatitude = "-38.239770"
    const originFarmLongitude = "144.341490"
    //var productID = upc + sku
    //const productNotes = "Best beans for Espresso"
    var numOfUnits=2
    const productPrice = web3.utils.toWei('1', "ether")
    var itemState = 0
    var bestBefore=10
    var productNum= 1
    const distributorID = accounts[2]
    const retailerID = accounts[3]
    const consumerID = accounts[4]



    console.log("<----------------ACCOUNTS----------------> ")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Producer: accounts[1] ", accounts[1])
    console.log("Distributor: accounts[2] ", accounts[2])
    console.log("Retailer: accounts[3] ", accounts[3])
    console.log("Consumer: accounts[4] ", accounts[4])

    console.log("<-------TESTING CONTRACT FUNCTIONS------->")
    // 1st Test
    it("Testing smart contract function produceItem() that allows a Producer to produce a Product", async() => {
        const supplyChain = await SupplyChain.deployed();

        // Add Producer address to ProducerRole
        await supplyChain.addProducer(originProducerID)

        // Declare and Initialize a variable for event
        var eventEmitted = false;

        // Mark an item as Harvested by calling function harvestItem()
        await supplyChain.produceItemByProducer(upc, bestBefore, sku,productNum, originProducerName, originProducerInformation, originFarmLatitude, originFarmLongitude, productPrice, {from:originProducerID})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // check for last past emitted events
        await supplyChain.getPastEvents('ProduceByProducer', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Update test OwnerID (Following the item ownerID through the contract)
        ownerID = originProducerID;

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], ownerID, 'Error: Missing or Invalid ownerID')
        //assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferOne[3], originProducerID, 'Error: Missing or Invalid originProducerID')
        assert.equal(resultBufferOne[4], originProducerName, 'Error: Missing or Invalid originProducerName')
        assert.equal(resultBufferOne[5], originProducerInformation, 'Error: Missing or Invalid originProducerInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[4], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[5], bestBefore, 'Error: Invalid Expiry Date')
        assert.equal(resultBufferTwo[6], productNum, 'Error: Invalid Product Type')
        assert.equal(eventEmitted, true, 'Invalid event emitted')

    })

    // 2nd Test
    it("Testing smart contract function sellItemByProducer() that allows a Producer to sell a Product", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 1
        // Mark an item as Processed by calling function processtItem()
        await supplyChain.sellItemByProducer(upc,productPrice,{from: originProducerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Watch the emitted event Processed()
        await supplyChain.getPastEvents('ForSaleByProducer', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
            //console.log(events) // same results as the optional callback above
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], ownerID, 'Error: Missing or Invalid ownerID')
        //assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferOne[3], originProducerID, 'Error: Missing or Invalid originProducerID')
        assert.equal(resultBufferOne[4], originProducerName, 'Error: Missing or Invalid originProducerName')
        assert.equal(resultBufferOne[5], originProducerInformation, 'Error: Missing or Invalid originProducerInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[4], itemState, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')

    })

    // 3rd Test
    it("Testing smart contract function purchaseItemByDistributor() that allows a distributor to buy a Product", async() => {
        const supplyChain = await SupplyChain.deployed()

        await supplyChain.addDistributor(distributorID);

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 2

        var balance = web3.utils.toWei('10', "ether")
        //console.log(balance)
        // Mark an item as Packed by calling function packItem()
        await supplyChain.purchaseItemByDistributor(upc,{from: distributorID,value: balance});


        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Watch the emitted event Packed()
        await supplyChain.getPastEvents('PurchasedByDistributor', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
            console.log(events) // same results as the optional callback above

        });

        //const hash = await supplyChain._upcTxLookup(upc);
        //console.log(hash)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], distributorID, 'Error: Missing or Invalid ownerID')
        //assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferOne[3], originProducerID, 'Error: Missing or Invalid originProducerID')
        assert.equal(resultBufferOne[4], originProducerName, 'Error: Missing or Invalid originProducerName')
        assert.equal(resultBufferOne[5], originProducerInformation, 'Error: Missing or Invalid originProducerInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[4], itemState, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 4th Test
    it("Testing smart contract function shippedItemByProducer() that allows a Producer to ship a Product ", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 3
        // Mark an item as ForSale by calling function sellItem()
        await supplyChain.shippedItemByProducer(upc,{from: originProducerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)


        // Watch the emitted event ForSale()
        await supplyChain.getPastEvents('ShippedByProducer', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;

        });
        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], distributorID, 'Error: Missing or Invalid ownerID')
        //assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferOne[3], originProducerID, 'Error: Missing or Invalid originProducerID')
        assert.equal(resultBufferOne[4], originProducerName, 'Error: Missing or Invalid originProducerName')
        assert.equal(resultBufferOne[5], originProducerInformation, 'Error: Missing or Invalid originProducerInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[4], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[2], productPrice, 'Error: Invalid price')
        assert.equal(eventEmitted, true, 'Invalid event emitted')

    })

    // 5th Test
    it("Testing smart contract function receivedItemByDistributor() that allows a distributor to receive a Product", async() => {
        const supplyChain = await SupplyChain.deployed()
        //await supplyChain.addDistributor(distributorID);

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 4

        // Mark an item as Sold by calling function buyItem()
        await supplyChain.receivedItemByDistributor(upc,{from: distributorID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Watch the emitted event Sold()
        await supplyChain.getPastEvents('ReceivedByDistributor', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // change ownerID to distributorID
        //ownerID = distributorID

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        //assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferOne[2], distributorID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[4], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[7], distributorID, 'Error: Invalid distributorID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 6th Test
    it("Testing smart contract function processedItemByDistributor() that allows a distributor to process a Product", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 5
        // Watch the emitted event ProcessedByDistributor()
        await supplyChain.processedItemByDistributor(upc,{from: distributorID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Watch the emitted event ProcessedByDistributor
        await supplyChain.getPastEvents('ProcessedByDistributor', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        //assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferOne[2], distributorID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[4], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[7], distributorID, 'Error: Invalid distributorID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

    // 7th Test
    it("Testing smart contract function packageItemByDistributor() that allows a distributor to package a Product", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 6;
        //ownerID = reatilerID
        // Mark an item as Sold by calling function buyItem()
        await supplyChain.packageItemByDistributor(upc,{from: distributorID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Watch the emitted event Shipped
        await supplyChain.getPastEvents('PackagedByDistributor', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        //assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferOne[2], distributorID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[4], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[7], distributorID, 'Error: Invalid retailerID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')

    })

    // 8th Test
    it("Testing smart contract function sellItemByDistributor() that allows a distributor to sell a Product", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 7;

        //ownerID = consumerID;

        await supplyChain.sellItemByDistributor(upc,productPrice,{from: distributorID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Watch the emitted event Shipped
        await supplyChain.getPastEvents('ForSaleByDistributor', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        //assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferOne[2], distributorID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[4], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[7], distributorID, 'Error: Invalid distributorID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')

    })

    // 9th Test
    it("Testing smart contract function purchaseItemByRetailer() that allows a retailer to purchase a Product", async() => {
        const supplyChain = await SupplyChain.deployed()

        await supplyChain.addRetailer(retailerID);
        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 8;

        var balance = web3.utils.toWei('12', "ether")

        await supplyChain.purchaseItemByRetailer(upc,{from: retailerID,value: balance});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Watch the emitted event Shipped
        await supplyChain.getPastEvents('PurchasedByRetailer', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        //assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferOne[2], retailerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[4], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[8], retailerID, 'Error: Invalid retailerID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')

    })

    // 10th Test
    it("Testing smart contract function shippedItemByDistributor() that allows a distributor to ship a Product", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 9;

        //ownerID = consumerID;

        await supplyChain.shippedItemByDistributor(upc,{from: distributorID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Watch the emitted event Shipped
        await supplyChain.getPastEvents('ShippedByDistributor', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        //assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferOne[2], retailerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[4], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[7], distributorID, 'Error: Invalid distributorID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')

    })

    // 11th Test
    it("Testing smart contract function receivedItemByRetailer() that allows a retailer to receive a Product", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 10;

        //ownerID = consumerID;

        await supplyChain.receivedItemByRetailer(upc,{from: retailerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Watch the emitted event Shipped
        await supplyChain.getPastEvents('ReceivedByRetailer', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        //assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferOne[2], retailerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[4], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[8], retailerID, 'Error: Invalid distributorID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')

    })

    // 12th Test
    it("Testing smart contract function sellItemByRetailer() that allows a retailer to sell a Product", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 11;

        //ownerID = consumerID;

        await supplyChain.sellItemByRetailer(upc,productPrice,{from: retailerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Watch the emitted event Shipped
        await supplyChain.getPastEvents('ForSaleByRetailer', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });


        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        //assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferOne[2], retailerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[4], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[8], retailerID, 'Error: Invalid distributorID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')

    })

    // 13th Test
    it("Testing smart contract function purchaseItemByConsumer() that allows a consumer to purchase a Product", async() => {
        const supplyChain = await SupplyChain.deployed()
        await supplyChain.addConsumer(consumerID)
        // Declare and Initialize a variable for event
        var eventEmitted = false;
        itemState = 13;
        var balance = web3.utils.toWei('15', "ether")
        //ownerID = consumerID;

        await supplyChain.purchaseItemByConsumer(upc,numOfUnits,{from: consumerID,value: balance});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Watch the emitted event Shipped
        await supplyChain.getPastEvents('PurchasedByConsumer', {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error, events) => { console.log(events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        // Verify the result set
        assert.equal(resultBufferOne[0], sku-numOfUnits, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        //assert.equal(resultBufferTwo[2], productID,'Error: Missing or Invalid productID')
        assert.equal(resultBufferOne[2], consumerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[4], itemState, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[9], consumerID, 'Error: Invalid distributorID ')
        assert.equal(eventEmitted, true, 'Invalid event emitted')

    })

    // 14th Test
    it("Testing smart contract function fetchItemBufferOne()", async() => {
        const supplyChain = await SupplyChain.deployed();

        const resultBufferOne = await supplyChain.fetchItemBufferOne(upc);
        // Verify the result set
        assert.equal(resultBufferOne[0],sku-numOfUnits,"Error: Invalid item SKU")
        assert.equal(resultBufferOne[1],upc,"Error: Invalid item UPC")
        assert.equal(resultBufferOne[2],consumerID,"Error: Invalid OwnerID")
        assert.equal(resultBufferOne[3],originProducerID,"Error: Invalid originFarmID")
        assert.equal(resultBufferOne[4],originProducerName,"Error: Invalid originProducerName")
        assert.equal(resultBufferOne[5],originProducerInformation,"Error: Invalid originProducerInformation")
        assert.equal(resultBufferOne[6],originFarmLatitude,"Error: Invalid originFarmLatitude")
        assert.equal(resultBufferOne[7],originFarmLongitude,"Error: Invalid originFarmLongitude")

    })

    // 15th Test
    it("Testing smart contract function fetchItemBufferTwo()", async() => {
        const supplyChain = await SupplyChain.deployed()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo(upc);
        // Verify the result set
        assert.equal(resultBufferTwo[0],sku-numOfUnits, "Error: Invalid item SKU")
        assert.equal(resultBufferTwo[1],upc, "Error: Invalid item UPC")
        //assert.equal(resultBufferTwo[2],productID, "Error: Invalid item productID")
        //assert.equal(resultBufferTwo[3],productNotes, "Error: Invalid productnote")
        assert.equal(resultBufferTwo[2],productPrice, "Error: Invalid productPrice")
        assert.equal(resultBufferTwo[4],itemState, "Error: Invalid itemState")
        assert.equal(resultBufferTwo[7],distributorID, "Error: Invalid distributorID")
        assert.equal(resultBufferTwo[8],retailerID, "Error: Invalid retailerID")
        assert.equal(resultBufferTwo[9],consumerID, "Error : Invalid consumerID")

    })
// async function to help check block hashTx
async function getTx(blockNumber){
    let tx1 = await web3.eth.getBlock(blockNumber);
    return  (await web3.eth.getTransaction(tx1.transactions[0]));
}

    // 16th Test
    it("Testing smart contract function fetchItemHistory()", async() => {
        const supplyChain = await SupplyChain.deployed()
        const resultItemHistory = await supplyChain.fetchitemHistory(upc);
        // get TX value from block number
        const FTD = await getTx(resultItemHistory[0].toString());
        const DTR = await getTx(resultItemHistory[1].toString());
        const RTC = await getTx(resultItemHistory[2].toString());
        // Verify the result set
        assert.equal(FTD.from,distributorID,"Error: Invalid transaction between Producer and distributor")
        assert.equal(DTR.from,retailerID,"Error: Invalid transaction between retailer and distributor")
        assert.equal(RTC.from,consumerID,"Error: Invalid transaction between consumer and retailer")

    })

});
