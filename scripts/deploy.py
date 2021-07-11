from brownie import DappToken, TokenFarm
from scripts.helpful_scripts import get_account, get_contract
import shutil


def main():
    account = get_account()
    dapp_token = DappToken.deploy({"from": account})
    token_farm = TokenFarm.deploy(dapp_token.address, {"from": account})
    tx = dapp_token.transfer(
        token_farm.address, dapp_token.totalSupply(), {"from": account}
    )
    tx.wait(1)
    fau_token = get_contract("fau_token")
    weth_token = get_contract("weth_token")

    add_allowed_tokens(
        token_farm,
        {
            dapp_token: get_contract("dai_usd_price_feed"),
            fau_token: get_contract("dai_usd_price_feed"),
            weth_token: get_contract("eth_usd_price_feed"),
        },
    )
    update_front_end()


def add_allowed_tokens(token_farm, dict_of_allowed_token):
    for token in dict_of_allowed_token:
        token_farm.addAllowedTokens(token.address)
        tx = token_farm.setPriceFeedContract(
            token.address, dict_of_allowed_token[token]
        )
        tx.wait(1)


def update_front_end():
    # The build
    src = "./build/contracts/"
    destination = "./front_end/src/abis/"
    shutil.copytree(src, destination)

    # The Contracts
    src = "./contracts/"
    destination = "./front_end/src/contracts/"

