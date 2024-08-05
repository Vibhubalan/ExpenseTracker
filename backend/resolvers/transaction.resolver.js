

const transactionResolver={
    Query: {
        transactions: async(_,__,context)=>{
            try {
                if(!context.getUser()) throw new Error("Unauthorized");
                const userId = await context.getUser()._id;

                const transactions = await transactionResolver.find({userId});
                return transactions;


                
            } catch (err) {
                console.error("Error getting Transactions:", err);
            throw new Error("Error getting Transactions");
            }
        },
        transaction: async(_,{transcationId},)=>{
            try {
                const transaction = await Transaction.findById(transactionId);
                return transaction;

            } catch (err) {
                console.error("Error getting Transactions:", err);
                throw new Error("Error getting Transactions");
            }
        },
        //need to make a  category statisitics query
    },
    Mutation: {
        createTreansaction: async(_,{input},context)=>{
            try {
                const newTransaction = new Transaction({
                    ...input,
                    userId: context.getUser()._id
                })
                await newTransaction.save();
                return newTransaction;

                
            } catch (err) {
                console.error("Error creating Transactions:", err);
                throw new Error("Error creating Transactions");
            }
    
        },
        UpdateTransaction: async(_,{input})=>{
            try {
                const updatedTransaction = await Transaction.findByIdAndUpdate(input.transactionId, input, {new:true});
                return updatedTransaction;
            } catch (err) {
                console.error("Error updating Transactions:", err);
                throw new Error("updating Transactions");
            }

        },
        deleteTransaction: async(parent,args,context)=>{
            try {
                const deletedTransaction = await Transaction.findByIdAndDelete(transactionId);
                return deletedTransaction;
            } catch (err) {
                console.error("Error eleting  Transactions:", err);
                throw new Error("deleting  Transactions");
            }
        },
    },
    //need to do transaction/user relationship
};

export default transactionResolver;
