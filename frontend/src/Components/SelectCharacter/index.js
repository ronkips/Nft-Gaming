import React, { useEffect, useState } from "react";
import "./SelectCharacter.css";
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json";
import { ethers } from "ethers";
/*
 * Don't worry about setCharacterNFT just yet, we will talk about it soon!
 */
const SelectCharacter = ({ setCharacterNFT }) => {
  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);

  // UseEffect
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

      /*
       * This is the big difference. Set our gameContract in state.
       */
      setGameContract(gameContract);
    } else {
      console.log("Ethereum object not found");
    }
  }, []);

  //useEffect
  useEffect(() => {
    const getCharacters = async () => {
      try {
        console.log("Getting contract characters to mint");
        // call contract to get all mint-able characters
        const characterTxn = await gameContract.getAllDefaultCharacters();
        console.log("your characterTxn is:", characterTxn);

        // Go through all the characters and transform the data
        const characters = characterTxn.map((CharacterData) =>
          transformCharacterData(CharacterData)
        );

        //set all mint -able characters
        setCharacters(characters);
      } catch (error) {
        console.error(
          "Sorry something went wrong while fetchingsome characters",
          error
        );
      }
    };
    // If our gameCharacters are ready , let's get characters
    if (gameContract) {
      getCharacters();
    }
  }, [gameContract]);

  //Render component
  const renderCharacters = () =>
    characters.map((character, index) => (
      <div className="character-item" key={character.name}>
        <div className="name-container">
          <p>{character.name}</p>
        </div>
        <img src={character.imageURI} alt={character.name} />
        <button
          type="button"
          className="character-mint-button"
          // onClick={() => mintCharacterNFTAction(index)}
        >{`Mint ${character.name}`}</button>
      </div>
    ));

return (
  <div className="select-character-container">
    <h2>Mint Your Hero. Choose wisely.</h2>
    {/* Only show this when there are characters in state */}
    {characters.length > 0 && (
      <div className="character-grid">{renderCharacters()}</div>
    )}
  </div>
);
};

export default SelectCharacter;
