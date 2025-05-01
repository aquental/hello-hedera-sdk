const { Client, PrivateKey, Hbar, AccountCreateTransaction, AccountBalanceQuery, TransferTransaction } = require('@hashgraph/sdk');
const dotenv = require('dotenv');

async function environmentSetup() {
    /**
     * Reads the .env file and loads the data into two variables: 
     * myAccountId (MY_ACCOUNT_ID) and myPrivateKey (MY_PRIVATE_KEY).
     * 
     * Throws:
     *   Error: If the .env file does not exist.
     */
    try {
        dotenv.config();
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error('Could not load information from .env');
        } else {
            throw error;
        }
    }

    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    if (!myAccountId || !myPrivateKey) {
        throw new Error('Could not load information from .env');
    }

    //return { myAccountId, myPrivateKey };
    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);
    client.setDefaultMaxTransactionFee(new Hbar(100));
    client.setDefaultMaxQueryPayment(new Hbar(50));

    //New Account Keys
    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    const newAccount = await new AccountCreateTransaction()
        .setKey(newAccountPublicKey)
        .setInitialBalance(Hbar.fromTinybars(1000))
        .execute(client);

    const getReceipt = await newAccount.getReceipt(client);
    const newAccountId = getReceipt.accountId;

    console.log(`- The new account ID is ${newAccountId}`);

    const accountBalance = await new AccountBalanceQuery()
        .setAccountId(newAccountId)
        .execute(client);

    console.log(`- The new account balance is ${accountBalance.hbars.toTinybars()} tinybar`);

    //Create the transfer transaction
    const transferTransaction = await new TransferTransaction()
        .addHbarTransfer(myAccountId, Hbar.fromTinybars(-1000))
        .addHbarTransfer(newAccountId, Hbar.fromTinybars(1000))
        .execute(client);

    const transactionReceipt = await transferTransaction.getReceipt(client);
    console.log(`- The transfer transaction status is ${transactionReceipt.status.toString()}`);
}

environmentSetup();


