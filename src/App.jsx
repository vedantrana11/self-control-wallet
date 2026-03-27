import { useState } from "react";
import { getContract } from "./contract";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

let timer; // ✅ global timer fix

function App() {
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [time, setTime] = useState("");
  const [balance, setBalance] = useState("0");
  const [remaining, setRemaining] = useState(0);

  // 🔗 Connect wallet
  const connectWallet = async () => {
    const acc = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(acc[0]);
    loadData(acc[0]);
    toast.success("Wallet connected 🚀");
  };

  // 📊 Load contract data (FIXED)
  const loadData = async (user) => {
    try {
      const contract = await getContract();
      const data = await contract.getLockDetails(user);

      const amount = data[0];
      const unlockTime = data[1];

      setBalance(ethers.formatEther(amount));
      updateTimer(Number(unlockTime));
    } catch (err) {
      console.log("Load error:", err);
    }
  };

  // ⏳ Timer (FIXED)
  const updateTimer = (unlockTime) => {
    if (timer) clearInterval(timer);

    timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = unlockTime - now;

      if (diff <= 0) {
        setRemaining(0);
        clearInterval(timer);
      } else {
        setRemaining(diff);
      }
    }, 1000);
  };

  // 💸 Deposit (FIXED)
  const deposit = async () => {
    try {
      const contract = await getContract();

      const tx = await contract.deposit(
        parseInt(time),
        {
          value: ethers.parseEther(amount.toString())
        }
      );

      await tx.wait();

      toast.success("Funds Locked 🔒");

      loadData(account); // ✅ refresh data

    } catch (err) {
      console.log("ERROR:", err);
      toast.error("Transaction failed ❌");
    }
  };

  // 💸 Withdraw (FIXED)
  const withdraw = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.withdraw();
      await tx.wait();

      toast.success("Withdrawn 💸");

      loadData(account); // ✅ refresh after withdraw

    } catch {
      toast.error("Still locked ⏳");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <Toaster />

      {/* 🌌 Background Glow */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-purple-500/20 blur-[120px]" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-blue-500/20 blur-[120px]" />

      {/* 🧭 Navbar */}
      <div className="flex justify-between items-center px-8 py-5 border-b border-white/10">
        <h1 className="text-xl font-semibold">💸 SC Wallet</h1>
        <button
          onClick={connectWallet}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
        >
          {account ? account.slice(0, 6) + "..." : "Connect"}
        </button>
      </div>

      {/* 🧠 Main */}
      <div className="flex flex-col items-center mt-20">

        <h1 className="text-5xl font-bold mb-3 text-center">
          Control Your Money
        </h1>

        <p className="text-white/60 mb-10 text-center">
          Enforce discipline with blockchain
        </p>

        {/* 🧊 Card */}
        <motion.div className="w-[380px] p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">

          <input
            placeholder="ETH Amount"
            onChange={(e) => setAmount(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-xl bg-white/5 border border-white/10"
          />

          <input
            placeholder="Lock Time (seconds)"
            onChange={(e) => setTime(e.target.value)}
            className="w-full mb-6 px-4 py-3 rounded-xl bg-white/5 border border-white/10"
          />

          <button
            onClick={deposit}
            className="w-full mb-3 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500"
          >
            Lock Funds
          </button>

          <button
            onClick={withdraw}
            className="w-full py-3 rounded-xl bg-white/10"
          >
            Withdraw
          </button>
        </motion.div>

        {/* 📊 Dashboard */}
        <div className="grid grid-cols-2 gap-4 mt-10 w-[380px]">

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-white/50 text-sm">Balance</p>
            <p className="font-semibold mt-1">{balance} ETH</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-white/50 text-sm">Time Left</p>
            <p className="font-semibold mt-1">{remaining}s</p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default App;