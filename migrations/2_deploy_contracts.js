
var ProducerRole = artifacts.require("./Producer.sol");
var DistributorRole = artifacts.require("./Distributor.sol");
var RetailerRole = artifacts.require("./Retailer.sol");
var ConsumerRole = artifacts.require("./Consumer.sol");
var SupplyChain = artifacts.require("./SupplyChain.sol");

module.exports = function(deployer) {
  deployer.deploy(ProducerRole);
  deployer.deploy(DistributorRole);
  deployer.deploy(RetailerRole);
  deployer.deploy(ConsumerRole);
  deployer.deploy(SupplyChain);
};
