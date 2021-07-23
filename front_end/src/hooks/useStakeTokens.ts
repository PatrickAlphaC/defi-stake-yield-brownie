import { useEffect, useState } from "react"
import { useContractFunction, useEthers } from "@usedapp/core"
import TokenFarm from "../chain-info/TokenFarm.json"
import Erc20 from "../chain-info/ERC20.json"
import { utils, constants } from "ethers"
import { Contract } from "@ethersproject/contracts"
import networkMapping from "../chain-info/map.json"

/**
 * This hook is a bit messy but exposes a 'send' which makes two transactions.
 * The first transaction is to approve the ERC-20 token transfer on the token's contract.
 * Upon successful approval, a second transaction is initiated to execute the transfer by the TokenFarm contract.
 * The 'state' returned by this hook is the state of the first transaction until that has status "Succeeded".
 * After that it is the state of the second transaction.
 * @param tokenAddress - The token address of the token we wish to stake
 */
export const useStakeTokens = (tokenAddress: string) => {
  const { chainId } = useEthers()
  const { abi } = TokenFarm
  const tokenFarmContractAddress = chainId ? networkMapping[String(chainId)]["TokenFarm"][0] : constants.AddressZero

  const tokenFarmInterface = new utils.Interface(abi)

  const tokenFarmContract = new Contract(
    tokenFarmContractAddress,
    tokenFarmInterface
  )

  const { send: stakeTokensSend, state: stakeTokensState } =
    useContractFunction(tokenFarmContract, "stakeTokens", {
      transactionName: "Stake tokens",
    })

  const erc20Interface = new utils.Interface(Erc20.abi)

  const tokenContract = new Contract(tokenAddress, erc20Interface)

  const { send: approveErc20Send, state: approveErc20State } =
    useContractFunction(tokenContract, "approve", {
      transactionName: "Approve ERC20 transfer",
    })

  const [amountToStake, setAmountToStake] = useState("0")

  useEffect(() => {
    if (approveErc20State.status === "Success") {
      stakeTokensSend(amountToStake, tokenAddress)
    }
    // the dependency arry
    // the code inside the useEffect anytime
    // anything in this list changes
    // if you want something to run when the component first runs
    // you just have a blank list
  }, [approveErc20State, amountToStake, tokenAddress]) // eslint-disable-line react-hooks/exhaustive-deps

  const send = (amount: string) => {
    setAmountToStake(amount)
    return approveErc20Send(tokenFarmContractAddress, amount)
  }

  const [state, setState] = useState(approveErc20State)

  useEffect(() => {
    if (approveErc20State.status === "Success") {
      setState(stakeTokensState)
    } else {
      setState(approveErc20State)
    }
  }, [approveErc20State, stakeTokensState])

  return { send, state }
}
