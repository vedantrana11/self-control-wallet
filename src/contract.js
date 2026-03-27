import { ethers } from "ethers";

// ✅ PASTE YOUR DEPLOYED CONTRACT ADDRESS HERE
const contractAddress = "0x78fdEe86942B06f3B7a57DCCb4d07D3B562b5843";

// ✅ KEEP ABI SEPARATE
const abi = [
  "function deposit(uint256 _lockTime) payable",
  "function withdraw()",
  "function getLockDetails(address) view returns (uint256, uint256)",
  "function getRemainingTime(address) view returns (uint256)"
];

export const getContract = async () => {
  if (!window.ethereum) {
    alert("Install MetaMask");
    return;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(
    contractAddress, // ✅ ADDRESS
    abi,             // ✅ ABI
    signer
  );
};