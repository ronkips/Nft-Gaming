import React, { useEffect, useState } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import SelectCharacter from "./Components/SelectCharacter";
import myEpicGame from "./utils/MyEpicGame.json";
import { CONTRACT_ADDRESS, transformCharacterData } from "./constants";
import { ethers } from "ethers";
import Arena from "./Components/Arena";
// Constants
const TWITTER_HANDLE = "ronkips01";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  //useState
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);

  // implement the connect wallet
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      //Request access to the account
      const accounts = await ethereum.request({
        method: "eth_requestAccounts"
      });
      //print out the wallet address once we authorize the access
      console.log("Connected succesfully", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log("wueh!!.. sa utado??", error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);

        /*
         * Check if we're authorized to access the user's wallet
         */
        const accounts = await ethereum.request({ method: "eth_accounts" });

        /*
         * User can have multiple authorized accounts, we grab the first one if its there!
         */
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account);
        } else {
          console.log("No authorized account found");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  //checking the network
  // const checkNetwork = async () => {
  //   try {
  //     if (window.ethereum.networkNersion !== "5") {
  //       alert("Please connect to Goerli");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  // checkNetwork()
  //Render Methods
  const renderContent = () => {
    /*
     * Scenario #1
     */
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv"
            alt="Monty Python Gif"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Connect Wallet To Get Started
          </button>
        </div>
      );

      /*
       * Scenario #2
       */
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    }
    //If there is a connected wallet and characterNFT, it's time to battle!
    else if (currentAccount && characterNFT) {
      return (
        // <Arena characterNFT={characterNFT} currentAccount={currentAccount} />  
        <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />

      );
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    // checkNetwork();
    connectWalletAction();
  }, []);

  useEffect(() => {
    //The function we will call tasync()hat interacts with our smart contract
    const fetchNFTMetadata = async () => {
      console.log("Checking for Character NFT on address:", currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log("User has character NFT");
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log("No character NFT found");
      }
    };
    //We only want to run this, if we have a connected wallet
    if (currentAccount) {
      console.log("CurrentAccount:", currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Metaverse Slayer ⚔️</p>
          <p className="sub-text">Team up to protect the Metaverse!</p>

          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
