import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import abi from "../src/abi.json";
import { CONTRACT_ADDRESS } from "../src/config";
import { ethers } from 'ethers';
import exampleImage from "../images/logo.png";
import Image from 'next/image'

const contractAddress = CONTRACT_ADDRESS;
const contractABI = abi; // Replace with your contract ABI

const PersonalInfoPage: React.FC = () => {
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [Balance, setBalance] = useState<string>('');
    const [likesReceived, setLikesReceived] = useState<number>(0);
    const [exchangeRate, setExchangeRate] = useState<number>(0);
    const [merchantAddressInput, setMerchantAddressInput] = useState<string>(''); 
    const [exchangedCouponAmount, setExchangedCouponAmount] = useState<number>(0);
    const [couponAmountInput, setCouponAmountInput] = useState<number>(0);


    useEffect(() => {
        initWeb3();
        fetchData();
    }, []);

    const initWeb3 = async () => {
        if (window.ethereum) {
            const w3 = new Web3(window.ethereum);
            try {
                await window.ethereum.enable();
                setWeb3(w3);
            } catch (error) {
                console.error('User denied account access');
            }
        } else {
            console.error('No web3 provider detected');
        }
    };
    const fetchData = async () => {
        if (!web3) return;

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(contractAddress, contractABI, provider);
            const signer = provider.getSigner();
            const connectedContract = contract.connect(signer);
            const merchant = ethers.utils.computeAddress(merchantAddressInput);

            const Balance = await connectedContract.getBalance();
            const userLikesReceived = await connectedContract.getTotalLikes(merchant);
            const userExchangeRate = await connectedContract.getCouponRate(merchant);
            const userExchangedCouponAmount = await connectedContract.getexchangedCouponAmount(merchant);

            setBalance(Balance);
            setLikesReceived(userLikesReceived);
            setExchangeRate(userExchangeRate);
            setExchangedCouponAmount(userExchangedCouponAmount);
        } catch (error) {
            console.error(error);
        }
    };

    const handleExchangeCoupon = async () => {
        if (!web3) return;

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(contractAddress, contractABI, provider);
            const signer = provider.getSigner();
            const connectedContract = contract.connect(signer);

            // Replace 'YOUR_MERCHANT_ADDRESS' with the actual address of the merchant
            const merchant = merchantAddressInput;

            // Assuming the user wants to exchange 5 coupons, modify this based on your requirements
            const couponAmount = couponAmountInput || 5;

            // Check if the user has enough tokens to claim the coupon
            const exchangeRate = await connectedContract.getCouponRate();
            const tokensRequired = couponAmount * exchangeRate;
            const userBalance = await connectedContract.getBalance();

            if (userBalance >= tokensRequired) {
                // Call the exchangeCoupon function in the smart contract
                await connectedContract.exchangeCoupon(merchant, couponAmount);

                // Fetch updated data after the exchange
                fetchData();
            } else {
                alert('Not enough tokens to claim the coupon');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleGetTokenBalance = async () => {
        // Fetch user's token balance
        if (!web3) return;

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(contractAddress, contractABI, provider);
            const signer = provider.getSigner();
            const connectedContract = contract.connect(signer);
            const userBalance = await connectedContract.getBalance();
            setBalance(userBalance.toString()); // Corrected from setBalance to setTokenBalance

        } catch (error) {
            console.error(error);
        }
    };

    const handleGetTotalLikes = async () => {

        if (!web3) return;

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(contractAddress, contractABI, provider);
            const signer = provider.getSigner();
            const connectedContract = contract.connect(signer);

            const userLikesReceived = await connectedContract.getTotalLikes();
            console.log("Total Likes:", userLikesReceived.toString());
            setLikesReceived(userLikesReceived.toString());
            fetchData();
        } catch (error) {
            console.error(error);
        }
        fetchData();
    };

    const handleGetCouponRate = async () => {
        // Fetch total likes for a specific merchant
        if (!web3) return;

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(contractAddress, contractABI, provider);
            const signer = provider.getSigner();
            const connectedContract = contract.connect(signer);

            const userExchangeRate = await connectedContract.getCouponRate();
            setExchangeRate(userExchangeRate.toString());
            fetchData();
        } catch (error) {
            console.error(error);
        }
        fetchData();
    };

    return (
        <div>
            <Image src={exampleImage} alt="LOGO" height={80} />
            <h1>Personal Information</h1>
            <div>
                <p>Token Balance: {Balance}</p>
                <p>Exchanged Coupon Amount: {exchangedCouponAmount}</p>
                <p>Total Likes: {likesReceived}</p>
                <p>Exchange Rate: {exchangeRate}</p>
            </div>
            <label>
                Merchant Address:
                <input
                    type="text"
                    value={merchantAddressInput}
                    onChange={(e) => setMerchantAddressInput(e.target.value)}
                />
            </label>
            <label>
                Coupon Amount:
                <input
                    type="number"
                    value={couponAmountInput}
                    onChange={(e) => setCouponAmountInput(Number(e.target.value))}
                />
            </label>
            <button onClick={handleExchangeCoupon}>Exchange Coupon</button>
            <button onClick={handleGetTokenBalance}>Get Token Balance</button>
            <button onClick={handleGetTotalLikes}>Get Total Likes</button>
            <button onClick={handleGetCouponRate}>Get Coupon Rate</button>
        </div>
    );
};

export default PersonalInfoPage;