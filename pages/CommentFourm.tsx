// pages/CommentsPage.tsx

import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import CommentList from "../component/Commentlist";
import CommentForm from "../component/CommentForm";
import abi from "../src/abi.json";
import { CONTRACT_ADDRESS } from "../src/config";
import { ethers } from 'ethers';
import exampleImage from "../images/logo.png";
import Image from 'next/image';
import Link from 'next/link';

const contractAddress = CONTRACT_ADDRESS;
const contractABI = abi;

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

    const mintToken = async (comment: string) => {
        if (!web3 || !comment) {
            alert('Please enter both Order ID and Comment');
            return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const signer = provider.getSigner();
        const connectedContract = contract.connect(signer);

        try {
            await connectedContract.mintToken(comment);
            console.log('Comment posted successfully');
            displayComments();
            window.alert("You have successfully post a comment! You can check your balance now!")
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
            window.alert("You have successfully liked a comment!")
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
            window.alert("You have successfully disliked a comment! One token is deducted from your account")
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
                <button onClick={handleFetchComments}>Get Existing Comments</button>
            </div>

            <p>Your Token Balance: {tokenBalance !== null ? tokenBalance : 'Loading...'}</p>
            <button onClick={fetchTokenBalance}>Get Token Balance Now</button>
            <Link href="/">
                <a>Go back to Home</a>
            </Link>
        </div>
    );
};

export default CommentsPage;

