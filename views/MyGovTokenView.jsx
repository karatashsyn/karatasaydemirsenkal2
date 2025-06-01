import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { diamondAddress, tlAddress } from "@/constants";
import { toast } from "sonner";
import {
  datetimeLocalToUnix,
  getReadableDate,
  parseUintArrayString,
  unixToDatetimeLocal,
} from "@/utils";
// Add others similarly

export default function MyGovTokenView({ contractInstance, account }) {
  // General state for messages and results
  const [message, setMessage] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenDecimals, setTokenDecimals] = useState(null);
  const [availableSupply, setAvailableSupply] = useState("");
  const [maxSupply, setMaxSupply] = useState("");
  const [memberCount, setMemberCount] = useState(0);

  const [myMyGovToken, setmyMyGovToken] = useState("");

  // Input states
  const [amountInput, setAmountInput] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [addressToInput, setAddressToInput] = useState("");
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
    if (contractInstance) {
      fetchInitialData();
      fetchMemberCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractInstance]);

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
      await handleGenericRead("balanceOf", setmyMyGovToken, [account]);
      setAvailableSupply(supply.toString());
      const max = await contractInstance.MAX_SUPPLY();
      setMaxSupply(max.toString());
    } catch (error) {
      console.log("Error fetching initial data:", error);
      setMessage(`Error fetching initial data: ${error.message}`);
      toast(`Error fetching initial data: ${error.message}`);
    }
  };

  const handleGenericWrite = async (methodName, args = [], successMessage) => {
    if (!contractInstance)
      return alert("Connect wallet and ensure signer is available.");
    setMessage(`Processing ${methodName}...`);
    try {
      const tx = await contractInstance[methodName](...args);
      await tx.wait();
      setMessage(successMessage || `${methodName} successful!`);
      fetchInitialData();
      fetchMemberCount();
    } catch (error) {
      console.log(`Error in ${methodName}:`, error);
      const rawErrorMessage = error.data?.message || error.message;
      const errorMessage = rawErrorMessage.split("(action")[0];
      setMessage(`Error ${errorMessage}`);
      toast(errorMessage);
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
        // Handling structs or multiple return values if they are plain arrays
        if (result.length > 0 && typeof result[0] === "bigint") {
          setResult(result.map((val) => val.toString()));
        } else if (
          typeof result === "object" &&
          result !== null &&
          !Array.isArray(result)
        ) {
          // Handling named return values (structs)
          const formattedResult = {};
          for (const key in result) {
            if (
              Object.hasOwnProperty.call(result, key) &&
              isNaN(parseInt(key))
            ) {
              // Checking if key is not a numerical index
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
        for (const key in result) {
          if (isNaN(parseInt(key))) {
            // Filter out array indices if present
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
      const parsedMgovAmount = ethers.parseUnits(
        testMintMgovAmount,
        tokenDecimals || 18
      );
      const parsedTlAmount = ethers.parseUnits(
        testMintTlAmount,
        tokenDecimals || 18
      );

      await handleGenericWrite(
        "testMintBoth",
        [testMintToAddress, parsedMgovAmount, parsedTlAmount],
        "testMintBoth successful!"
      );
      setTestMintToAddress("");
      setTestMintMgovAmount("");
      setTestMintTlAmount("");
    } catch (error) {
      console.error("Error in handleTestMintBoth:", error);
    }
  };

  const handleFaucet = async () => {
    await handleGenericWrite("faucet", [], "Faucet claimed successfully!");
  };

  const fetchMemberCount = async () => {
    await handleGenericRead("getMemberCount", setMemberCount);
  };

  return (
    <div
      style={{
        paddingBottom: "1rem",
      }}
    >
      {message && (
        <p
          style={{
            color: message.startsWith("Error") ? "#C53030" : "#2F855A",
            backgroundColor: message.startsWith("Error")
              ? "#FED7D7 "
              : "#C6F6D588",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "15px",
          }}
        >
          {message}
        </p>
      )}

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

      <div
        className="card"
        style={{
          marginBottom: "2rem",
        }}
      >
        <h3
          style={{
            marginBottom: "1rem",
          }}
        >
          General Info
        </h3>
        <p>
          Your Balance:{" "}
          <strong>
            {availableSupply
              ? ethers.formatUnits(myMyGovToken, tokenDecimals || 18)
              : "Loading..."}{" "}
            {tokenSymbol}
          </strong>
        </p>

        <p>
          Available Supply:{" "}
          <strong>
            {availableSupply
              ? ethers.formatUnits(availableSupply, tokenDecimals || 18)
              : "Loading..."}{" "}
            {tokenSymbol}
          </strong>
        </p>
      </div>

      <hr />
      {/* Blocks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
        }}
      >
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3>Faucet & Membership</h3>
            <button
              style={{
                backgroundColor: "white",
                color: "black",
                border: "1px solid #ddd",
              }}
              onClick={handleFaucet}
            >
              Claim Faucet Tokens
            </button>
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
                handleGenericRead(
                  "hasClaimedFaucet",
                  setHasClaimedFaucetResult,
                  [addressInput]
                )
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
                handleGenericRead(
                  "isContractMember",
                  setIsContractMemberResult,
                  [addressInput]
                )
              }
            >
              Is Contract Member?
            </button>
            {isContractMemberResult !== "" && (
              <p>Is Member: {isContractMemberResult.toString()}</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3>Token Operations</h3>
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
              onClick={async () => {
                await handleGenericWrite(
                  "approve",
                  [
                    addressToInput,
                    ethers.parseUnits(amountInput || "0", tokenDecimals || 18),
                  ],
                  "Approval successful!"
                );
                handleGenericWrite(
                  "transfer",
                  [
                    addressToInput,
                    ethers.parseUnits(amountInput || "0", tokenDecimals || 18),
                  ],
                  "Transfer successful!"
                );
              }}
            >
              Transfer
            </button>
          </div>
        </div>

        <div className="card">
          <h3>Approval and Allowance </h3>

          <input
            type="text"
            placeholder="Target Address"
            value={spenderAddressInput}
            onChange={(e) => setSpenderAddressInput(e.target.value)}
          />
          <button
            onClick={() =>
              handleGenericRead("allowance", setAllowanceResult, [
                account,
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
          <div>
            <h4>Approve</h4>
            <input
              type="text"
              placeholder="Target Address"
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
        </div>

        <div className="card">
          <h3>Donations</h3>
          <h4>Donate MyGovToken</h4>
          <input
            type="text"
            placeholder={`Amount (in ${tokenSymbol})`}
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
          />
          <button
            onClick={async () => {
              await handleGenericWrite(
                "approve",
                [
                  diamondAddress,
                  ethers.parseUnits(amountInput || "0", tokenDecimals || 18),
                ],
                "Approval successful!"
              );

              handleGenericWrite(
                "donateMyGovToken",
                [ethers.parseUnits(amountInput || "0", tokenDecimals || 18)],
                "MyGovToken donation successful!"
              );
            }}
          >
            Donate MyGovToken
          </button>
        </div>

        <div
          className="card"
          style={{
            gridColumnStart: 1,
            gridColumnEnd: 3,
          }}
        >
          <h3> Projects</h3>
          <h4>Submit Project Proposal</h4>
          <input
            type="text"
            placeholder="Web URL"
            value={webUrlInput}
            onChange={(e) => setWebUrlInput(e.target.value)}
          />

          <input
            type="datetime-local"
            value={unixToDatetimeLocal(deadlineInput)}
            onChange={(e) => {
              const unix = datetimeLocalToUnix(e.target.value);
              setDeadlineInput(unix);
            }}
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
              <p>
                Number of Proposals: {noOfProjectProposalsResult.toString()}
              </p>
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
              <p>
                Next TL Payment: {getReadableDate(projectNextTLPaymentResult)}
              </p>
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
        </div>

        <div
          className="card"
          style={{
            gridColumnStart: 1,
            gridColumnEnd: 3,
          }}
        >
          <h3>Surveys</h3>
          <div>
            <h4>Submit Survey</h4>
            <input
              type="text"
              placeholder="Web URL"
              value={webUrlInput}
              onChange={(e) => setWebUrlInput(e.target.value)}
            />

            <input
              type="datetime-local"
              value={unixToDatetimeLocal(deadlineInput)}
              onChange={(e) => {
                const unix = datetimeLocalToUnix(e.target.value);
                setDeadlineInput(unix);
              }}
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
                <p>URL: {Object.values(surveyInfoResult ?? {})[0]}</p>
                <p>
                  Deadline:{" "}
                  {getReadableDate(Object.values(surveyInfoResult ?? {})[1])}
                </p>
                <p>
                  Number of choices: {Object.values(surveyInfoResult ?? {})[2]}
                </p>
                <p>
                  Max allowed choices:{" "}
                  {Object.values(surveyInfoResult ?? {})[3]}
                </p>
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
        </div>

        <div
          style={{
            gridColumnStart: 1,
            gridColumnEnd: 3,
          }}
          className="card"
        >
          <h3>Test Functions (Admin)</h3>
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
          <button onClick={handleTestMintBoth}>Transfer Mint for Test</button>
        </div>
      </div>
      <div
        style={{
          padding: "0.5rem",
        }}
      >
        <p>{`MyGov Contract Address: ${diamondAddress}`}</p>
      </div>
    </div>
  );
}
