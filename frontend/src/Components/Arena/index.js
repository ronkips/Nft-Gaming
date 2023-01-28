import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json";
import "./Arena.css";
export const Arena = (characterNFT) => {
    // State
    const [gameContract, setGameContract] = useState(null);

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
            console.log('Ethereum object not found');
        }
    }, []);

    return (
        <div className="arena-container">
            {/* Boss */}
            <p>BOSS GOES HERE</p>

            {/* Character NFT */}
            <p>CHARACTER NFT GOES HERE</p>
        </div>
    );
}
