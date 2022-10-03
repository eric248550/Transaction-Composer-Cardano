// CSS
import './App.css';

// Images
import logo from './images/logo.png';
import btnWeb from './images/buttonWeb.png';
import btnTw from './images/buttonTw.png';
import btnDc from './images/buttonDc.png';
import nftImage from './images/nft.png';
import namiIcon from "./images/nami.svg";
import eternlIcon from "./images/eternl.png";


import React, { useEffect, useState } from 'react';
import { useTimer } from 'react-timer-hook';
import c from './constants';
import Select from 'react-select'

import MultipleWalletApi, { Cardano } from './nami-js';

let walletApi;

const start = 50;
const end = 58;
export default function App() {
    
    // My States
    const [mobileNavIsOpen, setMobileNavIsOpen] = useState(false);
    const [saleTimer, setSaleTimer] = useState(false);
    const [connected, setConnected] = useState(false);
    const [connectWallet, setConnectWallet] = useState();
    const [isLoading, setIsLoading] = useState();
    const [message, setMessage] = useState();

    async function t(walletName) {

        const S = await Cardano();
        walletApi = new MultipleWalletApi(
            S,
            window.cardano[walletName],
            // blockfrostApiKey
            {
            0: "testneteDgsi4q4d7ZvI0StUUUT6UK5DazZeyQw", // testnet
            1: "mainnetzPROg9q7idoA9ssVcWQMPtnawNVx0C0K", // mainnet
            }
        );
    }
    const connect = async (walletName) => {
        // Connects wallet to current website
        await t(walletName);
        await walletApi.enable()
            .then((result) => 
            {
                setConnected(true);
                setConnectWallet(walletName);
                console.log(`switch to ${walletName}`);
            }
            )
            .catch((e) => console.log(e));    
    };
    function makeMetadata(start, end) {
        let metadata = 
        {
            "721":{
                [c.POLICY_ID]:{
                }
            }
        };
        for (let i = start; i < (end + 1); i++) {
            const asset = {
                "Artist": "Ebifura from Night Parade of 100 Demons",
                "NPDemons Links": {
                   "Discord": "https://discord.com/invite/t2qDgDFAx7",
                   "Twitter": "https://twitter.com/NP_DemonS",
                   "Website": "https://www.npdemons.com/"
                },
                "Project": "Night Parade of 100 Demons",
                "description": "An exclusive airdrop for Cutémon Whales in September 2022",
                "image": "QmS5Xnx1nH5J9NvghqvKj99TE1FeuHxur3bVtP6WaKhk52",
                "mediaType": "image/png",
                "name": `Cutémon Special Edition #${i}`
            };
            // const nftName = preData.nftName[i];
            metadata['721'][c.POLICY_ID][`CutemonSpecialEdition${i}`] = asset;
        }
        return metadata;
    }
    async function mintProcess() {
        const myAddress = await walletApi.getAddress();

        if (!connected) {
            setMessage('Please connect your wallet');
        }
        else {
            setMessage('Loading...');
            const metadata = makeMetadata(start, end);

            let mintedAssetsArray = [];
            for (let i = start; i < (end + 1); i++) {
                mintedAssetsArray.push({
                    assetName: `CutemonSpecialEdition${i}`,
                    quantity: "1",
                    policyId: c.POLICY_ID,
                    policyScript: c.POLICY_SCRIPT,
                });
            }
            const recipients = [
                {
                address: myAddress,
                amount: "0",
                mintedAssets: mintedAssetsArray
                },
            ];
            buildTransaction(recipients, metadata);
        }
    }

    const buildTransaction = async (recipients, metadata) => {
        try {
            let utxos = await walletApi.getUtxosHex();
            const myAddress = await walletApi.getAddress();
            let netId = await walletApi.getNetworkId();
            const skey = '79e94317d7622db6abff316bc97e2046fb71481e064311c1688546baffb0157f';
            const t = await walletApi.transaction({
                PaymentAddress: myAddress,
                recipients: recipients,
                metadata: metadata,
                utxosRaw: utxos,
                networkId: netId.id,
                ttl: 3600,
                addMetadata: true,
                multiSig: true,
            });
        
            const witnessBuyer = await walletApi.signTx(t, true);
            const response = await fetch(
                // `https://demons-api.herokuapp.com/MintAny/${netId.id}/${t}/${witnessBuyer}/${skey}`
                `http://localhost:8787/MintAny/${netId.id}/${t}/${witnessBuyer}/${skey}`
            );
            const responseJson = await response.json();
            console.log(responseJson);
            // const txHash = await walletApi.submitTx({
            //     transactionRaw: t,
            //     witnesses: [witnessBuyer, witnessBuyer],
            //     networkId: netId.id
            // })

            setMessage(`txhash ${responseJson.txHash}`)
            if (responseJson.error) {
                setMessage(`error ${responseJson.error}`)
            }
        } catch (e) {
            console.log(e)
            setMessage(e.info);
        }

    };

    async function sendMintedNFT () {
        const response = await fetch(
            // `https://demons-api.herokuapp.com/NPD/SpecialAirdrop/Winners`
            `http://localhost:8787/NPD/SpecialAirdrop/Winners`
        );
        const responseJson = await response.json();
        console.log(responseJson);
        let recipients = [];
        for (let i = 0; i < responseJson.length; i++) {
            recipients.push({
                address: responseJson[i].address,
                amount: "0",
                assets: [{
                    unit: `${c.POLICY_ID}.CutemonSpecialEdition${i+start}`,
                    quantity: 1,
                }]
            });
        };

        let utxos = await walletApi.getUtxosHex();
        const myAddress = await walletApi.getAddress();
        let netId = await walletApi.getNetworkId();
        const t = await walletApi.transaction({
            PaymentAddress: myAddress,
            recipients: recipients,
            utxosRaw: utxos,
            networkId: netId.id,
            ttl: 3600,
        });
    
        const witnessBuyer = await walletApi.signTx(t, false);
        const txHash = await walletApi.submitTx({
            transactionRaw: t,
            witnesses: [witnessBuyer, witnessBuyer],
            networkId: netId.id
        })

        setMessage(`txhash ${txHash}`)
    }
    async function sendAdaAirdrop () {
        const response = await fetch(
            // `https://demons-api.herokuapp.com//NPD/AdaAirdrop/Winners`
            'http://localhost:8787/NPD/AdaAirdrop/Winners'
        );
        const responseJson = await response.json();
        console.log(responseJson);
        let recipients = [];
        for (let i = 0; i < responseJson.holder100.length; i++) {

            recipients.push({
                address: responseJson.holder100[i].address,
                amount: (responseJson.holder100[i].cutemon * 1).toFixed(1),
            });
        };
        for (let i = 0; i < responseJson.holder50.length; i++) {

            recipients.push({
                address: responseJson.holder50[i].address,
                amount: (responseJson.holder50[i].cutemon * 0.5).toFixed(1),
            });
        };
        for (let i = 0; i < responseJson.holder20.length; i++) {

            recipients.push({
                address: responseJson.holder20[i].address,
                amount: (responseJson.holder20[i].cutemon * 0.3).toFixed(1),
            });
        };

        let utxos = await walletApi.getUtxosHex();
        const myAddress = await walletApi.getAddress();
        let netId = await walletApi.getNetworkId();
        const t = await walletApi.transaction({
            PaymentAddress: myAddress,
            recipients: recipients,
            utxosRaw: utxos,
            networkId: netId.id,
            ttl: 3600,
        });
    
        const witnessBuyer = await walletApi.signTx(t, false);
        const txHash = await walletApi.submitTx({
            transactionRaw: t,
            witnesses: [witnessBuyer, witnessBuyer],
            networkId: netId.id
        })

        setMessage(`txhash ${txHash}`)
    }

    const mainContents = () => {
        if (true)
            return (
                <div className="flex flex-col items-stretch">
                    <div className="flex flex-row items-stretch justify-center">
                        {/* Nami button */}
                        <button className={`wallet-group-connect-ada ${(connectWallet=='nami') ? "wallet-group-connect--success" : ""}`} onClick={() => connect('nami')}>
                            <img className="wallet-group-icon" src={namiIcon} width={30} height={30} />
                            {(connectWallet=='nami') ? "Connected" : "Connect to Nami"}
                        </button>

                            {/* eternl button */}
                        <button className={`wallet-group-connect-ada ${ (connectWallet=='eternl') ? "wallet-group-connect--success" : ""}`}onClick={() => connect('eternl')}>
                            <img className="wallet-group-icon" src={eternlIcon} width={40} height={40}/>
                            {(connectWallet=='eternl') ? "Connected" : "Connect to Eternl"}
                        </button>                    
                    </div>
                    {/* {getMainButtonLoggedIn()} */}
                    <button className="animated-all text-2xl text-white bg-yellow-400 disabled:opacity-25 p-4 shadow-md rounded-md w-60 m-4 mx-auto" onClick={mintProcess}>
                        Mint
                    </button>
                    <button className="animated-all text-2xl text-white bg-yellow-400 disabled:opacity-25 p-4 shadow-md rounded-md w-60 m-4 mx-auto" onClick={sendMintedNFT}>
                        Send NFT
                    </button>
                    <button className="animated-all text-2xl text-white bg-yellow-400 disabled:opacity-25 p-4 shadow-md rounded-md w-60 m-4 mx-auto" onClick={sendAdaAirdrop}>
                        Send ADA
                    </button>
                    <p className="text-red-500 text-center text-xl">{message}</p>
                </div>
            );
    };

    return (
        <div>
            <section className="sectionStyle">
                <div className="flex flex-row justify-center">
                    <div className="flex flex-row justify-start w-full items-center -mt-6 max-w-screen-lg">
                        <a href={c.WEBSITE}><img src={logo} alt="Logo" target="_blank" className="object-contain mt-5 h-28" /></a>
                        <p className="grow"></p>
                        <div className="hidden md:flex flex-row items-center">
                            {/* <a className="text-white mx-4 hover:text-linkhighlight" href="https://www.kairoscore.xyz/#FAQs-Section">FAQs</a>
                            <a className="text-white mx-4 hover:text-linkhighlight" href="https://www.kairoscore.xyz/#Roadmap-Section">Roadmap</a> */}
                            <a className="yellowButtonEffect" href={c.TWITTER}><img src={btnTw} alt="Twitter" className="object-contain w-10 mx-2" /></a>
                            <a className="yellowButtonEffect" href={c.DISCORD}><img src={btnDc} alt="Discord" className="object-contain w-10 mx-2" /></a>
                            <a className="yellowButtonEffect" href={c.WEBSITE}><img src={btnWeb} alt="Website" className="object-contain w-10 ml-2 mr-10" /></a>
                        </div>
                        <div>
                            <button className={"mr-10 md:hidden p-2 rounded-t" + (mobileNavIsOpen ? "  text-myblue-normal bg-white" : " text-white")} onClick={() => {
                                setMobileNavIsOpen(!mobileNavIsOpen);
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <div className="relative mr-10 ">
                                <div className={"md:hidden flex flex-col items-start absolute anim origin-top right-0 -top-0 rounded-b rounded-tl" + (mobileNavIsOpen ? " bg-white" : " xFlat")}>
                                    {/* <a className="text-myblue-normal mx-4 hover:text-linkhighlight py-2" href="https://www.kairoscore.xyz/#FAQs-Section">FAQs</a>
                                    <a className="text-myblue-normal mx-4 hover:text-linkhighlight py-2" href="https://www.kairoscore.xyz/#Roadmap-Section">Roadmap</a> */}
                                    <a className="text-myblue-normal mx-4 hover:text-linkhighlight py-2" href={c.TWITTER}>Twitter</a>
                                    <a className="text-myblue-normal mx-4 hover:text-linkhighlight py-2" href={c.DISCORD}>Discord</a>
                                    <a className="text-myblue-normal mx-4 hover:text-linkhighlight py-2" href={c.WEBSITE}>Website</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="h-full flex flex-col justify-center max-w-screen-lg mx-auto px-5 pb-20">
                    <p style={{ color: "#AC565A" }} className="text-4xl font-bold text-center mb-4">{c.TITLE}</p>
                    {/* <div className="pl-10 pr-5"> */}
                        <p className="text-black mb-5">{c.DESCRIPTION}</p>
                        <p className="text-black mb-5">{c.DESCRIPTION_2}</p>
                    {/* </div> */}

                    {/* <div className="bg-white/300 p-6 rounded-lg text-white"> */}
                        <div className="h-full w-full flex flex-col">
                            {mainContents()}
                        </div>
                    {/* </div> */}
                    {/* {getMainButton()} */}
                </div>
            </section>
        </div>
    );
}