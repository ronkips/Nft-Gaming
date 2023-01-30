import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json";
import "./Arena.css";
import LoadingIndicator from "../LoadingIndicator";
const Arena = (characterNFT, setCharacterNFT, currentAccount) => {
  // State
  const [gameContract, setGameContract] = useState(null);
  const [boss, setBoss] = useState(null);
  const [attackState, setAttackState] = useState("");
  //toast state management
  const [showToast, setShowToast] = useState(false);

  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState("attacking");
        console.log("Attacking boss...");
        const attackTxn = await gameContract.attackBoss();
        await attackTxn.wait();
        console.log("attackTxn...:", attackTxn);
        setAttackState("hit");
        //Setting toast state to true and then false 5 seconds later
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error attacking boss:", error);
      setAttackState("");
    }
  };

  // UseEffects
  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      setGameContract(gameContract);
    } else {
      console.log("Ethereum object not found");
    }
  }, []);

  useEffect(() => {
    //Setup async function that will get the boss from our contract and sets in state
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBigBoss();
      console.log("The Boss:", bossTxn);
      setBoss(transformCharacterData(bossTxn));
    };
    //Setup logic when this event is fired off
    const onAttackComplete = (from, newBossHp, newPlayerHp) => {
      const bossHp = newBossHp.toNumber();
      const playerHp = newPlayerHp.toNumber();
      const sender = from.toString();
      console.log(sender);

      console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

      //if the player is our own, update both player and boss Hp
      if (currentAccount === sender.toLowerCase()) {
        setBoss((prevState) => {
          return { ...prevState, hp: bossHp };
        });
        setCharacterNFT((prevState) => {
          return { ...prevState, hp: playerHp };
        });
      }
      //If the player is not ours update the boss Hp only
      else {
        setBoss((prevState) => {
          return { ...prevState, hp: bossHp };
        });
      }

      onAttackComplete();
    };

    if (gameContract) {
      //gameContract is ready to go! Let's fetch our boss
      fetchBoss();
      gameContract.on("AttackComplete", onAttackComplete);
    }
    //Make sure to clean up this event when this component is removed
    return () => {
      if (gameContract) {
        gameContract.off("AttackComplete", onAttackComplete);
      }
    };
  }, [gameContract]);

  // Actions

  return (
    <div className="arena-container">
      {boss && characterNFT && (
        <div id="toast" className={showToast ? "show" : ""}>
          <div id="desc">{`💥 ${boss.name} was hit for ${characterNFT.characterNFT.attackDamage}!`}</div>
        </div>
      )}
      {/* Replace your Boss UI with this */}
      {boss && (
        <div className="boss-container">
          <div className={`boss-content`}>
            <h2>🔥 {boss.name} 🔥</h2>
            <div className="image-content">
              <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
              <div className="health-bar">
                <progress value={boss.hp} max={boss.maxHp} />
                <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
              </div>
            </div>
          </div>
          <div className="attack-container">
            <button className="cta-button" onClick={runAttackAction}>
              {`💥 Attack ${boss.name}`}
            </button>
          </div>
          {/* Add this right under your attack button */}
          {attackState === "attacking" && (
            <div className="loading-indicator">
              <LoadingIndicator />
              <p>Attacking ⚔️</p>
            </div>
          )}
        </div>
      )}

      {characterNFT && (
        <div className="players-container">
          <div className="player-container">
            <h2>My Character</h2>
            <div className="player">
              <div className="image-content">
                <h2>{characterNFT.characterNFT.name}</h2>
                <img
                  src={characterNFT.characterNFT.imageURI}
                  alt={`Character ${characterNFT.characterNFT.name}`}
                />
                <div className="health-bar">
                  <progress
                    value={characterNFT.characterNFT.hp}
                    max={characterNFT.characterNFT.maxHp}
                  />
                  <p>{`${characterNFT.characterNFT.hp} / ${characterNFT.characterNFT.maxHp} HP`}</p>
                </div>
              </div>
              <div className="stats">
                <h4>{`⚔️ Attack Damage: ${characterNFT.characterNFT.attackDamage}`}</h4>
              </div>
            </div>
          </div>
          {/* <div className="active-players">
          <h2>Active Players</h2>
          <div className="players-list">{renderActivePlayersList()}</div>
        </div> */}
        </div>
      )}
    </div>
  );
};
export default Arena;
