export function cn(...inputs: any[]): string {
    return inputs
        .flatMap(input =>
            typeof input === 'string'
                ? input.trim().split(' ').filter(Boolean)
                : input || []
        )
        .join(' ');
}

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