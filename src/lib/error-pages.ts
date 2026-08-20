export const errorPages = {
    '400': {
        title: 'Bad Request',
        message: 'The request could not be understood. Check the address or return to the homepage.',
    },
    '401': {
        title: 'Authentication Required',
        message: 'You need to sign in before you can access this page.',
    },
    '403': {
        title: 'Access Denied',
        message: 'You do not have permission to view this part of the site.',
    },
    '404': {
        title: 'Nothing Here',
        message: 'The page you are looking for does not exist, moved somewhere else, or was never meant to be found.',
    },
    '408': {
        title: 'Request Timed Out',
        message: 'The request took too long to complete. Please try again in a moment.',
    },
    '429': {
        title: 'Too Many Requests',
        message: 'Too many requests arrived at once. Take a short pause and try again.',
    },
    '500': {
        title: 'Something Broke',
        message: 'The request could not be completed. You can try again or return to the homepage.',
    },
    '502': {
        title: 'Bad Gateway',
        message: 'An upstream service returned an invalid response. Please try again shortly.',
    },
    '503': {
        title: 'Temporarily Offline',
        message: 'The service is unavailable right now. It should be back soon.',
    },
    '504': {
        title: 'Gateway Timed Out',
        message: 'An upstream service took too long to respond. Please try again shortly.',
    },
} as const;

export type ErrorCode = keyof typeof errorPages;
