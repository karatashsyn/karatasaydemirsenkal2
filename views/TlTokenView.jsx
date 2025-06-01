import { tlAddress } from "@/constants";
import React, { useState } from "react";
import { ethers } from "ethers";

export default function TlTokenView({ setMessage, contractInstance }) {
  const [amountInput, setAmountInput] = useState("");
  const tokenDecimals = 18;

  const [addressInput, setAddressInput] = useState("");
  const [spenderAddressInput, setSpenderAddressInput] = useState("");
  const [ownerAddressInput, setOwnerAddressInput] = useState("");

  const [allowanceResult, setAllowanceResult] = useState("");
  const [tlBalanceOfResult, setBalanceOfTlResult] = useState("");

  const tokenSymbol = "TLToken";

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

  return (
    <div>
      <h2>TL Specific Operations</h2>
      <div className="card">
        <div>
          <h4>TL Approval</h4>
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

        <div>
          <h4>Donate TLToken</h4>
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
            placeholder="Target Address"
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
              {ethers.formatUnits(allowanceResult, tokenDecimals || 18)} TLToken
            </p>
          )}
        </div>

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
              handleGenericRead("balanceOf", setBalanceOfTlResult, [
                addressInput,
              ])
            }
          >
            Get Balance
          </button>
          {tlBalanceOfResult && (
            <p>
              Balance:{" "}
              {ethers.formatUnits(tlBalanceOfResult, tokenDecimals || 18)} Tl
            </p>
          )}
        </div>
      </div>
      <div
        style={{
          padding: "0.5rem",
        }}
      >
        <p>{`Tl Contract Address: ${tlAddress}`}</p>
      </div>
    </div>
  );
}
