﻿// pages/CommentsPage.tsx

import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import CommentList from 'C:/Users/km/Desktop/omoov/component/Commentlist';
import CommentForm from 'C:/Users/km/Desktop/omoov/component/CommentForm';
import abi from "C:/Users/km/Desktop/omoov/src/abi.json";
import { CONTRACT_ADDRESS } from "C:/Users/km/Desktop/omoov/src/config";
import { ethers } from 'ethers';
import exampleImage from "C:/Users/km/Desktop/omoov/images/logo.png";
import Image from 'next/image'

const contractAddress = CONTRACT_ADDRESS;
const contractABI = abi; // Replace with your contract ABI

const CommentsPage: React.FC = () => {
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [existingComments, setExistingComments] = useState<string[]>([]);
    const [tokenBalance, setTokenBalance] = useState<string | null>(null);

    useEffect(() => {
        initWeb3();
        displayComments();
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

    const mintToken = async (orderId: number, comment: string) => {
        if (!web3 || !orderId || !comment) {
            alert('Please enter both Order ID and Comment');
            return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const signer = provider.getSigner();
        const connectedContract = contract.connect(signer);

        try {
            await connectedContract.mintToken(comment, orderId);
            console.log('Comment posted successfully');
            displayComments();
        } catch (error) {
            console.error(error);
        }
    };

    const likeComment = async (commentToLike: string) => {
        if (!web3) return;

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const signer = provider.getSigner();
        const connectedContract = contract.connect(signer);

        try {
            await connectedContract.likeComment(commentToLike);
            console.log('Comment liked successfully');
            displayComments();
        } catch (error) {
            console.error(error);
        }
    };

    const dislikeComment = async (commentToDislike: string) => {
        if (!web3) return;

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const signer = provider.getSigner();
        const connectedContract = contract.connect(signer);

        try {
            await connectedContract.dislikeComment(commentToDislike);
            console.log('Comment disliked successfully');
            displayComments();
        } catch (error) {
            console.error(error);
        }
    };

    const displayComments = async () => {
        if (!web3) return;

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const signer = provider.getSigner();
        const connectedContract = contract.connect(signer);


        try {
            const commentCount = await connectedContract.getCommentCounts();
            const comments: string[] = [];

            for (let i = 0; i < commentCount; i++) {
                const c = await connectedContract.GetNthComment(i);
                comments.push(c);
            }

            setExistingComments(comments);
        } catch (error) {
            console.error(error);
        }
    };
    const handleFetchComments = () => {
        displayComments();
    };

    const fetchTokenBalance = async () => {
        // Add your web3 setup code here
        if (!web3) return;

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(contractAddress, contractABI, provider);
            const signer = provider.getSigner();
            const connectedContract = contract.connect(signer);

            // Assume getBalance is a function in your smart contract
            const userBalance = await connectedContract.getBalance();

            // Set the token balance state
            setTokenBalance(userBalance.toString());
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <Image src={exampleImage} alt="LOGO" height={80} /> 
            <h1>Comments Page</h1>

            <div>
                <h2>Existing Comments</h2>
                <CommentList comments={existingComments} onLike={likeComment} onDislike={dislikeComment} />
            </div>

            <div>
                <CommentForm onSubmit={mintToken} />
                <button onClick={handleFetchComments}>Fetch Existing Comments</button>
            </div>
            <p>Your Token Balance: {tokenBalance !== null ? tokenBalance : 'Loading...'}</p>
            <button onClick={fetchTokenBalance}>Fetch Token Balance</button>
        </div>
    );
};

export default CommentsPage;