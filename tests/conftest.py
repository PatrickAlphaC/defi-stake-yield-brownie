from scripts.helpful_scripts import get_account
from brownie import MockERC20
import pytest
from web3 import Web3


@pytest.fixture
def random_erc20():
    account = get_account()
    erc20 = MockERC20.deploy({"from": account})
    return erc20


@pytest.fixture
def amount_staked():
    return Web3.toWei(1, "ether")
