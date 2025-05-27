import { useEffect, useState } from "react";
import { ethers } from "ethers";

import DiamondAbi from "@/abi/Diamond.json";
// Add others similarly

export default function WalletConnect() {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const diamondAddress = "0x4c6DEE8FE9De18686748b331174510aB76E4bc45"; // Your contract address

  // General state for messages and results
  const [message, setMessage] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenDecimals, setTokenDecimals] = useState(null);
  const [availableSupply, setAvailableSupply] = useState("");
  const [maxSupply, setMaxSupply] = useState("");
  const [memberCount, setMemberCount] = useState(0);

  // Input states
  const [amountInput, setAmountInput] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [addressToInput, setAddressToInput] = useState("");
  const [addressFromInput, setAddressFromInput] = useState("");
  const [spenderAddressInput, setSpenderAddressInput] = useState("");
  const [ownerAddressInput, setOwnerAddressInput] = useState("");
  const [projectIdInput, setProjectIdInput] = useState("");
  const [surveyIdInput, setSurveyIdInput] = useState("");
  const [webUrlInput, setWebUrlInput] = useState("");
  const [deadlineInput, setDeadlineInput] = useState("");
  const [paymentAmountsInput, setPaymentAmountsInput] = useState(""); // comma-separated
  const [payScheduleInput, setPayScheduleInput] = useState(""); // comma-separated
  const [voteChoiceInput, setVoteChoiceInput] = useState(true); // true for 'yes', false for 'no'
  const [surveyNumChoicesInput, setSurveyNumChoicesInput] = useState("");
  const [surveyAtMostChoicesInput, setSurveyAtMostChoicesInput] = useState("");
  const [surveyChoicesInput, setSurveyChoicesInput] = useState(""); // comma-separated

  // Output states
  const [balanceOfResult, setBalanceOfResult] = useState("");
  const [allowanceResult, setAllowanceResult] = useState("");
  const [hasClaimedFaucetResult, setHasClaimedFaucetResult] = useState("");
  const [isContractMemberResult, setIsContractMemberResult] = useState("");
  const [willViolateProposalResult, setWillViolateProposalResult] =
    useState("");
  const [isProjectFundedResult, setIsProjectFundedResult] = useState("");
  const [noOfFundedProjectsResult, setNoOfFundedProjectsResult] = useState("");
  const [noOfProjectProposalsResult, setNoOfProjectProposalsResult] =
    useState("");
  const [projectInfoResult, setProjectInfoResult] = useState(null);
  const [projectNextTLPaymentResult, setProjectNextTLPaymentResult] =
    useState("");
  const [projectOwnerResult, setProjectOwnerResult] = useState("");
  const [tlReceivedByProjectResult, setTlReceivedByProjectResult] =
    useState("");
  const [noOfSurveysResult, setNoOfSurveysResult] = useState("");
  const [surveyInfoResult, setSurveyInfoResult] = useState(null);
  const [surveyOwnerResult, setSurveyOwnerResult] = useState("");
  const [surveyResultsResult, setSurveyResultsResult] = useState(null);

  const [testMintToAddress, setTestMintToAddress] = useState("");
  const [testMintMgovAmount, setTestMintMgovAmount] = useState("");
  const [testMintTlAmount, setTestMintTlAmount] = useState("");

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
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (contractInstance) {
      fetchInitialData();
      fetchMemberCount();
    }
  }, [contractInstance]);

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
          setMessage("Wallet connected successfully!");
        }
      } catch (error) {
        console.error("Error connecting wallet:", error);
        setMessage(`Error connecting wallet: ${error.message}`);
        alert(`Error connecting wallet: ${error.message}`);
      }
    } else {
      alert("Please install MetaMask.");
      setMessage("Please install MetaMask.");
    }
  };

  const fetchInitialData = async () => {
    if (!contractInstance) return;
    try {
      const name = await contractInstance.name();
      setTokenName(name);
      const symbol = await contractInstance.symbol();
      setTokenSymbol(symbol);
      const decimals = await contractInstance.decimals();
      setTokenDecimals(Number(decimals)); // Convert BigInt to Number for decimals
      const supply = await contractInstance.balanceOf(diamondAddress);
      setAvailableSupply(supply.toString());
      const max = await contractInstance.MAX_SUPPLY();
      setMaxSupply(max.toString());
    } catch (error) {
      console.log("Error fetching initial data:", error);
      setMessage(`Error fetching initial data: ${error.message}`);
    }
  };

  const handleGenericWrite = async (methodName, args = [], successMessage) => {
    if (!contractInstance || !signer)
      return alert("Connect wallet and ensure signer is available.");
    setMessage(`Processing ${methodName}...`);
    try {
      const tx = await contractInstance[methodName](...args);
      await tx.wait();
      setMessage(successMessage || `${methodName} successful!`);
      fetchInitialData();
      fetchMemberCount();
    } catch (error) {
      // console.error(`Error in ${methodName}:`, error);
      const rawErrorMessage = error.data?.message || error.message;
      const errorMessage = rawErrorMessage.split("(action")[0];
      setMessage(`Error ${errorMessage}`);
      alert(errorMessage);
    }
  };

  const handleGenericRead = async (methodName, setResult, args = []) => {
    if (!contractInstance) return alert("Contract not initialized.");
    setMessage(`Workspaceing ${methodName}...`);
    try {
      const result = await contractInstance[methodName](...args);

      if (typeof result === "bigint" || result._isBigNumber) {
        setResult(result.toString());
      } else if (Array.isArray(result)) {
        // Handle structs or multiple return values if they are plain arrays
        if (result.length > 0 && typeof result[0] === "bigint") {
          setResult(result.map((val) => val.toString()));
        } else if (
          typeof result === "object" &&
          result !== null &&
          !Array.isArray(result)
        ) {
          // Handle named return values (structs)
          const formattedResult = {};
          for (const key in result) {
            if (
              Object.hasOwnProperty.call(result, key) &&
              isNaN(parseInt(key))
            ) {
              // Check if key is not a numerical index
              formattedResult[key] =
                typeof result[key] === "bigint"
                  ? result[key].toString()
                  : result[key];
              if (Array.isArray(formattedResult[key])) {
                formattedResult[key] = formattedResult[key].map((item) =>
                  typeof item === "bigint" ? item.toString() : item
                );
              }
            }
          }
          setResult(formattedResult);
        } else {
          setResult(result);
        }
      } else if (typeof result === "object" && result !== null) {
        // For structs
        const formattedResult = {};
        // Ethers v6 returns named properties for structs
        for (const key in result) {
          if (isNaN(parseInt(key))) {
            // Filter out array indices if present
            formattedResult[key] =
              typeof result[key] === "bigint"
                ? result[key].toString()
                : result[key];
            if (Array.isArray(formattedResult[key])) {
              // if a field is an array of bigints
              formattedResult[key] = formattedResult[key].map((item) =>
                typeof item === "bigint" ? item.toString() : item
              );
            }
          }
        }
        setResult(formattedResult);
      } else {
        setResult(result);
      }
      setMessage(`${methodName} fetched successfully.`);
    } catch (error) {
      console.error(`Error fetching ${methodName}:`, error);
      setMessage(`Error fetching ${methodName}: ${error.message}`);
      setResult(null); // Or some error indicator
    }
  };

  const handleTestMintBoth = async () => {
    if (!testMintToAddress || !testMintMgovAmount || !testMintTlAmount) {
      alert("Please fill in all fields for Test Mint Both.");
      return;
    }
    if (!ethers.isAddress(testMintToAddress)) {
      alert("Invalid 'To Address' for Test Mint Both.");
      return;
    }

    try {
      // Assuming mgovAmount and tlAmount should be parsed with the contract's main token decimals
      // If TLToken has different decimals, adjust parsing for parsedTlAmount accordingly.
      const parsedMgovAmount = ethers.parseUnits(
        testMintMgovAmount,
        tokenDecimals || 18
      );
      const parsedTlAmount = ethers.parseUnits(
        testMintTlAmount,
        tokenDecimals || 18
      ); // Adjust if TL has different decimals

      await handleGenericWrite(
        "testMintBoth",
        [testMintToAddress, parsedMgovAmount, parsedTlAmount],
        "testMintBoth successful!"
      );
      // Clear inputs after successful transaction
      setTestMintToAddress("");
      setTestMintMgovAmount("");
      setTestMintTlAmount("");
    } catch (error) {
      // Error is already handled by handleGenericWrite, but you can add specific logic here if needed
      console.error("Error in handleTestMintBoth:", error);
      // setMessage is handled by handleGenericWrite
    }
  };

  // Specific handlers
  const handleFaucet = async () => {
    await handleGenericWrite("faucet", [], "Faucet claimed successfully!");
  };

  const fetchMemberCount = async () => {
    await handleGenericRead("getMemberCount", setMemberCount);
  };

  // Helper to parse comma-separated uint256 arrays
  const parseUintArrayString = (str) => {
    if (!str) return [];
    return str.split(",").map((s) => ethers.toBigInt(s.trim()));
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
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "900px",
        margin: "auto",
      }}
    >
      <navbar
        className="navbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          paddingBottom: "10px",
          borderBottom: "1px solid #ccc",
        }}
      >
        <div>
          <strong>MyGov: Karatas-Senkal-Aydemir</strong>
        </div>
        <div>Connected:{account}</div>
      </navbar>
      <div>
        {message && (
          <p
            style={{
              color: message.startsWith("Error") ? "red" : "green",
              backgroundColor: "#f0f0f0",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "15px",
            }}
          >
            {message}
          </p>
        )}

        {/* <hr /> */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "transparent",
            border: "none",
            padding: 0,
          }}
        >
          <h2>{`${tokenName} (${memberCount} members)`}</h2>
          <button
            onClick={() => {
              fetchInitialData();
              fetchMemberCount();
            }}
          >
            Refresh Token Info
          </button>
        </div>

        <p>
          Available Supply:{" "}
          {availableSupply
            ? ethers.formatUnits(availableSupply, tokenDecimals || 18)
            : "Loading..."}{" "}
          {tokenSymbol}
        </p>
        <p>
          Max Supply:{" "}
          {maxSupply
            ? ethers.formatUnits(maxSupply, tokenDecimals || 18)
            : "Loading..."}{" "}
          {tokenSymbol}
        </p>

        <hr />
        <h2>Faucet & Membership</h2>
        <button onClick={handleFaucet}>Claim Faucet Tokens</button>

        <p>Member Count: {memberCount.toString()}</p>
        <div>
          <input
            type="text"
            placeholder="User Address"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
          />
          <button
            onClick={() =>
              handleGenericRead("hasClaimedFaucet", setHasClaimedFaucetResult, [
                addressInput,
              ])
            }
          >
            Has Claimed Faucet?
          </button>
          {hasClaimedFaucetResult !== "" && (
            <p>Has Claimed: {hasClaimedFaucetResult.toString()}</p>
          )}
        </div>
        <div>
          <input
            type="text"
            placeholder="User Address"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
          />
          <button
            onClick={() =>
              handleGenericRead("isContractMember", setIsContractMemberResult, [
                addressInput,
              ])
            }
          >
            Is Contract Member?
          </button>
          {isContractMemberResult !== "" && (
            <p>Is Member: {isContractMemberResult.toString()}</p>
          )}
        </div>
        <div>
          <h4>Update Membership On Transfer (Admin)</h4>
          <input
            type="text"
            placeholder="Sender Address"
            value={addressFromInput}
            onChange={(e) => setAddressFromInput(e.target.value)}
          />
          <input
            type="text"
            placeholder="Recipient Address"
            value={addressToInput}
            onChange={(e) => setAddressToInput(e.target.value)}
          />
          <input
            type="text"
            placeholder="Amount"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
          />
          <button
            onClick={() =>
              handleGenericWrite("updateMembershipOnTransfer", [
                addressFromInput,
                addressToInput,
                ethers.parseUnits(amountInput || "0", tokenDecimals || 18),
              ])
            }
          >
            Update Membership
          </button>
        </div>
        <hr />
        <h2>Token Operations</h2>
        <div>
          <h4>Balance Of</h4>
          <input
            type="text"
            placeholder="Account Address"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
          />
          <button
            onClick={() =>
              handleGenericRead("balanceOf", setBalanceOfResult, [addressInput])
            }
          >
            Get Balance
          </button>
          {balanceOfResult && (
            <p>
              Balance:{" "}
              {ethers.formatUnits(balanceOfResult, tokenDecimals || 18)}{" "}
              {tokenSymbol}
            </p>
          )}
        </div>
        <div>
          <h4>Approve</h4>
          <input
            type="text"
            placeholder="Spender Address"
            value={spenderAddressInput}
            onChange={(e) => setSpenderAddressInput(e.target.value)}
          />
          <input
            type="text"
            placeholder={`Amount (in ${tokenSymbol})`}
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
          />
          <button
            onClick={() =>
              handleGenericWrite(
                "approve",
                [
                  spenderAddressInput,
                  ethers.parseUnits(amountInput || "0", tokenDecimals || 18),
                ],
                "Approval successful!"
              )
            }
          >
            Approve
          </button>
        </div>
        <div>
          <h4>Allowance</h4>
          <input
            type="text"
            placeholder="Owner Address"
            value={ownerAddressInput}
            onChange={(e) => setOwnerAddressInput(e.target.value)}
          />
          <input
            type="text"
            placeholder="Spender Address"
            value={spenderAddressInput}
            onChange={(e) => setSpenderAddressInput(e.target.value)}
          />
          <button
            onClick={() =>
              handleGenericRead("allowance", setAllowanceResult, [
                ownerAddressInput,
                spenderAddressInput,
              ])
            }
          >
            Get Allowance
          </button>
          {allowanceResult && (
            <p>
              Allowance:{" "}
              {ethers.formatUnits(allowanceResult, tokenDecimals || 18)}{" "}
              {tokenSymbol}
            </p>
          )}
        </div>
        <div>
          <h4>Transfer to Account</h4>
          <input
            type="text"
            placeholder="To Address"
            value={addressToInput}
            onChange={(e) => setAddressToInput(e.target.value)}
          />
          <input
            type="text"
            placeholder={`Amount (in ${tokenSymbol})`}
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
          />
          <button
            onClick={() =>
              handleGenericWrite(
                "transfer",
                [
                  addressToInput,
                  ethers.parseUnits(amountInput || "0", tokenDecimals || 18),
                ],
                "Transfer successful!"
              )
            }
          >
            Transfer
          </button>
        </div>

        <div>
          <h4>Transfer Faucet Token (likely internal or specific use)</h4>
          <input
            type="text"
            placeholder="To Address"
            value={addressToInput}
            onChange={(e) => setAddressToInput(e.target.value)}
          />
          <input
            type="text"
            placeholder="Amount"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
          />
          <button
            onClick={() =>
              handleGenericWrite("transferFaucetToken", [
                addressToInput,
                ethers.parseUnits(amountInput || "0", tokenDecimals || 18),
              ])
            }
          >
            Transfer Faucet Token
          </button>
        </div>

        <hr />
        <h2>Donations</h2>
        <div>
          <h4>Donate MyGovToken</h4>
          <input
            type="text"
            placeholder={`Amount (in ${tokenSymbol})`}
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
          />
          <button
            onClick={() =>
              handleGenericWrite(
                "donateMyGovToken",
                [ethers.parseUnits(amountInput || "0", tokenDecimals || 18)],
                "MyGovToken donation successful!"
              )
            }
          >
            Donate MyGovToken
          </button>
        </div>
        <div>
          <h4>
            Donate TLToken (Assuming TLToken has similar decimals or is a
            different token)
          </h4>
          <input
            type="text"
            placeholder="Amount (smallest unit)"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
          />
          <button
            onClick={() =>
              handleGenericWrite(
                "donateTLToken",
                [amountInput],
                "TLToken donation successful!"
              )
            }
          >
            Donate TLToken
          </button>
        </div>

        <hr />
        <h2> Project Proposals & Voting</h2>
        <div>
          <h4>Submit Project Proposal</h4>
          <input
            type="text"
            placeholder="Web URL"
            value={webUrlInput}
            onChange={(e) => setWebUrlInput(e.target.value)}
          />
          <input
            type="text"
            placeholder="Vote Deadline (Unix Timestamp)"
            value={deadlineInput}
            onChange={(e) => setDeadlineInput(e.target.value)}
          />
          <input
            type="text"
            placeholder="Payment Amounts (comma-sep, smallest unit)"
            value={paymentAmountsInput}
            onChange={(e) => setPaymentAmountsInput(e.target.value)}
          />
          <input
            type="text"
            placeholder="Payment Schedule (comma-sep, timestamps)"
            value={payScheduleInput}
            onChange={(e) => setPayScheduleInput(e.target.value)}
          />
          <button
            onClick={() =>
              handleGenericWrite(
                "submitProjectProposal",
                [
                  webUrlInput,
                  deadlineInput,
                  parseUintArrayString(paymentAmountsInput),
                  parseUintArrayString(payScheduleInput),
                ],
                "Project proposal submitted!"
              )
            }
          >
            Submit Proposal
          </button>
        </div>
        <div>
          <h4>Delegate Vote</h4>
          <input
            type="text"
            placeholder="Delegate Address"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
          />
          <input
            type="text"
            placeholder="Project ID"
            value={projectIdInput}
            onChange={(e) => setProjectIdInput(e.target.value)}
          />
          <button
            onClick={() =>
              handleGenericWrite(
                "delegateVoteTo",
                [addressInput, projectIdInput],
                "Vote delegated!"
              )
            }
          >
            Delegate Vote
          </button>
        </div>
        <div>
          <h4>Vote for Project Proposal</h4>
          <input
            type="text"
            placeholder="Project ID"
            value={projectIdInput}
            onChange={(e) => setProjectIdInput(e.target.value)}
          />
          <select
            value={voteChoiceInput.toString()}
            onChange={(e) => setVoteChoiceInput(e.target.value === "true")}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <button
            onClick={() =>
              handleGenericWrite(
                "voteForProjectProposal",
                [projectIdInput, voteChoiceInput],
                "Voted for proposal!"
              )
            }
          >
            Vote on Proposal
          </button>
        </div>
        <div>
          <h4>Vote for Project Payment</h4>
          <input
            type="text"
            placeholder="Project ID"
            value={projectIdInput}
            onChange={(e) => setProjectIdInput(e.target.value)}
          />
          <select
            value={voteChoiceInput.toString()}
            onChange={(e) => setVoteChoiceInput(e.target.value === "true")}
          >
            <option value="true">Approve Payment</option>
            <option value="false">Reject Payment</option>
          </select>
          <button
            onClick={() =>
              handleGenericWrite(
                "voteForProjectPayment",
                [projectIdInput, voteChoiceInput],
                "Voted on payment!"
              )
            }
          >
            Vote on Payment
          </button>
        </div>
        <div>
          <h4>Reserve Project Grant</h4>
          <input
            type="text"
            placeholder="Project ID"
            value={projectIdInput}
            onChange={(e) => setProjectIdInput(e.target.value)}
          />
          <button
            onClick={() =>
              handleGenericWrite(
                "reserveProjectGrant",
                [projectIdInput],
                "Project grant reserved!"
              )
            }
          >
            Reserve Grant
          </button>
        </div>
        <div>
          <h4>Withdraw Project TL Payment</h4>
          <input
            type="text"
            placeholder="Project ID"
            value={projectIdInput}
            onChange={(e) => setProjectIdInput(e.target.value)}
          />
          <button
            onClick={() =>
              handleGenericWrite(
                "withdrawProjectTLPayment",
                [projectIdInput],
                "Payment withdrawn!"
              )
            }
          >
            Withdraw Payment
          </button>
        </div>
        <div>
          <h4>Project Information</h4>
          <button
            onClick={() =>
              handleGenericRead(
                "getNoOfProjectProposals",
                setNoOfProjectProposalsResult
              )
            }
          >
            Get # Project Proposals
          </button>
          {noOfProjectProposalsResult && (
            <p>Number of Proposals: {noOfProjectProposalsResult.toString()}</p>
          )}
          <br />
          <button
            onClick={() =>
              handleGenericRead(
                "getNoOfFundedProjects",
                setNoOfFundedProjectsResult
              )
            }
          >
            Get # Funded Projects
          </button>
          {noOfFundedProjectsResult && (
            <p>
              Number of Funded Projects: {noOfFundedProjectsResult.toString()}
            </p>
          )}
          <br />
          <input
            type="text"
            placeholder="Project ID"
            value={projectIdInput}
            onChange={(e) => setProjectIdInput(e.target.value)}
          />
          <button
            onClick={() =>
              handleGenericRead(
                "getIsProjectFunded",
                setIsProjectFundedResult,
                [projectIdInput]
              )
            }
          >
            Is Project Funded?
          </button>
          {isProjectFundedResult !== "" && (
            <p>Funded: {isProjectFundedResult.toString()}</p>
          )}
          <button
            onClick={() =>
              handleGenericRead("getProjectOwner", setProjectOwnerResult, [
                projectIdInput,
              ])
            }
          >
            Get Project Owner
          </button>
          {projectOwnerResult && <p>Owner: {projectOwnerResult}</p>}
          <button
            onClick={() =>
              handleGenericRead(
                "getProjectNextTLPayment",
                setProjectNextTLPaymentResult,
                [projectIdInput]
              )
            }
          >
            Get Next TL Payment
          </button>
          {projectNextTLPaymentResult && (
            <p>Next TL Payment: {projectNextTLPaymentResult.toString()}</p>
          )}
          <button
            onClick={() =>
              handleGenericRead(
                "getTLReceivedByProject",
                setTlReceivedByProjectResult,
                [projectIdInput]
              )
            }
          >
            Get TL Received
          </button>
          {tlReceivedByProjectResult && (
            <p>Total TL Received: {tlReceivedByProjectResult.toString()}</p>
          )}
          <button
            onClick={() =>
              handleGenericRead("getProjectInfo", setProjectInfoResult, [
                projectIdInput,
              ])
            }
          >
            Get Project Info
          </button>
          {projectInfoResult && (
            <pre
              style={{
                backgroundColor: "#eee",
                padding: "10px",
                borderRadius: "5px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {JSON.stringify(projectInfoResult, null, 2)}
            </pre>
          )}
        </div>

        <hr />
        <h2>Surveys</h2>
        <div>
          <h4>Submit Survey</h4>
          <input
            type="text"
            placeholder="Web URL"
            value={webUrlInput}
            onChange={(e) => setWebUrlInput(e.target.value)}
          />
          <input
            type="text"
            placeholder="Survey Deadline (Unix Timestamp)"
            value={deadlineInput}
            onChange={(e) => setDeadlineInput(e.target.value)}
          />
          <input
            type="text"
            placeholder="Number of Choices"
            value={surveyNumChoicesInput}
            onChange={(e) => setSurveyNumChoicesInput(e.target.value)}
          />
          <input
            type="text"
            placeholder="At Most Choices Allowed"
            value={surveyAtMostChoicesInput}
            onChange={(e) => setSurveyAtMostChoicesInput(e.target.value)}
          />
          <button
            onClick={() =>
              handleGenericWrite(
                "submitSurvey",
                [
                  webUrlInput,
                  deadlineInput,
                  surveyNumChoicesInput,
                  surveyAtMostChoicesInput,
                ],
                "Survey submitted!"
              )
            }
          >
            Submit Survey
          </button>
        </div>
        <div>
          <h4>Take Survey</h4>
          <input
            type="text"
            placeholder="Survey ID"
            value={surveyIdInput}
            onChange={(e) => setSurveyIdInput(e.target.value)}
          />
          <input
            type="text"
            placeholder="Choices (comma-separated indices)"
            value={surveyChoicesInput}
            onChange={(e) => setSurveyChoicesInput(e.target.value)}
          />
          <button
            onClick={() =>
              handleGenericWrite(
                "takeSurvey",
                [surveyIdInput, parseUintArrayString(surveyChoicesInput)],
                "Survey taken!"
              )
            }
          >
            Take Survey
          </button>
        </div>
        <div>
          <h4>Survey Information</h4>
          <button
            onClick={() =>
              handleGenericRead("getNoOfSurveys", setNoOfSurveysResult)
            }
          >
            Get # Surveys
          </button>
          {noOfSurveysResult && (
            <p>Number of Surveys: {noOfSurveysResult.toString()}</p>
          )}
          <br />
          <input
            type="text"
            placeholder="Survey ID"
            value={surveyIdInput}
            onChange={(e) => setSurveyIdInput(e.target.value)}
          />
          <button
            onClick={() =>
              handleGenericRead("getSurveyOwner", setSurveyOwnerResult, [
                surveyIdInput,
              ])
            }
          >
            Get Survey Owner
          </button>
          {surveyOwnerResult && <p>Owner: {surveyOwnerResult}</p>}
          <button
            onClick={() =>
              handleGenericRead("getSurveyInfo", setSurveyInfoResult, [
                surveyIdInput,
              ])
            }
          >
            Get Survey Info
          </button>
          {surveyInfoResult && (
            <pre
              style={{
                backgroundColor: "#eee",
                padding: "10px",
                borderRadius: "5px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {JSON.stringify(surveyInfoResult, null, 2)}
            </pre>
          )}
          <button
            onClick={() =>
              handleGenericRead("getSurveyResults", setSurveyResultsResult, [
                surveyIdInput,
              ])
            }
          >
            Get Survey Results
          </button>
          {surveyResultsResult && (
            <pre
              style={{
                backgroundColor: "#eee",
                padding: "10px",
                borderRadius: "5px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {JSON.stringify(surveyResultsResult, null, 2)}
            </pre>
          )}
        </div>

        <hr />
        <h2>Test Functions (Admin)</h2>
        <div>
          <h4>Test Mint Both (MGov & TL Tokens)</h4>
          <input
            type="text"
            placeholder="To Address"
            value={testMintToAddress}
            onChange={(e) => setTestMintToAddress(e.target.value)}
            style={{ width: "300px", marginRight: "10px" }}
          />
          <input
            type="text"
            placeholder={`MGov Amount (in ${tokenSymbol || "tokens"})`}
            value={testMintMgovAmount}
            onChange={(e) => setTestMintMgovAmount(e.target.value)}
            style={{ marginRight: "10px" }}
          />
          <input
            type="text"
            placeholder="TL Amount (smallest unit or token unit)" // Clarify if TL has different decimals
            value={testMintTlAmount}
            onChange={(e) => setTestMintTlAmount(e.target.value)}
            style={{ marginRight: "10px" }}
          />
          <button onClick={handleTestMintBoth}>Test Mint Both</button>
          <p style={{ fontSize: "0.8em", color: "#555" }}>
            Note: MGov Amount will be parsed using{" "}
            {tokenDecimals !== null
              ? `${tokenDecimals} decimals`
              : "default 18 decimals"}
            . Ensure TL Amount is also entered considering its appropriate
            decimal places (currently assumed same as MGov or default 18).
          </p>
        </div>

        <style jsx>{`
          // .container {
          //   padding: 20px;
          //   font-family: Arial, sans-serif;
          //   max-width: 900px;
          //   margin: auto;
          // }

          .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
          }
          h2,
          h3,
          h4 {
            margin-top: 30px;
            margin-bottom: 10px;
            color: #333;
          }
          hr {
            margin-top: 30px;
            margin-bottom: 30px;
            border: 0;
            border-top: 1px solid #eee;
          }
          input[type="text"],
          input[type="number"],
          select {
            padding: 8px;
            margin: 5px 5px 5px 0;
            border: 1px solid #ccc;
            border-radius: 4px;
            min-width: 150px;
          }
          button {
            padding: 10px 15px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px;
            font-size: 14px;
          }
          button:hover {
            background-color: #0056b3;
          }
          div > div {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            background-color: #f9f9f922;
          }
          p {
            margin: 5px 0;
            color: #555;
          }
          pre {
            background-color: #eee;
            padding: 10px;
            border-radius: 5px;
            white-space: pre-wrap;
            word-break: break-all;
            border: 1px solid #ddd;
          }
        `}</style>
      </div>
    </main>
  );
}
