import {Plus} from "lucide-react";
import Button from "./ui/Button";

type AddTransactionLinkProps = {
    onClick: () => void;
};

function AddTransactionLink({
    onClick
}: AddTransactionLinkProps) {
    return (
        <Button onClick={onClick} className="shrink-0">
            <Plus aria-hidden="true" className="h-5 w-5"/>
            <span>Add transaction</span>
        </Button>
    );

}

export default AddTransactionLink;
