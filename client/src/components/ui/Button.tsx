import type { ComponentPropsWithoutRef } from "react";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
    variant?: "primary" | "secondary" | "danger";
    size?: "sm" | "md";
};

const variantStyles = {
    primary: `
        border-[#0f4d3c] bg-[#0f4d3c] text-white +
        enabled:hover:bg-[#16734b] +
        focus-visible:outline-[#0f4d3c]`,
    
    secondary: `
        border-[#0f4d3c] bg-white text-[#0f4d3c] +
        enabled:hover:bg-[#0f4d3c] enabled:hover:text-white +
        focus-visible:outline-[#0f4d3c]`,
    
    danger: `
        border-red-200 bg-white text-red-700 +
        enabled:hover:bg-red-700 enabled:hover:text-white +
        focus-visible:outline-red-700`
};

const sizeStyles = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-sm"
};

function Button({
    variant = "primary",
    size = "md",
    type = "button",
    className= "",
    children,
    ...props
}: ButtonProps) {
    return(
        <button
            {...props}
            type={type}
            className={`
                inline-flex cursor-pointer
                items-center justify-center gap-2
                rounded-lg border border-solid font-semibold
                [font-family:inherit]
                transition-colors duration-200
                focus-visible:outline-2
                focus-visible:outline-offset-2
                disabled:cursor-wait disabled:opacity-60
                ${variantStyles[variant]}
                ${sizeStyles[size]}
                ${className}
            `}
        >
            {children}
        </button>
    );
}

export default Button;