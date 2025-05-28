import { useEffect, useState } from "react";
import { ethers } from "ethers";

import DiamondAbi from "@/abi/Diamond.json";
import tlAbi from "@/abi/TlToken.json";
import { diamondAddress, tlAddress } from "@/constants";
import { toast } from "sonner";
import MyGovTokenView from "@/views/MyGovTokenView";
import TlTokenView from "@/views/TlTokenView";

export default function WalletConnect() {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [tlContractInstance, setTlContractInstance] = useState(null);

  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("mygov");

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await browserProvider.send("eth_accounts", []);
        if (accounts.length > 0) {
          setAccount(accounts[0]);

          const signerInstance = await browserProvider.getSigner();
          setSigner(signerInstance);

          const contractObj = new ethers.Contract(
            diamondAddress,
            DiamondAbi,
            signerInstance
          );
          setContractInstance(contractObj);

          const tlContractObject = new ethers.Contract(
            tlAddress,
            tlAbi?.abi,
            signerInstance
          );
          setTlContractInstance(tlContractObject);
        }
      }
    };
    init();
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await browserProvider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const signerInstance = await browserProvider.getSigner();
          setSigner(signerInstance);
          const contractObj = new ethers.Contract(
            diamondAddress,
            DiamondAbi,
            signerInstance
          );
          setContractInstance(contractObj);

          const tlContractObject = new ethers.Contract(
            tlAddress,
            tlAbi?.abi,
            signerInstance
          );
          setTlContractInstance(tlContractObject);
          setMessage("Wallet connected successfully!");
        }
      } catch (error) {
        console.error("Error connecting wallet:", error);
        setMessage(`Error connecting wallet: ${error.message}`);
        toast(`Error connecting wallet: ${error.message}`);
      }
    } else {
      alert("Please install MetaMask.");
      setMessage("Please install MetaMask.");
    }
  };

  if (!account) {
    return (
      <div
        className="container"
        style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}
      >
        <h1>MyGov DApp</h1>
        <button
          onClick={connectWallet}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Connect Wallet
        </button>
        {message && (
          <p style={{ marginTop: "10px", color: "blue" }}>{message}</p>
        )}
      </div>
    );
  }

  return (
    <main
      className="container"
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "1600px",
        margin: "auto",
      }}
    >
      <navbar
        className="navbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <div>
          <strong>MyGov: Karatas-Senkal-Aydemir</strong>
        </div>
        <div>
          Connected as <strong>{account}</strong>
        </div>
      </navbar>
      <nav style={{ marginBottom: "20px", display: "flex" }}>
        <button
          style={{
            backgroundColor:
              activeTab === "mygov" ? "#007bff" : "rgba(0,0,0,0.04)",
            color: activeTab === "mygov" ? "white" : "black",
            width: "70%",
          }}
          onClick={() => setActiveTab("mygov")}
        >
          MyGov Token
        </button>
        <button
          style={{
            backgroundColor:
              activeTab !== "mygov" ? "#007bff" : "rgba(0,0,0,0.04)",
            color: activeTab !== "mygov" ? "white" : "black",
            width: "30%",
          }}
          onClick={() => setActiveTab("tl")}
        >
          TL Token
        </button>
      </nav>

      {activeTab === "mygov" ? (
        <MyGovTokenView account={account} contractInstance={contractInstance} />
      ) : (
        <TlTokenView account={account} contractInstance={tlContractInstance} />
      )}
    </main>
  );
}
