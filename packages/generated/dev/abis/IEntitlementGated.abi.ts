export default [
  {
    "type": "function",
    "name": "getRuleData",
    "inputs": [
      {
        "name": "transactionId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "roleId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct IRuleEntitlementBase.RuleData",
        "components": [
          {
            "name": "operations",
            "type": "tuple[]",
            "internalType": "struct IRuleEntitlementBase.Operation[]",
            "components": [
              {
                "name": "opType",
                "type": "uint8",
                "internalType": "enum IRuleEntitlementBase.CombinedOperationType"
              },
              {
                "name": "index",
                "type": "uint8",
                "internalType": "uint8"
              }
            ]
          },
          {
            "name": "checkOperations",
            "type": "tuple[]",
            "internalType": "struct IRuleEntitlementBase.CheckOperation[]",
            "components": [
              {
                "name": "opType",
                "type": "uint8",
                "internalType": "enum IRuleEntitlementBase.CheckOperationType"
              },
              {
                "name": "chainId",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "contractAddress",
                "type": "address",
                "internalType": "address"
              },
              {
                "name": "threshold",
                "type": "uint256",
                "internalType": "uint256"
              }
            ]
          },
          {
            "name": "logicalOperations",
            "type": "tuple[]",
            "internalType": "struct IRuleEntitlementBase.LogicalOperation[]",
            "components": [
              {
                "name": "logOpType",
                "type": "uint8",
                "internalType": "enum IRuleEntitlementBase.LogicalOperationType"
              },
              {
                "name": "leftOperationIndex",
                "type": "uint8",
                "internalType": "uint8"
              },
              {
                "name": "rightOperationIndex",
                "type": "uint8",
                "internalType": "uint8"
              }
            ]
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "postEntitlementCheckResult",
    "inputs": [
      {
        "name": "transactionId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "roleId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "result",
        "type": "uint8",
        "internalType": "enum IEntitlementGatedBase.NodeVoteStatus"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "EntitlementCheckResultPosted",
    "inputs": [
      {
        "name": "transactionId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "result",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum IEntitlementGatedBase.NodeVoteStatus"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "EntitlementGated_InvalidAddress",
    "inputs": []
  },
  {
    "type": "error",
    "name": "EntitlementGated_InvalidEntitlement",
    "inputs": []
  },
  {
    "type": "error",
    "name": "EntitlementGated_InvalidValue",
    "inputs": []
  },
  {
    "type": "error",
    "name": "EntitlementGated_NodeAlreadyVoted",
    "inputs": []
  },
  {
    "type": "error",
    "name": "EntitlementGated_NodeNotFound",
    "inputs": []
  },
  {
    "type": "error",
    "name": "EntitlementGated_OnlyEntitlementChecker",
    "inputs": []
  },
  {
    "type": "error",
    "name": "EntitlementGated_RequestIdNotFound",
    "inputs": []
  },
  {
    "type": "error",
    "name": "EntitlementGated_TransactionCheckAlreadyCompleted",
    "inputs": []
  },
  {
    "type": "error",
    "name": "EntitlementGated_TransactionCheckAlreadyRegistered",
    "inputs": []
  },
  {
    "type": "error",
    "name": "EntitlementGated_TransactionNotRegistered",
    "inputs": []
  }
] as const
