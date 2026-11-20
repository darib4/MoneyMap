import DeleteResourceButton from "./DeleteResourceButton";

type DeleteBudgetButtonProps = {
    budgetId: number;
    category: string;
    onDeleted: () => void;
};

function DeleteBudgetButton({
    budgetId,
    category,
    onDeleted
}: DeleteBudgetButtonProps) {
    return(
        <DeleteResourceButton
            endpoint={`/api/budgets/${budgetId}`}
            resourceName="budget"
            itemLabel={category}
            onDeleted={onDeleted}
        />
    );
} 

export default DeleteBudgetButton;