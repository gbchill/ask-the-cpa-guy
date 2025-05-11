
import * as React from 'react';
import {
    useForm as useReactHookForm,
    FormProvider,
    UseFormReturn,
    FieldValues,
    FieldPath,
    Control,
    useController,
    UseControllerReturn,
} from 'react-hook-form';

/** Props for a generic RHF-powered form wrapper */
export interface FormProps<TFieldValues extends FieldValues>
    extends React.FormHTMLAttributes<HTMLFormElement> {
    form: UseFormReturn<TFieldValues>;
}

function FormComponent<TFieldValues extends FieldValues>(
    { form, children, onSubmit, ...rest }: FormProps<TFieldValues>,
    ref: React.Ref<HTMLFormElement>
) {
    return (
        <FormProvider {...form}>
            <form ref={ref} onSubmit={onSubmit} {...rest}>
                {children}
            </form>
        </FormProvider>
    );
}

type FormType = (<TFieldValues extends FieldValues>(
    props: FormProps<TFieldValues> & { ref?: React.Ref<HTMLFormElement> }
) => React.ReactElement | null) & { displayName?: string };

export const Form = React.forwardRef(FormComponent) as FormType;
Form.displayName = 'Form';

// We only need a plain string here to verify context usage
const FormFieldContext = React.createContext<{ name: string } | undefined>(
    undefined
);

export function FormField<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>
>(props: {
    name: TName;
    control: Control<TFieldValues>;
    render:
    | React.ReactNode
    | ((field: UseControllerReturn<TFieldValues, TName>['field']) => React.ReactElement);
}) {
    const { name, control, render } = props;
    const { field } = useController({ name, control });

    return (
        <FormFieldContext.Provider value={{ name: String(name) }}>
            {typeof render === 'function' ? render(field) : render}
        </FormFieldContext.Provider>
    );
}

function useFormField() {
    const ctx = React.useContext(FormFieldContext);
    if (!ctx) {
        throw new Error('useFormField must be used inside <FormField>');
    }
    return ctx;
}

export const FormItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
    <div ref={ref} className={`space-y-2 ${className}`} {...props} />
));
FormItem.displayName = 'FormItem';

export const FormLabel = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className = '', ...props }, ref) => (
    <label
        ref={ref}
        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
        {...props}
    />
));
FormLabel.displayName = 'FormLabel';

export const FormControl = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
    <div ref={ref} className={className} {...props} />
));
FormControl.displayName = 'FormControl';

export const FormMessage = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className = '', children, ...props }, ref) => {
    useFormField(); // ensure we're in a <FormField> but we don't actually need `name` here
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
FormMessage.displayName = 'FormMessage';

export { useReactHookForm as useForm };
