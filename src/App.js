// CSS
import './App.css';
import './video-react.css'; // import css

// Images
import logo from './images/logo.png';
import btnWeb from './images/buttonWeb.png';
import btnTw from './images/buttonTw.png';
import btnDc from './images/buttonDc.png';
import btnIg from './images/buttonIg.png';
import btnFb from './images/buttonFb.png';
import aiLogo from "./images/ai-logo-blue.png"

import namiIcon from "./images/nami.svg";
import eternlIcon from "./images/eternl.png";
import typhonIcon from "./images/typhon.png";
import flintIcon from "./images/flint.png";
import geroIcon from "./images/gero.png";


import React, { useEffect, useState } from 'react';
import c from './constants';
import Select from 'react-select'

import AlertModal from "./alert";
import MultipleWalletApi, { Cardano } from './nami-js';
import initCardanoDAppConnectorBridge from './cardano-dapp-connector-bridge';

// import holderJson from './holder.json';
let walletApi;

export default function App() {
    // usePageViews();
    // My States
    const [mobileNavIsOpen, setMobileNavIsOpen] = useState(false);
    const [connected, setConnected] = useState(false);
    const [connectWallet, setConnectWallet] = useState();
    const [alertInformation, setAlertInformation] = useState({
        content: "",
        isDisplayed: false,
        type: "information",
    });
    const [type, setType] = useState();
    const [receivingAddress, setReceivingAddress] = useState();
    const [ada, setADA] = useState();
    const [metadata, setMetadata] = useState();


    useEffect (() => {
        const params = new URLSearchParams(window.location.search);
        setType(params.get('type'));
        setReceivingAddress(params.get('address'))
        setADA(params.get('ada'));
        // setADA(params.get('metadata'));
    })

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
    const connect = async (wallet) => {
        const walletName = wallet.value;
        await t(walletName);
        await walletApi.enable()
            .then(async (result) => 
            {
                setConnected(true);
                setConnectWallet(walletName);
                console.log(`switch to ${walletName}`);
            }
            )
            .catch((e) => console.log(e));    
    };
    const connectDAppBrowser = async () => {
        initCardanoDAppConnectorBridge(async (DAppBrowserApi) => {
            if(DAppBrowserApi.name === 'eternl') {
                setConnected(true);
                setConnectWallet('eternl_DAppBrowser');

                console.log(`switch to eternl_DAppBrowser`);
                const S = await Cardano();
                walletApi = new MultipleWalletApi(
                    S,
                    DAppBrowserApi,
                    // blockfrostApiKey
                    {
                    0: "testneteDgsi4q4d7ZvI0StUUUT6UK5DazZeyQw", // testnet
                    1: "mainnetzPROg9q7idoA9ssVcWQMPtnawNVx0C0K", // mainnet
                    }
                );
            }
          })  
    };
    async function send() {
        try {
            // no connect wallet
            if (walletApi === undefined || walletApi === 'undefined') {
                setAlertInformation({
                    type: "information",
                    isDisplayed: true,
                    content: `Please connect your wallet first`,
                });
                return;
            }
            if (type === null || ada === null || receivingAddress === null) {
                setAlertInformation({
                    type: "information",
                    isDisplayed: true,
                    content: `Please check the URL params`,
                });
                console.log(type, ada, receivingAddress);
                return;
            }
            // loading
            setAlertInformation({
                type: "loading",
                isDisplayed: true,
                content: null,
            });

            const myAddress = await walletApi.getAddress();
            let recipients = [
                {
                    address: receivingAddress,
                    amount: ada,
                }
            ]            
            let utxos = await walletApi.getUtxosHex();
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
            console.log(txHash)
            if(txHash.error) {
                setAlertInformation({
                    type: "information",
                    isDisplayed: true,
                    content: `Error: \n\n ${txHash.message}`,
                });
                return; 
            }
            setAlertInformation({
                type: "information",
                isDisplayed: true,
                content: `Transaction ID: \n\n ${txHash}`,
            });
        } catch (e) {
            console.log(e)
            if (e.info) {
                setAlertInformation({
                    type: "information",
                    isDisplayed: true,
                    content: `Oops something error \n\n ${e.info}`,
                });
            }
            else {
                setAlertInformation({
                    type: "information",
                    isDisplayed: true,
                    content: `Oops something error \n\n ${e}`,
                });
            }

        }
    };
    async function mint() {
        try {
            // no connect wallet
            if (walletApi === undefined || walletApi === 'undefined') {
                setAlertInformation({
                    type: "information",
                    isDisplayed: true,
                    content: `Please connect your wallet first`,
                });
                return;
            }
            if (type === null || ada === null || receivingAddress === null) {
                setAlertInformation({
                    type: "information",
                    isDisplayed: true,
                    content: `Please check the URL params`,
                });
                console.log(type, ada, receivingAddress);
                return;
            }
            // loading
            setAlertInformation({
                type: "loading",
                isDisplayed: true,
                content: null,
            });

            const myAddress = await walletApi.getAddress();
            let recipients = [
                {
                    address: myAddress,
                    amount: "0",
                    mintedAssets: [
                        {
                            assetName: `NeuralPrint1`,
                            quantity: "1",
                            policyId: c.POLICY_ID,
                            policyScript: c.POLICY_SCRIPT,
                        },
                    ],
                },
            ];
            let utxos = await walletApi.getUtxosHex();
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
            console.log(txHash)
            if(txHash.error) {
                setAlertInformation({
                    type: "information",
                    isDisplayed: true,
                    content: `Error: \n\n ${txHash.message}`,
                });
                return; 
            }
            setAlertInformation({
                type: "information",
                isDisplayed: true,
                content: `Transaction ID: \n\n ${txHash}`,
            });
        } catch (e) {
            console.log(e)
            if (e.info) {
                setAlertInformation({
                    type: "information",
                    isDisplayed: true,
                    content: `Oops something error \n\n ${e.info}`,
                });
            }
            else {
                setAlertInformation({
                    type: "information",
                    isDisplayed: true,
                    content: `Oops something error \n\n ${e}`,
                });
            }

        }
    };

    const mainContents = () => {
            return (
                <div className="flex flex-col items-stretch">
                    <div className="flex flex-row items-stretch mb-5 text-center">
                        {alertInformation.isDisplayed && (
                            <AlertModal
                            type={alertInformation.type}
                            animateNumber={alertInformation.animateNumber}
                            bgNumber={alertInformation.bgNumber}
                            onClose={() =>
                                setAlertInformation({
                                type: "information",
                                isDisplayed: false,
                                content: null,
                                })
                            }
                            >
                            {alertInformation.content}
                            </AlertModal>
                        )}

                    </div>
                    <div className='flex justify-center'>
                        <Select
                            className=" w-80 border-2 border-black bg-[#fac811] text-black text-center text-xl"
                            // defaultValue={''}
                            placeholder={"selece wallet"}
                            onChange={connect}
                            options={[
                                { value: 'eternl', label: 
                                    <div className="justify-center flex flex-row items-center">
                                        {/* <a className="justify-center" href={c.TWITTER}><img src={btnTw} alt="Twitter" className="object-contain w-12 mx-2" /></a> */}
                                        {/* <a className="justify-center" href={c.DISCORD}><img src={btnDc} alt="Discord" className="object-contain w-12 mx-2" /></a> */}
                                        <img src={eternlIcon} width={45} height={45}/>
                                        <p>Eternl</p>
                                    </div>
                                },
                                { value: 'nami', label: 
                                    <div className="justify-center flex flex-row items-center">
                                        {/* <a className="justify-center" href={c.TWITTER}><img src={btnTw} alt="Twitter" className="object-contain w-12 mx-2" /></a> */}
                                        {/* <a className="justify-center" href={c.DISCORD}><img src={btnDc} alt="Discord" className="object-contain w-12 mx-2" /></a> */}
                                        <img src={namiIcon} width={40} height={40}/>
                                        <p>Nami</p>
                                    </div>
                                },
                                { value: 'typhoncip30', label: 
                                    <div className="justify-center flex flex-row items-center">
                                        {/* <a className="justify-center" href={c.TWITTER}><img src={btnTw} alt="Twitter" className="object-contain w-12 mx-2" /></a> */}
                                        {/* <a className="justify-center" href={c.DISCORD}><img src={btnDc} alt="Discord" className="object-contain w-12 mx-2" /></a> */}
                                        <img src={typhonIcon} width={45} height={45}/>
                                        <p>Typhon</p>
                                    </div>
                                },
                                { value: 'flint', label: 
                                    <div className="justify-center flex flex-row items-center">
                                        {/* <a className="justify-center" href={c.TWITTER}><img src={btnTw} alt="Twitter" className="object-contain w-12 mx-2" /></a> */}
                                        {/* <a className="justify-center" href={c.DISCORD}><img src={btnDc} alt="Discord" className="object-contain w-12 mx-2" /></a> */}
                                        <img src={flintIcon} width={30} height={30}/>
                                        <p>Flint</p>
                                    </div>
                                },
                                { value: 'gerowallet', label: 
                                <div className="justify-center flex flex-row items-center">
                                    {/* <a className="justify-center" href={c.TWITTER}><img src={btnTw} alt="Twitter" className="object-contain w-12 mx-2" /></a> */}
                                    {/* <a className="justify-center" href={c.DISCORD}><img src={btnDc} alt="Discord" className="object-contain w-12 mx-2" /></a> */}
                                    <img src={geroIcon} width={45} height={45}/>
                                    <p>Gero</p>
                                </div>
                                },
                            ]}
                        />
                    </div>
                    <div className='flex justify-center'>
                        <button className="mx-auto button w-40" onClick={send}>
                            Send
                        </button>
                    </div>

                </div>
            );
    }
    function handleWallet() {
        const type = 'send';
        const ada = 2;
        const address = 'addr1qxxnqqky920ehzv2h8vwk5qwxfgat8w3lr4h5gs0gt2660l0xk95n6u8twaz76f67jnf649fzdtffmqfyrpjf9rlj32qs845mw'
        // var ada = 'mainnetzPROg9q7idoA9ssVcWQMPtnawNVx0C0K'
        var link = 'http://localhost:8080?type=' + type + '&address=' + address + '&ada=' + ada
        var width = 600
        var height = Math.min(800, parseInt(window.outerHeight, 10))
        var left = (parseInt(window.outerWidth, 10) / 2) - (width / 2)
        var top = (parseInt(window.outerHeight, 10) - height) / 2
        window.open(link, 'Delegate', 'width=' + width + ',height=' + height + ',toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1,left=' + left + ',top=' + top);
    }
    return (
        <div>
            <section className="sectionStyle">
                <div className='flex justify-center'>
                    <button className="mx-auto button w-40" onClick={handleWallet}>
                        Link
                    </button>
                </div>
                <div className="flex flex-row justify-center">
                    <div className="flex flex-row justify-center w-full items-center -mt-6 max-w-screen-lg">
                        <a href={c.WEBSITE}>
                            <img src={logo} alt="Logo" target="_blank" className="object-contain mt-5 h-28" />
                        </a>
                    </div>
                </div>
                <div className="h-full flex flex-col justify-center max-w-screen-lg mx-auto px-5 pb-20">
                    <p className="text-4xl text-white font-bold text-center mb-4">{c.TITLE}</p>
                    <div className="h-full w-full flex flex-col">
                        {mainContents()}
                    </div>
                    <div className="mt-5 justify-center flex flex-row items-center">
                        <a className="justify-center" href={c.TWITTER}>
                            <p className={`text-white text-sm text-center`}>
                                {"Terms & conditions"}
                            </p>
                        </a>
                    </div>
                    <div className="mt-5 justify-center flex flex-row items-center">
                        <a className="justify-center" href="https://twitter.com/AIDEV_cardano"><img src={btnTw} alt="Twitter" className="object-contain w-12 mx-2" /></a>
                        <a className="justify-center" href={c.DISCORD}><img src={btnDc} alt="Discord" className="object-contain w-12 mx-2" /></a>
                    </div>
                    {/* <div className="justify-center flex mt-3" >
                        <a className="text-3xl justify-center text-center text-white" href='https://twitter.com/AIDEV_cardano'>
                            Powered by
                        </a>
                        <img className="" src={aiLogo} width={50} height={50}/>
                        <a className="text-3xl justify-center text-center text-white" href='https://twitter.com/AIDEV_cardano'>
                            AIDEV
                        </a>
                    </div> */}
                </div>
            </section>
        </div>
    );
}
  