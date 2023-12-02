import React, { useState,useEffect } from 'react';
import Web3 from 'web3';
import abi from "../src/abi.json";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "../src/config";
import exampleImage from "../images/logo.png";
import Image from 'next/image'

declare global {
    interface Window {
        ethereum: any;
    }
}

let web3;

if (typeof window !== 'undefined') {
    web3 = new Web3(window.ethereum);
} else {
    // 服务器端或者window未定义的处理
    // 例如，你可以创建没有提供者的Web3实例
    web3 = new Web3();
}


// 假设你已经安装了web3并且连接到了MetaMask
const contractAddress = CONTRACT_ADDRESS; // 你的合约地址
const contractABI = abi; // 你的合约ABI


const Register: React.FC = () => {
    const [userType, setUserType] = useState('user');
    const [name, setName] = useState('');

    const register = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const contract = new ethers.Contract(contractAddress, contractABI, provider);
            const signer = provider.getSigner();
            const connectedContract = contract.connect(signer);
            if (!name) {
                console.error('Please enter a name');
                return;
            }

            if (userType === 'user') {
                // Call the user registration function with a name parameter
                
                await connectedContract.registerUser(name);
                console.log("User register successfully!");
            } else {
                // Call the merchant registration function with a name parameter
                await connectedContract.registerMerchant(name);
                console.log("Merchant register successfully!");
            }
             window.alert("Registration Complete!");
        } catch (error) {
            console.error('Error during registration:', error);
        }
    };

    return (
        <div>
            <Image src={exampleImage} alt="LOGO" height={80} />
            <h1>Register Page</h1>
            <div>
            <h2>Please Select register type</h2>
            </div>
            <select onChange={(e) => setUserType(e.target.value)}>
                <option value="user">User</option>
                <option value="merchant">Merchant</option>
            </select>
            <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <button onClick={register}>Register</button>
        </div>
    );
};

export default Register;
