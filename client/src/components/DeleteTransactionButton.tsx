import DeleteResourceButton from "./DeleteResourceButton";

type DeleteTransactionButtonProps = {
    transactionId: number;
    description: string;
    onDeleted: () => void;
};

function DeleteTransactionButton({
    transactionId, description, onDeleted}: DeleteTransactionButtonProps) {
        return (
            <DeleteResourceButton
                endpoint={`/api/transactions/${transactionId}`}
                resourceName="transaction"
                itemLabel={description}
                onDeleted={onDeleted}
            />
        );
}

export default DeleteTransactionButton;