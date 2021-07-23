from brownie import TokenFarm
from scripts.helpful_scripts import get_account, get_contract


def issue_token():
    account = get_account()
    token_farm = TokenFarm[-1]
    token_farm.issueTokens({"from": account})


def main():
    issue_token()
