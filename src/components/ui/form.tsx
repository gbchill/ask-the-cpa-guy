import * as React from "react";
import { useForm as useReactHookForm, UseFormReturn, FieldValues, FieldPath } from "react-hook-form";

const Form = React.forwardRef<
    HTMLFormElement,
    React.FormHTMLAttributes<HTMLFormElement> & {
        form: UseFormReturn<any>;
    }
>(({ form, children, className = "", ...props }, ref) => {
    return (
        <form ref={ref} {...props}>
            {children}
        </form>
    );
});
Form.displayName = "Form";

type FormFieldContextValue<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
    name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
    {} as FormFieldContextValue
);

const FormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
    name,
    control,
    render,
}: {
    name: TName;
    control: UseFormReturn<TFieldValues>["control"];
    render: React.ReactNode | ((field: any) => React.ReactElement);
}) => {
    const field = control.register(name);

    return (
        <FormFieldContext.Provider value={{ name }}>
            {typeof render === "function"
                ? render(field)
                : render}
        </FormFieldContext.Provider>
    );
};

const useFormField = () => {
    const fieldContext = React.useContext(FormFieldContext);
    if (!fieldContext) {
        throw new Error("useFormField should be used within a FormField");
    }
    return fieldContext;
};

const FormItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={`space-y-2 ${className}`}
            {...props}
        />
    );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className = "", ...props }, ref) => {
    return (
        <label
            ref={ref}
            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
            {...props}
        />
    );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={`${className}`}
            {...props}
        />
    );
});
FormControl.displayName = "FormControl";

const FormMessage = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", children, ...props }, ref) => {
    const { name } = useFormField();

    return (
        <p
            ref={ref}
            className={`text-sm font-medium text-destructive ${className}`}
            {...props}
        >
            {children}
        </p>
    );
});
FormMessage.displayName = "FormMessage";

export {
    useReactHookForm as useForm,
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormField,
};