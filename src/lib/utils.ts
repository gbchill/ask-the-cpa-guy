
/**
 * A utility to join class-names (or arrays of class-names) into a single string.
 */
export function cn(
    ...inputs: (string | string[] | null | undefined)[]
): string {
    return inputs
        .flatMap((input) => {
            if (!input) {
                return [];
            }
            if (Array.isArray(input)) {
                return input;
            }
            return input.trim().split(/\s+/).filter(Boolean);
        })
        .join(' ');
}

/**
 * Format an ISO-style date string as "MMM d, yyyy, h:mm AM/PM".
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(date);
}
